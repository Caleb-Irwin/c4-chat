import { query } from "./_generated/server";

export const allNames = query({
    handler: async (ctx) => {
        return (await ctx.db.query('openRouterModels').collect()).map(model => model.name);
    }
});