import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { defineTable } from "convex/server";

export const run = internalAction({
    handler: async (ctx) => {
        const url = 'https://openrouter.ai/api/v1/models';
        const options = { method: 'GET' };
        const response = await fetch(url, options);
        const { data } = await response.json() as Res;
        await ctx.runMutation(internal.init.updateOpenRouterModels, { data });
        console.log("Convex initialized with OpenRouter models");
    }
});

export const updateOpenRouterModels = internalMutation({
    args: { data: v.any() },
    handler: async (ctx, args) => {
        const data = args.data as Data[];

        for (const model of data) {
            const existingModel = await ctx.db.query('openRouterModels').withIndex("by_open_router_id", q => q.eq("id", model.id)).first()
            const newObj = {
                id: model.id,
                name: model.name,
                created: model.created,
                description: model.description,
                architecture: {
                    input_modalities: model.architecture?.input_modalities || [],
                    output_modalities: model.architecture?.output_modalities || [],
                    tokenizer: model.architecture?.tokenizer || "",
                    instruct_type: model.architecture?.instruct_type || undefined,
                },
                top_provider: {
                    is_moderated: model.top_provider?.is_moderated || false,
                    context_length: model.top_provider?.context_length || undefined,
                    max_completion_tokens: model.top_provider?.max_completion_tokens || undefined,
                },
                pricing: {
                    prompt: model.pricing?.prompt || "",
                    completion: model.pricing?.completion || "",
                    image: model.pricing?.image || "",
                    request: model.pricing?.request || "",
                    input_cache_read: model.pricing?.input_cache_read || "",
                    input_cache_write: model.pricing?.input_cache_write || "",
                    web_search: model.pricing?.web_search || "",
                    internal_reasoning: model.pricing?.internal_reasoning || "",
                },
                context_length: model.context_length || undefined,
                hugging_face_id: model.hugging_face_id || undefined,
                per_request_limits: model.per_request_limits || undefined,
                supported_parameters: model.supported_parameters || undefined,
            }

            if (existingModel) {
                await ctx.db.patch(existingModel._id, newObj);
            } else {
                await ctx.db.insert('openRouterModels', newObj);
            }
        }

    }
});

export const openRouterModelsTable = defineTable({
    id: v.string(),
    name: v.string(),
    created: v.number(),
    description: v.string(),
    architecture: v.object({
        input_modalities: v.array(v.string()),
        output_modalities: v.array(v.string()),
        tokenizer: v.string(),
        instruct_type: v.optional(v.string()),
    }),
    top_provider: v.object({
        is_moderated: v.boolean(),
        context_length: v.optional(v.number()),
        max_completion_tokens: v.optional(v.number()),
    }),
    pricing: v.object({
        prompt: v.string(),
        completion: v.string(),
        image: v.string(),
        request: v.string(),
        input_cache_read: v.string(),
        input_cache_write: v.string(),
        web_search: v.string(),
        internal_reasoning: v.string(),
    }),
    context_length: v.optional(v.number()),
    hugging_face_id: v.optional(v.string()),
    per_request_limits: v.optional(v.any()),
    supported_parameters: v.optional(v.array(v.string())),
}).index("by_open_router_id", ["id"])

interface Res {
    data: Data[];
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

interface Data {
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