import { getAuthUserId } from '@convex-dev/auth/server';
import {
	httpAction,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	type MutationCtx,
	query
} from '.././_generated/server';
import { ConvexError, v } from 'convex/values';
import { validate } from 'convex-helpers/validators';
import { internal } from '.././_generated/api';
import { streamedOpenRouterRequest } from './streamedRequest';
import type { Id } from '../_generated/dataModel';
import { CONF } from '../../conf';
import { handleBilling } from './billing';

export const getFinishedMessages = query({
	args: {
		threadId: v.id('threads')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error('User not authenticated.');
		const thread = await ctx.db.get(args.threadId);
		if (!thread) {
			throw new Error('Thread not found');
		}
		if (thread.user !== userId) {
			throw new Error('User does not have permission to access this thread');
		}
		const messages = await ctx.db
			.query('messages')
			.withIndex('by_thread_completion', (q) => q.eq('thread', args.threadId).eq('completed', true))
			.collect();
		return messages;
	}
});

export const getGeneratingMessage = query({
	args: {
		threadId: v.id('threads')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error('User not authenticated.');
		const thread = await ctx.db.get(args.threadId);
		if (!thread) {
			throw new Error('Thread not found');
		}
		if (thread.user !== userId) {
			throw new Error('User does not have permission to access this thread');
		}
		if (!thread.generating) return null;
		const message = await ctx.db
			.query('messages')
			.withIndex('by_thread_completion', (q) =>
				q.eq('thread', args.threadId).eq('completed', false)
			)
			.first();
		return message ?? null;
	}
});

async function ensurePermissions(ctx: MutationCtx, messageId: Id<'messages'>): Promise<void> {
	const userId = await getAuthUserId(ctx);
	if (userId === null) throw new Error('User not authenticated.');

	const message = await ctx.db.get(messageId);
	if (!message) {
		throw new Error('Message not found');
	}
	const thread = await ctx.db.get(message.thread);
	if (!thread) {
		throw new Error('Thread not found');
	}
	if (thread.user !== userId) {
		throw new Error('User does not have permission to access this thread');
	}
}

const messageRequestObject = {
	threadId: v.id('threads'),
	userMessage: v.string(),
	model: v.string(),
	reasoning: v.union(
		v.literal('default'),
		v.literal('low'),
		v.literal('medium'),
		v.literal('high')
	),
	search: v.boolean()
};

const messageRequestVerifier = v.object(messageRequestObject);
export type MessageRequestObject = typeof messageRequestVerifier.type;

interface openRouterMessages {
	role: 'system' | 'developer' | 'user' | 'assistant' | 'tool';
	content:
		| string
		| (
				| { type: 'text'; text: string }
				| { type: 'image_url'; image_url: { url: string } }
				| { type: 'file'; file: { name: string; file_data: string } }
		  )[];
	cache_control?: { type: 'ephemeral' };
}

export const getPastMessages = internalQuery({
	args: {
		messageId: v.id('messages')
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);

		const pastMessages = await ctx.db
			.query('messages')
			.withIndex('by_thread', (q) =>
				q.eq('thread', message!.thread).lt('_creationTime', message!._creationTime)
			)
			.collect();

		return { messages: [...pastMessages, message!], current: message! };
	}
});

export const getMessageBody = internalAction({
	args: {
		messageId: v.id('messages')
	},
	handler: async (ctx, args): Promise<openRouterMessages[]> => {
		const { messages, current } = await ctx.runQuery(internal.messages.getPastMessages, {
			messageId: args.messageId
		});
		const result: openRouterMessages[] = [];

		for (let i = 0; i < messages.length; i++) {
			const msg = messages[i];

			if (i === 0) {
				result.push({
					role: 'system',
					content: CONF.systemPrompt.replace('{model}', msg.modelName ?? msg.model)
				});
			} else if (msg.model !== messages[i - 1].model) {
				result.push({
					role: 'system',
					content: CONF.systemModelChangePrompt.replace('{model}', msg.modelName ?? msg.model)
				});
			}

			const content: openRouterMessages['content'] = [
				{ type: 'text' as const, text: msg.userMessage }
			];
			if (msg.attachments) {
				for (const attachment of msg.attachments) {
					if (attachment.type.startsWith('image/')) {
						content.push({
							type: 'image_url' as const,
							image_url: {
								url: await ctx.runAction(internal.messages.encodeFile.encodeFile, {
									id: attachment.id
								})
							}
						});
					} else {
						content.push({
							type: 'file' as const,
							file: {
								name: attachment.name,
								file_data: await ctx.runAction(internal.messages.encodeFile.encodeFile, {
									id: attachment.id
								})
							}
						});
					}
				}
			}
			result.push({
				role: 'user',
				content
			});

			if (msg.message) {
				result.push({
					role: 'assistant',
					content: msg.message
				});
			}
		}

		const googleOrAnthropic =
			current.model.startsWith('google/') || current.model.startsWith('anthropic/');

		return googleOrAnthropic
			? result.map((msg) => {
					return {
						...msg,
						cache_control: { type: 'ephemeral' }
					} satisfies openRouterMessages;
				})
			: result;
	}
});

