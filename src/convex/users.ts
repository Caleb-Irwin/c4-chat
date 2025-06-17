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
