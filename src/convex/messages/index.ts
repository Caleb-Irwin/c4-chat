import { getAuthUserId } from '@convex-dev/auth/server';
import { httpAction, internalMutation, mutation, MutationCtx, query } from '.././_generated/server';
import { ConvexError, v } from 'convex/values';
import { validate } from 'convex-helpers/validators';
import { internal } from '.././_generated/api';
import { streamedOpenRouterRequest } from './streamedRequest';
import { Id } from '../_generated/dataModel';
import { CONF } from '../../conf';

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
	model: v.string()
};

const messageRequestVerifier = v.object(messageRequestObject);
export type MessageRequestObject = typeof messageRequestVerifier.type;

interface openRouterMessages {
	role: 'system' | 'developer' | 'user' | 'assistant' | 'tool';
	content: string;
}

async function getBodyMessage(
	ctx: MutationCtx,
	messageId: Id<'messages'>
): Promise<openRouterMessages[]> {
	const message = await ctx.db.get(messageId);

	const pastMessages = await ctx.db
		.query('messages')
		.withIndex('by_thread', (q) =>
			q.eq('thread', message!.thread).lt('_creationTime', message!._creationTime)
		)
		.collect();

	const messages = [...pastMessages, message!];

	return messages.flatMap((msg, i) => {
		const res: openRouterMessages[] = [];
		if (i === 0) {
			res.push({ role: 'system', content: CONF.systemPrompt.replace('{model}', msg.model) });
		} else if (msg.model !== messages[i - 1].model) {
			res.push({
				role: 'system',
				content: CONF.systemModelChangePrompt.replace('{model}', msg.model)
			});
		}
		res.push({ role: 'user', content: msg.userMessage });
		if (msg.message) res.push({ role: 'assistant', content: msg.message });
		return res;
	});
}

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
		await ctx.db.patch(args.threadId, {
			generating: true,
			lastModified: Date.now()
		});
		if (thread.title === 'New Thread') {
			await ctx.scheduler.runAfter(0, internal.threads.generateThreadName, {
				threadId: args.threadId,
				message: args.userMessage,
				key: process.env.OPENROUTER_API_KEY!
			});
		}

		if (
			!userRow.freeRequestsLeft ||
			!userRow.accountCreditsInCentThousandths ||
			userRow.freeRequestsLeft <= 0 ||
			userRow.accountCreditsInCentThousandths < CONF.costPerMessageInCentThousandths
		) {
			throw new Error('Insufficient credits or requests');
		}
		await ctx.db.patch(args.userId, {
			freeRequestsLeft: userRow.freeRequestsLeft - 1,
			accountCreditsInCentThousandths:
				userRow.accountCreditsInCentThousandths - CONF.costPerMessageInCentThousandths,
			lastModelUsed: args.model
		});

		const modelRow = await ctx.db
			.query('openRouterModels')
			.withIndex('by_open_router_id', (q) => q.eq('id', args.model))
			.first();
		if (!modelRow) {
			console.error('Model not found:', args.model);
			throw new Error('Model not found');
		}
		if (!userRow.openRouterConnected && !CONF.freeModelIds.includes(modelRow.id as any)) {
			throw new Error(
				'That is not a free model, please connect your OpenRouter account to use it.'
			);
		}

		const messageId = await ctx.db.insert('messages', {
			thread: args.threadId,
			userMessage: args.userMessage,
			model: args.model,
			completed: false,
			message: '',
			attachments: []
		});

		const messageBody = {
			model: modelRow.id,
			messages: await getBodyMessage(ctx, messageId),
			stream: true
		};

		return {
			messageId,
			messageBody,
			key: process.env.OPENROUTER_API_KEY!
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
		message: v.string()
	},
	handler: async (ctx, args) => {
		const msg = await ctx.db.get(args.messageId);
		if (!msg)
			return {
				deleted: true
			};
		await ctx.db.patch(args.messageId, { message: args.message });
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

export const setStopped = internalMutation({
	args: {
		messageId: v.id('messages')
	},
	handler: async (ctx, args) => {}
});

export const completeMessage = internalMutation({
	args: {
		messageId: v.id('messages'),
		message: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.messageId, {
			completed: true,
			completionStatus: 'completed',
			message: args.message
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
		const { messageId, messageBody, key } = await ctx.runMutation(internal.messages.startMessage, {
				userId: userId!,
				...req
			}),
			writer = writable.getWriter();

		try {
			let lastChunkUpdate: number | null = null;
			const resString = await streamedOpenRouterRequest({
				body: messageBody,
				openRouterApiKey: key,
				outputWriter: writer,
				onChunkUpdate: async (fullResponseSoFar: string, abort) => {
					const now = Date.now();
					if (lastChunkUpdate === null || now - lastChunkUpdate > 500) {
						lastChunkUpdate = now;
						const { completionStatus, deleted } = await ctx.runMutation(
							internal.messages.updateGeneratingMessage,
							{
								messageId,
								message: fullResponseSoFar
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
				message: resString
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
