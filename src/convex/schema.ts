import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export const completionStatusUnion = v.union(
	v.literal('stopped'),
	v.literal('completed'),
	v.literal('error')
);

export default defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		// other "users" fields...
		googleConnected: v.optional(v.boolean()),
		accountCreditsInCentThousandths: v.optional(v.number()),
		freeRequestsLeft: v.optional(v.number()),
		freeRequestsBillingCycle: v.optional(v.string()),
		customSystemPrompt: v.optional(v.string()),
		openRouterKey: v.optional(v.string()),
		lastModelUsed: v.optional(v.string()),
		pinnedModels: v.optional(v.array(v.string()))
	}).index('email', ['email']),
	modelSummaries: defineTable({
		name: v.string(),
		id: v.string(),
		creator: v.union(
			v.literal('openai'),
			v.literal('anthropic'),
			v.literal('google'),
			v.literal('mistralai'),
			v.literal('meta-llama'),
			v.literal('x-ai'),
			v.literal('deepseek'),
			v.literal('qwen'),
			v.null()
		),
		supportsImages: v.boolean(),
		supportsFiles: v.boolean(),
		supportsReasoning: v.boolean()
	})
		.index('by_creator', ['creator'])
		.index('by_model_id', ['id']),
	threads: defineTable({
		user: v.id('users'),
		title: v.string(),
		generating: v.boolean(),
		pinned: v.boolean(),
		lastModified: v.number()
	})
		.index('by_user_pinned_lastModified', ['user', 'pinned', 'lastModified'])
		.searchIndex('search_title', {
			searchField: 'title',
			filterFields: ['user']
		}),
	messages: defineTable({
		thread: v.id('threads'),
		model: v.string(),
		completed: v.boolean(),
		completionStatus: v.optional(completionStatusUnion),
		userMessage: v.string(),
		message: v.string(),
		reasoning: v.optional(v.string()),
		attachments: v.optional(
			v.array(
				v.object({
					url: v.string(),
					name: v.string(),
					type: v.string()
				})
			)
		)
	})
		.index('by_thread_completion', ['thread', 'completed'])
		.index('by_thread', ['thread'])
});
