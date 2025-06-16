import { getAuthUserId } from '@convex-dev/auth/server';
import { httpAction, internalMutation, query } from '.././_generated/server';
import { ConvexError, v } from 'convex/values';
import { validate } from 'convex-helpers/validators';
import { internal } from '.././_generated/api';
import { streamedOpenRouterRequest } from './streamedRequest';

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

const messageRequestObject = {
	threadId: v.id('threads'),
	userMessage: v.string(),
	model: v.string()
};

const messageRequestVerifier = v.object(messageRequestObject);
export type MessageRequestObject = typeof messageRequestVerifier.type;

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
				message: args.userMessage.slice(0, 300)
			});
		}

		if (
			!userRow.freeRequestsLeft ||
			!userRow.accountCreditsInCentThousandths ||
			userRow.freeRequestsLeft <= 0 ||
			userRow.accountCreditsInCentThousandths <= 0
		) {
			throw new Error('Insufficient credits or requests');
		}
		await ctx.db.patch(args.userId, {
			freeRequestsLeft: userRow.freeRequestsLeft - 1,
			accountCreditsInCentThousandths: userRow.accountCreditsInCentThousandths - 100
		});

		const messageId = await ctx.db.insert('messages', {
			thread: args.threadId,
			userMessage: args.userMessage,
			model: args.model,
			completed: false,
			message: '',
			attachments: [],
			developerMessage: undefined
		});

		const messageBody = {
			model: 'google/gemini-2.0-flash-001',
			messages: [{ role: 'user', content: args.userMessage }],
			stream: true
		};

		return {
			messageId,
			messageBody,
			key: process.env.OPENROUTER_API_KEY!
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

export const updateGeneratingMessage = internalMutation({
	args: {
		messageId: v.id('messages'),
		message: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.messageId, { message: args.message });
	}
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

	const req: MessageRequestObject = await request.json();
	if (!validate(messageRequestVerifier, req)) {
		console.error('Invalid request format:', req);
		throw new ConvexError('invalid_request');
	}
	const { messageId, messageBody, key } = await ctx.runMutation(internal.messages.startMessage, {
			userId,
			...req
		}),
		{ readable, writable } = new TransformStream(),
		writer = writable.getWriter();

	try {
		let lastChunkUpdate: number | null = null;
		const resString = await streamedOpenRouterRequest({
			body: messageBody,
			openRouterApiKey: key,
			outputWriter: writer,
			onChunkUpdate: async (fullResponseSoFar: string) => {
				const now = Date.now();
				if (lastChunkUpdate === null || now - lastChunkUpdate > 500) {
					lastChunkUpdate = now;
					await ctx.runMutation(internal.messages.updateGeneratingMessage, {
						messageId,
						message: fullResponseSoFar
					});
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

	void writer.close();

	return new Response(readable, {
		status: 200,
		headers: new Headers({
			'Content-Type': 'text/plain',
			messageId
		})
	});
});
