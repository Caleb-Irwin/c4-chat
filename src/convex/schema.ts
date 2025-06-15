import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { openRouterModelsTable } from "./init";

export const messageStatusUnion = v.union(v.literal("pending"), v.literal('generating'), v.literal('stopped'), v.literal("completed"), v.literal("error"));

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
        openRouterConnected: v.optional(v.boolean()),
        accountCreditsInCentThousandths: v.optional(v.number()),
        freeRequestsLeft: v.optional(v.number()),
        freeRequestsBillingCycle: v.optional(v.string()),
        customSystemPrompt: v.optional(v.string()),
        openRouterKey: v.optional(v.string()),
    }).index("email", ["email"]),
    openRouterModels: openRouterModelsTable,
    threads: defineTable({
        user: v.id("users"),
        title: v.string(),
        generating: v.boolean(),
        pinned: v.boolean(),
        lastModified: v.number(),
    }).index("by_user_pinned_lastModified", ['user', 'pinned', 'lastModified'])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["user"],
        }),
    messages: defineTable({
        thread: v.id("threads"),
        model: v.string(),
        status: messageStatusUnion,
        userMessage: v.string(),
        developerMessage: v.optional(v.string()),
        message: v.string(),
        messageHTML: v.optional(v.string()),
        attachments: v.optional(v.array(v.object({
            url: v.string(),
            name: v.string(),
            type: v.string(),
        }))),
    }).index("by_thread_status", ['thread', 'status']),
});