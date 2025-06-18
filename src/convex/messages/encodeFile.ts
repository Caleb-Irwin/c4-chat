import { internalAction } from '../_generated/server';
import { v } from 'convex/values';

export const encodeFile = internalAction({
	args: { id: v.id('_storage') },
	handler: async (ctx, { id }): Promise<string> => {
		const blob = await ctx.storage.get(id);

		if (!blob) {
			throw new Error('File not found');
		}

		// Convert blob to ArrayBuffer
		const arrayBuffer = await blob.arrayBuffer();

		// Convert ArrayBuffer to base64
		const uint8Array = new Uint8Array(arrayBuffer);
		const binaryString = Array.from(uint8Array)
			.map((byte) => String.fromCharCode(byte))
			.join('');

		const base64String = btoa(binaryString);

		// Return as data URL with MIME type
		return `data:${blob.type};base64,${base64String}`;
	}
});
