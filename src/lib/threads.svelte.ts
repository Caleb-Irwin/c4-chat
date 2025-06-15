import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export const PAGE_SIZE = 200;
export const THREADS_DEFAULT_KEY = '$_threads',
    THREADS_ALL_KEY = 'threadsAll',
    THREADS_PINNED_KEY = 'threadsPinned';

interface Threads {
    all: Doc<'threads'>[] | [],
    pinned: Doc<'threads'>[] | [],
    pageNumber: number,
    searchQuery: string,
    searchResults: Doc<'threads'>[] | null,
    searchResultsIsLoading: boolean,
    _addInitialData: (data: Promise<[typeof api.threads.get._returnType, typeof api.threads.pinned._returnType]> | undefined) => Promise<void>,
    _store: () => void
    prevPage: () => void,
    nextPage: () => void,
    rename: (threadId: Id<"threads">, newTitle: string) => Promise<void>,
    del: (threadId: Id<"threads">) => Promise<void>,
    togglePin: (threadId: Id<"threads">, makePinned: boolean) => Promise<void>,
}

class ThreadsClass implements Threads {
    private pages = $state<[null, ...string[]]>([null]);
    private pageIndex = $state(0);
    pageNumber = $derived(this.pageIndex);
    private cursor = $state<string | null>(null);

    private queryAll = $derived(useQuery(api.threads.get, { paginationOpts: { cursor: this.cursor, numItems: PAGE_SIZE } }, { keepPreviousData: true }));
    private initialDataAll: Doc<'threads'>[] | null = $state<Doc<'threads'>[] | null>(null);
    private localStateAll = $derived<Doc<'threads'>[] | null>(browser ? JSON.parse(localStorage.getItem(THREADS_ALL_KEY) ?? 'null') : null);
    all = $derived<Doc<'threads'>[] | []>(this.queryAll.data?.page ?? this.initialDataAll ?? this.localStateAll ?? []);

    private queryPinned = useQuery(api.threads.pinned, {});
    private initialDataPinned: Doc<'threads'>[] | null = $state<Doc<'threads'>[] | null>(null);
    private localStatePinned = $derived<Doc<'threads'>[] | null>(browser ? JSON.parse(localStorage.getItem(THREADS_PINNED_KEY) ?? 'null') : null);
    pinned = $derived<Doc<'threads'>[] | []>(this.queryPinned.data ?? this.initialDataPinned ?? this.localStatePinned ?? []);

    searchQuery = $state('');
    private searchQueryRes = $derived(useQuery(api.threads.search, { searchQuery: this.searchQuery.length >= 2 ? this.searchQuery : null }));
    searchResults = $derived<Doc<'threads'>[] | null>(this.searchQuery.length >= 2 ? this.searchQueryRes.data ?? [] : null);
    searchResultsIsLoading = $derived(this.searchQueryRes.isLoading);

    private client = useConvexClient();

    async _addInitialData(data: Promise<[typeof api.threads.get._returnType, typeof api.threads.pinned._returnType]> | undefined) {
        const [resAll, resPinned] = await data ?? [null, null];
        this.initialDataAll = resAll?.page ?? null;
        this.initialDataPinned = resPinned ?? null;
    }

    _store() {
        localStorage.setItem(THREADS_ALL_KEY, JSON.stringify(this.all));
        localStorage.setItem(THREADS_PINNED_KEY, JSON.stringify(this.pinned));
    }

    prevPage() {
        if (this.pageIndex > 0) {
            this.pageIndex -= 1;
        }
        this.cursor = this.pages[this.pageIndex];
    }

    nextPage() {
        const currentCursor = this.pages[this.pageIndex];
        if (this.queryAll.data?.continueCursor && currentCursor !== this.queryAll.data.continueCursor) {
            if (!this.pages[this.pageIndex + 1]) {
                this.pages.push(this.queryAll.data.continueCursor);
            }
            this.pageIndex += 1;
        }
        this.cursor = this.pages[this.pageIndex];
    }

    async rename(threadId: Id<"threads">, newTitle: string) {
        await this.client.mutation(api.threads.rename, { threadId, newTitle });
    }

    async del(threadId: Id<"threads">) {
        if (page.url.pathname === `/chat/${threadId}`) {
            if (browser) goto('/chat');
        }
        await this.client.mutation(api.threads.del, { threadId });
    }

    async togglePin(threadId: Id<"threads">, makePinned: boolean) {
        await this.client.mutation(api.threads.togglePin, { threadId, makePinned });
    }
}

export const useThreads = (key = THREADS_DEFAULT_KEY) => {
    const existing = getContext(key);
    if (existing) return existing as Threads;
    const threadsState = new ThreadsClass();
    setContext(key, threadsState);
    return threadsState;
};