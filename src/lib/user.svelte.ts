import { getContext, setContext } from 'svelte';
import type { Doc } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';

export const USER_DEFAULT_KEY = '$_user';
interface User {
	row: Doc<'users'> | null;
	isAuthenticated: boolean;
	isAnonymous: boolean;
	_isLoading: boolean;
	_isAuthenticated: boolean;
	_ensureSession: () => void;
	_addAnonymousThreads: () => void;
	_addInitialData: (data: Doc<'users'> | null | undefined) => void;
	signOut: () => void;
	signInGoogle: () => void;
	signInOpenRouter: () => void;
}

class UserClass implements User {
	private client = useConvexClient();
	private initialData: Doc<'users'> | null = $state<Doc<'users'> | null>(null);
	private query = $state(useQuery(api.users.getRow, {}));
	private auth = useAuth();
	private createdAnonymousSession = $state(false);
	row = $derived<Doc<'users'> | null>(this.query.data ?? this.initialData ?? null);
	_isLoading = $derived(this.auth.isLoading);
	_isAuthenticated = $derived(this.auth.isAuthenticated);
	isAuthenticated = $derived(this.row !== null || this._isAuthenticated);
	isAnonymous = $derived(this.row ? this.row.isAnonymous === true : this.createdAnonymousSession);

	_ensureSession = () => {
		if (this.createdAnonymousSession) return;
		this.createdAnonymousSession = true;
		this.auth.signIn('anonymous');
	};
	_addAnonymousThreads = () => {
		const lastAnonymousUserId = localStorage.getItem('lastAnonymousUserId');
		if (lastAnonymousUserId) {
			this.client
				.mutation(api.threads._addAnonymousThreads, { anonymousUserId: lastAnonymousUserId as any })
				.finally(() => {
					localStorage.removeItem('lastAnonymousUserId');
				});
		}
	};
	_addInitialData(data: Doc<'users'> | null | undefined) {
		this.initialData = data ?? null;
	}

	signOut = () => {
		this.auth.signOut().then(() => {
			window.location.assign('/');
		});
	};
	signInGoogle = () => {
		this.auth.signIn('google');
	};
	signInOpenRouter = () => {
		alert('OpenRouter sign-in is not implemented yet.');
		// this.auth.signIn('openRouter');
	};
}

export const useUser = (key = USER_DEFAULT_KEY) => {
	const existing = getContext(key);
	if (existing) return existing as User;
	const userState = new UserClass();
	setContext(key, userState);
	return userState;
};
