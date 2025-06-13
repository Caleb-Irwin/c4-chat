import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';

export const PAGE_SIZE = 100;
const DEFAULT_KEY = '$_threads',
    THREADS_ALL_KEY = 'threadsAll',
    THREADS_PINNED_KEY = 'threadsPinned';

interface Threads {
    all: Doc<'threads'>[] | [],
    pinned: Doc<'threads'>[] | [],
    _addInitialData: (data: Promise<[typeof api.threads.get._returnType, typeof api.threads.pinned._returnType]> | undefined) => Promise<void>,
    loadMore: () => void,
    rename: (threadId: Id<"threads">, newTitle: string) => Promise<void>,
    del: (threadId: Id<"threads">) => Promise<void>,
    togglePin: (threadId: Id<"threads">, makePinned: boolean) => Promise<void>,
}

class ThreadsClass implements Threads {
    private initialDataCursor = $state<string | null>(null);
    private cursor = $state<string | null>(null);
    private queryAll = useQuery(api.threads.get, { paginationOpts: { cursor: this.cursor, numItems: PAGE_SIZE } }, { keepPreviousData: true });
    private initialDataAll: Doc<'threads'>[] | null = $state<Doc<'threads'>[] | null>(null);
    private localStateAll = $derived<Doc<'threads'>[] | null>(browser ? JSON.parse(localStorage.getItem(THREADS_ALL_KEY) ?? 'null') : null);
    all = $derived<Doc<'threads'>[] | []>(this.queryAll.data?.page ?? this.initialDataAll ?? this.localStateAll ?? []);

    private queryPinned = useQuery(api.threads.pinned, {});
    private initialDataPinned: Doc<'threads'>[] | null = $state<Doc<'threads'>[] | null>(null);
    private localStatePinned = $derived<Doc<'threads'>[] | null>(browser ? JSON.parse(localStorage.getItem(THREADS_PINNED_KEY) ?? 'null') : null);
    pinned = $derived<Doc<'threads'>[] | []>(this.queryPinned.data ?? this.initialDataPinned ?? this.localStatePinned ?? []);

    private client = useConvexClient();

    async _addInitialData(data: Promise<[typeof api.threads.get._returnType, typeof api.threads.pinned._returnType]> | undefined) {
        const [resAll, resPinned] = await data ?? [null, null];
        if (!this.cursor && resAll?.page) this.initialDataCursor = resAll.continueCursor
        this.initialDataAll = resAll?.page ?? null;
        this.initialDataPinned = resPinned ?? null;
    }

    loadMore() {
        if (this.queryAll.isLoading || (!this.queryAll.data?.continueCursor && !this.initialDataCursor)) return;
        this.cursor = this.queryAll.data?.continueCursor ?? this.initialDataCursor;
    };

    async rename(threadId: Id<"threads">, newTitle: string) {
        await this.client.mutation(api.threads.rename, { threadId, newTitle });
    }

    async del(threadId: Id<"threads">) {
        await this.client.mutation(api.threads.del, { threadId });
    }

    async togglePin(threadId: Id<"threads">, makePinned: boolean) {
        await this.client.mutation(api.threads.togglePin, { threadId, makePinned });
    }
}

export const useThreads = (key = DEFAULT_KEY) => {
    const existing = getContext(key);
    if (existing) return existing as Threads;
    const threadsState = new ThreadsClass();
    setContext(key, threadsState);
    return threadsState;
};