import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Anonymous(), Google],
  session: {
    totalDurationMs: 3 * 31 * 24 * 60 * 60 * 1000, // 3 months in milliseconds
    inactiveDurationMs: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
  },
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, args) => {
      const { userId, provider } = args;
      if (provider.id === 'google') {
        await ctx.db.patch(userId, { googleConnected: true });
      } else if (provider.id === 'openRouter') {
        await ctx.db.patch(userId, { openRouterConnected: true });
      }
    },
  }
});
