import { getContext, setContext } from 'svelte';
import type { Doc } from '../convex/_generated/dataModel';
import { useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
import { browser } from '$app/environment';

interface User {
    row: Doc<'users'> | null,
    isAuthenticated: boolean,
    addInitialData: (data: Promise<Doc<'users'> | null>) => void,
}

class UserClass implements User {
    private initialData: Doc<'users'> | null = $state<Doc<'users'> | null>(null);
    private query = useQuery(api.users.getRow, {});
    private auth = useAuth()
    private localState = $derived<Doc<'users'> | null>(browser ? JSON.parse(localStorage.getItem('userRow') ?? 'null') : null);
    row = $derived<Doc<'users'> | null>(this.query.data ?? this.initialData ?? this.localState ?? null);
    isAuthenticated = $derived(this.row !== null || this.auth.isAuthenticated);

    async addInitialData(data: Promise<Doc<'users'> | null>) {
        this.initialData = await data;
    }
}

const DEFAULT_KEY = '$_user';

export const useUser = (key = DEFAULT_KEY) => {
    const existing = getContext(key);
    if (existing) return existing as User;
    const userState = new UserClass();
    setContext(key, userState);
    return userState;
};