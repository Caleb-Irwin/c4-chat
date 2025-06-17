/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as messages_billing from "../messages/billing.js";
import type * as messages_index from "../messages/index.js";
import type * as messages_streamedRequest from "../messages/streamedRequest.js";
import type * as messages from "../messages.js";
import type * as models from "../models.js";
import type * as threads from "../threads.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  init: typeof init;
  "messages/billing": typeof messages_billing;
  "messages/index": typeof messages_index;
  "messages/streamedRequest": typeof messages_streamedRequest;
  messages: typeof messages;
  models: typeof models;
  threads: typeof threads;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
