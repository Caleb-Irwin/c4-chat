import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';

export const PAGE_SIZE = 200;
export const CHAT_KEY_PREFIX = '$_chat:';

interface Chats {
    _addInitialData: (data: Promise<[typeof api.threads.get._returnType, typeof api.threads.pinned._returnType]> | undefined) => Promise<void>,
    _store: () => void,
}

class ChatsClass implements Chats {
    private client = useConvexClient();

    async _addInitialData(data: Promise<[typeof api.threads.get._returnType, typeof api.threads.pinned._returnType]> | undefined) {

    }

    _store() {

    }
}

export const useChat = (threadId: Id<'threads'>, keyPrefix = CHAT_KEY_PREFIX) => {
    const key = keyPrefix + threadId
    const existing = getContext(key);
    if (existing) return existing as Chats;
    const chatsState = new ChatsClass();
    setContext(key, chatsState);
    return chatsState;
};