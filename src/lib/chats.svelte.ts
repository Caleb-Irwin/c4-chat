import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';

interface Chat {
    _addInitialData: (threadId: Id<'threads'> | null, data?: Promise<undefined>) => Promise<void>,
    _store: () => void,
    sendMessage: (message: string, model: string) => Promise<void>,
    threadId: Id<'threads'> | null,
    isEmpty: boolean;
    isLoading: boolean;
    messages: Doc<'messages'>[] | null;
}

class ChatClass implements Chat {
    threadId: Id<'threads'> | null = $state(null);
    private client = useConvexClient();
    private completedMessagesQuery = $derived(this.threadId ? useQuery(api.messages.getFinishedMessages, { threadId: this.threadId }, { keepPreviousData: true }) : null);
    messages = $derived<Doc<'messages'>[] | null>(this.completedMessagesQuery?.data ?? null);
    isEmpty = $derived(this.threadId === null || (!this.completedMessagesQuery?.isLoading && this.messages?.length === 0));
    isLoading = $derived(this.completedMessagesQuery?.isLoading ?? true);

    async _addInitialData(threadId: Id<'threads'> | null, data?: Promise<undefined>) {
        console.log('Adding initial data to chat:', threadId);
        this.threadId = threadId;
        if (data) {
            await data;
        }
    }

    _store() {

    }

    async sendMessage(message: string, model: string): Promise<void> {
        if (!this.threadId) {
            this.threadId = await this.client.mutation(api.threads.create, {});
            if (browser) history.pushState({}, '', `/chat/${this.threadId}`);
        }

        const res = await fetch('/chat/postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                threadId: this.threadId,
                userMessage: message,
                model
            })
        });

        await res.text();
    }
}

export const useChat = () => {
    const key = '$_chat';
    const existing = getContext(key);
    if (existing) return existing as Chat;
    const chatsState = new ChatClass();
    setContext(key, chatsState);
    return chatsState;
};