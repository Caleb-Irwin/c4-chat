import { convexAuth } from '@convex-dev/auth/server';
import { Anonymous } from '@convex-dev/auth/providers/Anonymous';
import Google from '@auth/core/providers/google';
import { Doc } from './_generated/dataModel';
import { CONF } from '../conf';
import { getBillingPeriod } from './messages/billing';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Anonymous(), Google],
	session: {
		totalDurationMs: 3 * 31 * 24 * 60 * 60 * 1000, // 3 months in milliseconds
		inactiveDurationMs: 31 * 24 * 60 * 60 * 1000 // 31 days in milliseconds
	},
	callbacks: {
		afterUserCreatedOrUpdated: async (ctx, args) => {
			const { userId, provider } = args;
			const patch: Partial<Doc<'users'>> = {};
			if (provider.id === 'google') {
				patch.googleConnected = true;
			}
			const existingUser = await ctx.db.get(userId);
			if (!existingUser) {
				console.error('User not found after creation:', userId);
			} else if (existingUser.accountCreditsInCentThousandths === undefined) {
				const billingPeriod = getBillingPeriod();
				if (existingUser.isAnonymous) {
					patch.accountCreditsInCentThousandths =
						CONF.freeMessagesAnonymous * CONF.costPerMessageInCentThousandths;
					patch.freeRequestsLeft = CONF.freeMessagesAnonymous;
					patch.freeRequestsBillingCycle = billingPeriod;
				} else {
					patch.accountCreditsInCentThousandths = CONF.monthlyCreditsInCentThousandthsRegistered;
					patch.freeRequestsLeft = CONF.freeMessagesRegistered;
					patch.freeRequestsBillingCycle = billingPeriod;
				}
			}

			if (!existingUser.pinnedModels) {
				patch.pinnedModels = [...CONF.defaultPinnedModelIds];
			}

			await ctx.db.patch(userId, patch);
		}
	}
});
