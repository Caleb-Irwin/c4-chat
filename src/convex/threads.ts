import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";

export const get = query({
    args: {
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }

        const { paginationOpts } = args;
        const threads: PaginationResult<Doc<'threads'>> = await ctx.db.query('threads')
            .withIndex('by_user_pinned_lastModified', (q) => q.eq('user', userId).eq('pinned', false))
            .order('desc').paginate(paginationOpts);

        return threads;
    }
})

export const pinned = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }

        const threads = await ctx.db.query('threads')
            .withIndex('by_user_pinned_lastModified', (q) => q.eq('user', userId).eq('pinned', true))
            .order('desc').take(100);

        threads.sort((a, b) => {
            if (a.lastModified === b.lastModified) {
                return 0;
            }
            return a.lastModified > b.lastModified ? -1 : 1;
        });

        return threads;
    }
})

export const search = query({
    args: {
        searchQuery: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }

        const { searchQuery } = args;
        const threads = await ctx.db.query('threads')
            .withSearchIndex("search_title", (q) => q.search('title', searchQuery).eq('user', userId))
            .take(100);

        threads.sort((a, b) => {
            return a.lastModified > b.lastModified ? -1 : 1;
        });

        return threads;
    }
});

export const rename = mutation({
    args: {
        threadId: v.id("threads"),
        newTitle: v.string(),
    },
    handler: async (ctx, { threadId, newTitle }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("User not authenticated.");

        const thread = await ctx.db.get(threadId);
        if (thread === null || thread.user !== userId) {
            throw new Error("Thread not found or you do not have permission to rename it.");
        }

        await ctx.db.patch(threadId, { title: newTitle });
    }
});

export const togglePin = mutation({
    args: {
        threadId: v.id("threads"),
        makePinned: v.boolean()
    },
    handler: async (ctx, { threadId, makePinned }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("User not authenticated.");

        const thread = await ctx.db.get(threadId);
        if (thread === null || thread.user !== userId) {
            throw new Error("Thread not found or you do not have permission to pin it.");
        }

        await ctx.db.patch(threadId, { pinned: makePinned });
    }
});

export const del = mutation({
    args: {
        threadId: v.id("threads"),
    },
    handler: async (ctx, { threadId }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("User not authenticated.");

        const thread = await ctx.db.get(threadId);
        if (thread === null || thread.user !== userId) {
            throw new Error("Thread not found or you do not have permission to delete it.");
        } else if (thread.generating) {
            throw new Error("Cannot delete a thread that is currently generating.");
        }

        await ctx.db.delete(threadId);

        const messages = await ctx.db.query('messages')
            .withIndex('by_user_thread', (q) => q.eq('user', userId).eq('thread', threadId))
            .collect()
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }
    }
});

export const createThread = async (ctx: MutationCtx, { initialTitle = 'New Thread', userId, generating = true }: {
    initialTitle?: string
    userId: Id<"users">
    generating?: boolean
}) => {
    const thread = await ctx.db.insert('threads', {
        user: userId,
        title: initialTitle,
        pinned: false,
        generating,
        lastModified: Date.now(),
    });

    return thread;
}

export const updateThread = async (ctx: MutationCtx, { threadId, generating }: { threadId: Id<"threads">, generating: boolean }) => {
    await ctx.db.patch(threadId, { lastModified: Date.now(), generating });
};

export const mockCreateThread = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("User not authenticated.");

        return createThread(ctx, {
            userId,
            generating: false
        });
    }
});