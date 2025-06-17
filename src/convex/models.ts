import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action, internalQuery, query } from './_generated/server';

export const allModelsRaw = internalQuery({
	handler: async (ctx) => {
		return await ctx.db.query('openRouterModels').collect();
	}
});

export const hasModels = internalQuery({
	handler: async (ctx) => {
		const model = await ctx.db.query('openRouterModels').first();
		return model !== null;
	}
});

export const creators = [
	'openai',
	'anthropic',
	'google',
	'mistralai',
	'meta-llama',
	'x-ai',
	'deepseek',
	'qwen'
] as const;
export type Creators = (typeof creators)[number];

export interface ModelSummary {
	name: string;
	id: string;
	creator: Creators | null;
	supportsImages: boolean;
	supportsFiles: boolean;
}

export interface Model extends ModelSummary {
	description: string;
	contextLength: number;
	pricing: {
		prompt: string;
		completion: string;
		request: string;
		image: string;
		web_search: string;
		internal_reasoning: string;
		input_cache_read: string;
		input_cache_write: string;
	};
}

export const allModelSummaries = action({
	handler: async (ctx) => {
		if (!(await ctx.runQuery(internal.models.hasModels))) {
			await ctx.runAction(internal.init.run);
		}

		const allModels = await ctx.runQuery(internal.models.allModelsRaw);

		const result: ModelSummary[] = [];

		for (const model of allModels) {
			if (
				model.architecture.input_modalities.includes('text') === false ||
				model.architecture.output_modalities.includes('text') === false
			) {
				continue;
			}

			const creator = model.id.split('/')[0];

			const newModel: ModelSummary = {
				name: model.name,
				id: model.id,
				creator: creators.includes(creator as Creators) ? (creator as Creators) : null,
				supportsImages: model.architecture.input_modalities.includes('image'),
				supportsFiles: model.architecture.input_modalities.includes('file')
			};
			result.push(newModel);
		}

		return result;
	}
});

export const getModelInfo = query({
	args: {
		modelId: v.string()
	},
	handler: async (ctx, { modelId }) => {
		const model = await ctx.db
			.query('openRouterModels')
			.withIndex('by_open_router_id', (q) => q.eq('id', modelId))
			.first();

		if (!model) {
			throw new Error(`Model with ID ${modelId} not found.`);
		}

		const creator = model.id.split('/')[0];

		return {
			name: model.name,
			id: model.id,
			description: model.description,
			creator: creators.includes(creator as Creators) ? (creator as Creators) : null,
			contextLength: model.context_length || 0,
			supportsImages: model.architecture.input_modalities.includes('image'),
			supportsFiles: model.architecture.input_modalities.includes('file'),
			pricing: {
				prompt: model.pricing.prompt,
				completion: model.pricing.completion,
				request: model.pricing.request,
				image: model.pricing.image,
				web_search: model.pricing.web_search,
				internal_reasoning: model.pricing.internal_reasoning,
				input_cache_read: model.pricing.input_cache_read,
				input_cache_write: model.pricing.input_cache_write
			}
		} satisfies Model;
	}
});
