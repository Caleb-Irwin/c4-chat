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
	supportsReasoning: boolean;
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
				supportsFiles: model.architecture.input_modalities.includes('file'),
				supportsReasoning: model.supported_parameters?.includes('reasoning') || false
			};
			result.push(newModel);
		}

		return result;
	}
});
