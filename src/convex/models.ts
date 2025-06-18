import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action, internalAction, internalMutation, internalQuery } from './_generated/server';

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

export const initAndGetModelSummaries = action({
	args: { forceRefresh: v.optional(v.boolean()) },
	handler: async (ctx, args): Promise<ModelSummary[]> => {
		if (!(await ctx.runQuery(internal.models.hasModelSummaries)) || args.forceRefresh) {
			await ctx.runAction(internal.models.initializeModelSummaries);
		}

		return await ctx.runQuery(internal.models.getModelSummaries);
	}
});

export const initializeModelSummaries = internalAction({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		const url = 'https://openrouter.ai/api/v1/models';
		const options = { method: 'GET' };
		const response = await fetch(url, options);
		const { data } = (await response.json()) as OpenRouterResponse;
		await ctx.runMutation(internal.models.updateModelSummaries, { data });
		console.log('Convex initialized with model summaries');
		return null;
	}
});

export const hasModelSummaries = internalQuery({
	args: {},
	returns: v.boolean(),
	handler: async (ctx) => {
		const summary = await ctx.db.query('modelSummaries').first();
		return summary !== null;
	}
});

export const updateModelSummaries = internalMutation({
	args: { data: v.any() },
	returns: v.null(),
	handler: async (ctx, args) => {
		const existingSummaries = await ctx.db.query('modelSummaries').collect();
		for (const summary of existingSummaries) {
			await ctx.db.delete(summary._id);
		}

		const data = args.data as OpenRouterModel[];

		for (const model of data) {
			if (
				model.architecture.input_modalities.includes('text') === false ||
				model.architecture.output_modalities.includes('text') === false
			) {
				continue;
			}

			const creator = model.id.split('/')[0];

			const modelSummary = {
				name: model.name,
				id: model.id,
				creator: creators.includes(creator as Creators) ? (creator as Creators) : null,
				supportsImages: model.architecture.input_modalities.includes('image'),
				supportsFiles: model.architecture.input_modalities.includes('file'),
				supportsReasoning: model.supported_parameters?.includes('reasoning') || false
			};

			await ctx.db.insert('modelSummaries', modelSummary);
		}
		return null;
	}
});

export const getModelSummaries = internalQuery({
	args: {},

	handler: async (ctx) => {
		return (await ctx.db.query('modelSummaries').collect()) satisfies ModelSummary[];
	}
});

interface OpenRouterResponse {
	data: OpenRouterModel[];
}

interface Pricing {
	prompt: string;
	completion: string;
	image: string;
	request: string;
	input_cache_read: string;
	input_cache_write: string;
	web_search: string;
	internal_reasoning: string;
}

interface Architecture {
	input_modalities: string[];
	output_modalities: string[];
	tokenizer: string;
	instruct_type?: string | null;
}

interface TopProvider {
	is_moderated: boolean;
	context_length?: number | null;
	max_completion_tokens?: number | null;
}

interface OpenRouterModel {
	id: string;
	name: string;
	created: number;
	description: string;
	architecture: Architecture;
	top_provider: TopProvider;
	pricing: Pricing;
	context_length?: number | null;
	hugging_face_id?: string | null;
	per_request_limits?: any | null;
	supported_parameters?: string[] | null;
}
