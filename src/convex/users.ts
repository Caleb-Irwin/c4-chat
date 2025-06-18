import { getAuthUserId } from '@convex-dev/auth/server';
import { query, mutation, internalQuery, action, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

export const getRow = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return null;
		}
		return await ctx.db.get(userId);
	}
});

export const getRowById = internalQuery({
	args: {
		id: v.id('users')
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
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

export const deleteAccount = action({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error('User not authenticated');
		}

		const threads = await ctx.runQuery(internal.threads.getAllThreads, { userId });

		for (const thread of threads) {
			await ctx.runMutation(internal.threads.delByThreadId, { threadId: thread._id });
		}

		await ctx.runMutation(internal.users.deleteUser, { id: userId });
	}
});

export const deleteUser = internalMutation({
	args: {
		id: v.id('users')
	},
	handler: async (ctx, { id }) => {
		const user = (await ctx.db.get(id))!;
		for (const attachment of user.unsentAttachments ?? []) {
			await ctx.storage.delete(attachment.id);
		}

		for await (const doc of ctx.db
			.query('authAccounts')
			.withIndex('userIdAndProvider', (q) => q.eq('userId', id))) {
			await ctx.db.delete(doc._id);
		}

		for await (const doc of ctx.db
			.query('authSessions')
			.withIndex('userId', (q) => q.eq('userId', id))) {
			await ctx.db.delete(doc._id);
		}

		await ctx.db.delete(id);
	}
});
