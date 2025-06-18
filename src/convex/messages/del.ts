import { Doc, Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export async function delMessageById(ctx: MutationCtx, id: Id<'messages'>): Promise<void> {
	const message = await ctx.db.get(id);
	if (!message) return;
	await delMessageByDoc(ctx, message);
}

export const delMessageByDoc = async (ctx: MutationCtx, doc: Doc<'messages'>): Promise<void> => {
	await ctx.db.delete(doc._id);
	for (const attachment of doc.attachments ?? []) {
		await ctx.storage.delete(attachment.id);
	}
};
