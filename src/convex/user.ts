import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getInfo = query(
    {
        handler: async (ctx) => {
            const userId = await getAuthUserId(ctx);
            if (userId === null) {
                return null;
            }
            return await ctx.db.get(userId)
        }
    }
);