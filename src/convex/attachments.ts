import { httpAction, internalMutation, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';

export const uploadAttachment = httpAction(async (ctx, request) => {
	const userId = await getAuthUserId(ctx);
	if (userId === null) {
		throw new Error('User not authenticated.');
	}

	const blob = await request.blob();

	const contentType = blob.type;
	if (!['image/png', 'image/jpeg', 'application/pdf'].includes(contentType)) {
		throw new ConvexError('unsupported_file_type');
	}
	const name =
		new URL(request.url).searchParams.get('filename') ||
		`Unnamed Attachment.${contentType.split('/')[1]}`;

	await ctx.runMutation(internal.messages.billing.handleBillingForAttachment, {
		userId: userId,
		size: blob.size
	});

	const storageId = await ctx.storage.store(blob);

	await ctx.runMutation(internal.attachments.addUnsentAttachment, {
		storageId,
		userId,
		name: name,
		type: blob.type,
		url: (await ctx.storage.getUrl(storageId))!
	});

	return new Response(null, {
		status: 200,
		headers: new Headers({
			'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN!,
			Vary: 'origin'
		})
	});
});

export const addUnsentAttachment = internalMutation({
	args: {
		userId: v.id('users'),
		storageId: v.id('_storage'),
		name: v.string(),
		type: v.string(),
		url: v.string()
	},
	handler: async (ctx, args) => {
		const userRow = (await ctx.db.get(args.userId))!;

		await ctx.db.patch(args.userId, {
			unsentAttachments: [
				...(userRow.unsentAttachments ?? []),
				{
					id: args.storageId,
					name: args.name,
					type: args.type,
					url: args.url
				}
			]
		});
	}
});

export const deleteUnsentAttachment = mutation({
	args: {
		id: v.id('_storage')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			throw new Error('User not authenticated.');
		}

		const userRow = (await ctx.db.get(userId))!;
		const unsentAttachments = userRow.unsentAttachments ?? [];
		const updatedAttachments = unsentAttachments.filter((attachment) => attachment.id !== args.id);

		await ctx.db.patch(userId, {
			unsentAttachments: updatedAttachments
		});

		await ctx.storage.delete(args.id);
	}
});