export const startMessage = internalMutation({
	args: {
		userId: v.id('users'),
		...messageRequestObject
	},
	handler: async (ctx, args) => {
		const userRow = await ctx.db.get(args.userId);
		if (!userRow) {
			console.error('User not found:', args.userId);
			throw new Error('User not found');
		}
		const thread = await ctx.db.get(args.threadId);
		if (!thread) {
			console.error('Thread not found:', args.threadId);
			throw new Error('Thread not found');
		}

		await handleBilling(ctx, userRow, args.model);

		await ctx.db.patch(args.threadId, {
			generating: true,
			lastModified: Date.now()
		});
		if (thread.title === 'New Thread') {
			await ctx.scheduler.runAfter(0, internal.threads.generateThreadName, {
				threadId: args.threadId,
				message: args.userMessage,
				key: userRow.openRouterKey ?? process.env.OPENROUTER_API_KEY!
			});
		}

		const isPremium = !!userRow.openRouterKey;
		const modelRow = await ctx.db
			.query('modelSummaries')
			.withIndex('by_model_id', (q) => q.eq('id', args.model))
			.first();
		if (!modelRow) {
			console.error('Model not found:', args.model);
			throw new Error('Model not found');
		}
		if (!isPremium && !CONF.freeModelIds.includes(modelRow.id as any)) {
			throw new Error(
				'That is not a free model, please connect your OpenRouter account to use it.'
			);
		}

		const messageId = await ctx.db.insert('messages', {
			thread: args.threadId,
			userMessage: args.userMessage.slice(0, CONF.maxMessageSizeCharacters),
			model: args.model,
			modelName: modelRow.name,
			completed: false,
			message: '',
			reasoning: '',
			attachments: userRow.unsentAttachments?.filter((attachment) => {
				return (
					(modelRow.supportsImages && attachment.type.startsWith('image/')) ||
					attachment.type === 'application/pdf'
				);
			})
		});

		await ctx.db.patch(userRow._id, {
			unsentAttachments: []
		});

		const messageBodyLestMessages = {
			model: modelRow.id,
			reasoning:
				isPremium && args.reasoning !== 'default'
					? {
							effort: args.reasoning,
							exclude: false
						}
					: undefined,
			stream: true
		};

		return {
			messageId,
			messageBodyLestMessages,
			key: userRow.openRouterKey ?? process.env.OPENROUTER_API_KEY!
		};
	}
});

export const stopMessage = mutation({
	args: {
		messageId: v.id('messages')
	},
	handler: async (ctx, args) => {
		await ensurePermissions(ctx, args.messageId);
		const message = await ctx.db.get(args.messageId);
		if (message && !message.completed) {
			await ctx.db.patch(args.messageId, { completionStatus: 'stopped', completed: true });
		}
		const { thread } = (await ctx.db.get(args.messageId))!;
		await ctx.db.patch(thread, { generating: false });
	}
});

export const updateGeneratingMessage = internalMutation({
	args: {
		messageId: v.id('messages'),
		message: v.string(),
		reasoning: v.string()
	},
	handler: async (ctx, args) => {
		const msg = await ctx.db.get(args.messageId);
		if (!msg)
			return {
				deleted: true
			};
		await ctx.db.patch(args.messageId, { message: args.message, reasoning: args.reasoning });
		return {
			completionStatus: msg.completionStatus
		};
	}
});

export const setError = internalMutation({
	args: {
		messageId: v.id('messages')
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.messageId, { completed: true, completionStatus: 'error' });
		const { thread } = (await ctx.db.get(args.messageId))!;
		await ctx.db.patch(thread, { generating: false });
	}
});

export const completeMessage = internalMutation({
	args: {
		messageId: v.id('messages'),
		message: v.string(),
		reasoning: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.messageId, {
			completed: true,
			completionStatus: 'completed',
			message: args.message,
			reasoning: args.reasoning
		});
		const { thread } = (await ctx.db.get(args.messageId))!;
		await ctx.db.patch(thread, { generating: false });
	}
});

export const postMessageHandler = httpAction(async (ctx, request) => {
	const userId = await getAuthUserId(ctx);

	if (userId === null) {
		console.error('User not authenticated');
		return new Response('Forbidden: User not authenticated', { status: 403 });
	}

	const { readable, writable } = new TransformStream();

	async function generate() {
		const req: MessageRequestObject = await request.json();
		if (!validate(messageRequestVerifier, req)) {
			console.error('Invalid request format:', req);
			throw new ConvexError('invalid_request');
		}
		const { messageId, messageBodyLestMessages, key } = await ctx.runMutation(
				internal.messages.startMessage,
				{
					userId: userId!,
					...req
				}
			),
			writer = writable.getWriter();

		const messages = await ctx.runAction(internal.messages.getMessageBody, {
			messageId: messageId
		});

		try {
			let lastChunkUpdate: number | null = null;
			const { message, reasoning } = await streamedOpenRouterRequest({
				body: { messages, ...messageBodyLestMessages },
				openRouterApiKey: key,
				outputWriter: writer,
				onChunkUpdate: async (fullResponseSoFar: string, fullReasoningSoFar, abort) => {
					const now = Date.now();
					if (lastChunkUpdate === null || now - lastChunkUpdate > 500) {
						lastChunkUpdate = now;
						const { completionStatus, deleted } = await ctx.runMutation(
							internal.messages.updateGeneratingMessage,
							{
								messageId,
								message: fullResponseSoFar,
								reasoning: fullReasoningSoFar
							}
						);
						if (completionStatus === 'stopped' || deleted) {
							abort();
						}
					}
				}
			});
			await ctx.runMutation(internal.messages.completeMessage, {
				messageId,
				message,
				reasoning
			});
		} catch (e) {
			console.error('Error in streamedOpenRouterRequest:', e);
			await ctx.runMutation(internal.messages.setError, { messageId });
		}
		await writer.close();
	}

	void generate();

	return new Response(readable, {
		status: 200,
		headers: new Headers({
			'Content-Type': 'text/plain'
		})
	});
});
