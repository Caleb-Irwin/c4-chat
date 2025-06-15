import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import Google from "@auth/core/providers/google";
import { Doc } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Anonymous(), Google],
  session: {
    totalDurationMs: 3 * 31 * 24 * 60 * 60 * 1000, // 3 months in milliseconds
    inactiveDurationMs: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
  },
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, args) => {
      const { userId, provider } = args;
      const patch: Partial<Doc<'users'>> = {}
      if (provider.id === 'google') {
        patch.googleConnected = true;
      } else if (provider.id === 'openRouter') {
        patch.openRouterConnected = true;
      }
      const existingUser = await ctx.db.get(userId);
      if (!existingUser) {
        console.error('User not found after creation:', userId);
      } else if (existingUser.accountCreditsInCentThousandths === undefined) {
        const billingPeriod = `${(new Date()).getUTCFullYear()}-${(new Date()).getUTCMonth()}`
        if (existingUser.isAnonymous) {
          patch.accountCreditsInCentThousandths = 1000 * 1;
          patch.freeRequestsLeft = 10;
          patch.freeRequestsBillingCycle = billingPeriod;
        } else {
          patch.accountCreditsInCentThousandths = 1000 * 100;
          patch.freeRequestsLeft = 50;
          patch.freeRequestsBillingCycle = billingPeriod;
        }
      }

      await ctx.db.patch(userId, patch);
    },
  }
});
