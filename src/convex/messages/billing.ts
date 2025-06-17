import { CONF } from '../../conf';
import { Doc } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export const getBillingPeriod = () => `${new Date().getUTCFullYear()}-${new Date().getUTCMonth()}`;

export const handleBilling = async function (
	ctx: MutationCtx,
	userRow: Doc<'users'>,
	lastModel: string
): Promise<void> {
	const billingPeriod = getBillingPeriod();

	if (billingPeriod !== userRow.freeRequestsBillingCycle) {
		await ctx.db.patch(userRow._id, {
			freeRequestsLeft: CONF.freeMessagesRegistered,
			freeRequestsBillingCycle: billingPeriod,
			accountCreditsInCentThousandths: CONF.monthlyCreditsInCentThousandthsRegistered
		});
		userRow = (await ctx.db.get(userRow._id))!;
	}

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
