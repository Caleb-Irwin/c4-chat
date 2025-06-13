import { getContext, setContext } from 'svelte';
import type { Doc } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
import { browser } from '$app/environment';
import { THREADS_ALL_KEY, THREADS_PINNED_KEY } from './threads.svelte';

export const USER_DEFAULT_KEY = '$_user',
    USER_KEY = 'userRow';

interface User {
    row: Doc<'users'> | null,
    isAuthenticated: boolean,
    isAnonymous: boolean,
    _isLoading: boolean,
    _isAuthenticated: boolean,
    _ensureSession: () => void,
    _addAnonymousThreads: () => void,
    _addInitialData: (data: Promise<Doc<'users'> | null> | undefined) => void,
    signOut: () => void,
    signInGoogle: () => void,
    signInOpenRouter: () => void,
}

class UserClass implements User {
    private client = useConvexClient();
    private initialData: Doc<'users'> | null = $state<Doc<'users'> | null>(null);
    private query = $state(useQuery(api.users.getRow, {}));
    private auth = useAuth()
    private localState = $derived<Doc<'users'> | null>(browser ? JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') : null);
    private createdAnonymousSession = $state(false);
    row = $derived<Doc<'users'> | null>(this.query.data ?? this.initialData ?? (this.auth.isLoading || this.auth.isAuthenticated ? this.localState : null));
    _isLoading = $derived(this.auth.isLoading)
    _isAuthenticated = $derived(this.auth.isAuthenticated);
    isAuthenticated = $derived(this.row !== null || this._isAuthenticated);
    isAnonymous = $derived(this.row ? this.row.isAnonymous === true : this.createdAnonymousSession);

    _ensureSession = () => {
        if (this.createdAnonymousSession) return
        this.createdAnonymousSession = true;
        this.auth.signIn('anonymous')
    };
    _addAnonymousThreads = () => {
        const lastAnonymousUserId = localStorage.getItem('lastAnonymousUserId');
        if (lastAnonymousUserId) {
            this.client.mutation(api.threads._addAnonymousThreads, { anonymousUserId: lastAnonymousUserId as any }).finally(() => {
                localStorage.removeItem('lastAnonymousUserId');
            });
        }
    };
    async _addInitialData(data: Promise<Doc<'users'> | null> | undefined) {
        this.initialData = (await data) ?? null;
    }

    signOut = () => {
        if (browser) {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(THREADS_ALL_KEY);
            localStorage.removeItem(THREADS_PINNED_KEY);
        }
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
    }
}

export const useUser = (key = USER_DEFAULT_KEY) => {
    const existing = getContext(key);
    if (existing) return existing as User;
    const userState = new UserClass();
    setContext(key, userState);
    return userState;
};