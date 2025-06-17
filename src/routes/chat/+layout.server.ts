import type { ModelSummary } from '../../convex/models';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const response = await event.fetch('/models');
	const models = (await response.json()) as ModelSummary[];
	return {
		models
	};
};
