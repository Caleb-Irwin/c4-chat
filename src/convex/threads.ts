import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalMutation, mutation, MutationCtx, query } from "./_generated/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { api, internal } from "./_generated/api";

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
        searchQuery: v.union(v.string(), v.null())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null || args.searchQuery === null) {
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

export const create = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("User not authenticated.");
        const thread = await ctx.db.insert('threads', {
            user: userId,
            title: 'New Thread',
            pinned: false,
            generating: false,
            lastModified: Date.now(),
        });
        return thread;
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
            .withIndex('by_thread_completion', (q) => q.eq('thread', threadId))
            .collect()
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }
    }
});

export const _addAnonymousThreads = mutation({
    args: {
        anonymousUserId: v.id("users"),
    },
    handler: async (ctx, { anonymousUserId }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("User not authenticated.");

        const anonymousUser = await ctx.db.get(anonymousUserId);
        if (anonymousUser === null || anonymousUser.isAnonymous !== true) {
            throw new Error("Anonymous user not found or not anonymous.");
        }

        const threads = await ctx.db.query('threads')
            .withIndex('by_user_pinned_lastModified', (q) => q.eq('user', anonymousUserId))
            .collect();
        for (const thread of threads) {
            await ctx.db.patch(thread._id, { user: userId });
        }
    }
});

export const generateThreadName = internalAction({
    args: {
        threadId: v.id("threads"),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const url = 'https://openrouter.ai/api/v1/completions';
        const options = {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "google/gemini-2.0-flash-lite-001", prompt: "Name thread. RETURN ONLY TITLE. First message: " + args.message, max_tokens: 40 })
        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            const threadName = data.choices[0].text.trim();
            await ctx.runMutation(internal.threads.setTitle, {
                threadId: args.threadId,
                title: threadName
            });
        } catch (error) {
            console.error(error);
        }
    }
});

export const setTitle = internalMutation({
    args: {
        threadId: v.id("threads"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.threadId, { title: args.title });
    }
});
