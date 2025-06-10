import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const helloWorld = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return 'Forbidden: User not authenticated';
        }
        return "Hello, world!";
    },
});