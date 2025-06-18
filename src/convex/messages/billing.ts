import { ConvexError, v } from 'convex/values';
import { CONF } from '../../conf';
import { Doc } from '../_generated/dataModel';
import { internalMutation, MutationCtx } from '../_generated/server';

export const getBillingPeriod = () => `${new Date().getUTCFullYear()}-${new Date().getUTCMonth()}`;

export const handleBilling = async function (
	ctx: MutationCtx,
	userRow: Doc<'users'>,
	lastModel: string
): Promise<void> {
	await ensureBillingPeriod(ctx, userRow);

	if (
		!userRow.freeRequestsLeft ||
		!userRow.accountCreditsInCentThousandths ||
		userRow.freeRequestsLeft <= 0 ||
		userRow.accountCreditsInCentThousandths < CONF.costPerMessageInCentThousandths
	) {
		throw new Error('Insufficient credits or requests');
	}
	await ctx.db.patch(userRow._id, {
		freeRequestsLeft: userRow.freeRequestsLeft - 1,
		accountCreditsInCentThousandths:
			userRow.accountCreditsInCentThousandths - CONF.costPerMessageInCentThousandths,
		lastModelUsed: lastModel
	});
};

export const handleBillingForAttachment = internalMutation({
	args: {
		userId: v.id('users'),
		size: v.number()
	},
	handler: async (ctx, args) => {
		let userRow = await ctx.db.get(args.userId);
		if (!userRow) {
			throw new Error('User not found');
		}
		userRow = await ensureBillingPeriod(ctx, userRow);

		if (!userRow.openRouterKey) {
			throw new ConvexError('premium_required');
		}

		const cost = Math.ceil(args.size / 1000000) * CONF.costPerMbUploadInCentThousandths;

		if (userRow.accountCreditsInCentThousandths! < cost) {
			throw new Error('Insufficient credits or requests for attachment');
		}

		await ctx.db.patch(userRow._id, {
			accountCreditsInCentThousandths: userRow.accountCreditsInCentThousandths! - cost
		});
	}
});

async function ensureBillingPeriod(ctx: MutationCtx, userRow: Doc<'users'>): Promise<Doc<'users'>> {
	const billingPeriod = getBillingPeriod();
	if (billingPeriod !== userRow.freeRequestsBillingCycle) {
		await ctx.db.patch(userRow._id, {
			freeRequestsLeft: CONF.freeMessagesRegistered,
			freeRequestsBillingCycle: billingPeriod,
			accountCreditsInCentThousandths: CONF.monthlyCreditsInCentThousandthsRegistered
		});
		userRow = (await ctx.db.get(userRow._id))!;
	}
	return userRow;
}
