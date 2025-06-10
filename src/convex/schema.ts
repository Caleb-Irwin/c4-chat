import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { openRouterModelsTable } from "./init";

export default defineSchema({
    ...authTables,
    openRouterModels: openRouterModelsTable,
    messages: defineTable({
        body: v.string(),
        user: v.id("users"),
    }),
});