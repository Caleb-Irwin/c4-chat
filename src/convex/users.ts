import { getAuthUserId } from '@convex-dev/auth/server';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getRow = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return null;
		}
		return await ctx.db.get(userId);
	}
});

export const updateOpenRouterKey = mutation({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error('User not authenticated');
		}

		const user = await ctx.db.get(userId);
		if (!user) {
			throw new Error('User not found');
		}

		if (!args.key.startsWith('sk-or-') && args.key !== '') {
			throw new Error('Invalid OpenRouter API key format');
		}

		await ctx.db.patch(userId, {
			openRouterKey: args.key
		});
	}
});

export const deleteAccount = mutation({
	args: {},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error('User not authenticated');
		}

		const user = await ctx.db.get(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Delete all user's threads and messages
		const threads = await ctx.db
			.query('threads')
			.withIndex('by_user_pinned_lastModified', (q) => q.eq('user', userId))
			.collect();

		for (const thread of threads) {
			// Delete all messages in this thread
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_thread_completion', (q) => q.eq('thread', thread._id))
				.collect();

			for (const message of messages) {
				await ctx.db.delete(message._id);
			}

			// Delete the thread
			await ctx.db.delete(thread._id);
		}

		// Finally, delete the user
		await ctx.db.delete(userId);
	}
});
