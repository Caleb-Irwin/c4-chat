import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';
import { pushState } from '$app/navigation';

interface Chat {
    _addInitialData: (threadId: Id<'threads'>, data: Doc<'messages'>[]) => Promise<void>,
    changeThread: (threadId: Id<'threads'> | null) => void,
    sendMessage: (message: string, model: string) => Promise<void>,
    threadId: Id<'threads'> | null,
    isEmpty: boolean;
    messages: Doc<'messages'>[] | null;
}

class ChatClass implements Chat {
    threadId: Id<'threads'> | null = $state(null);
    private client = useConvexClient();
    private completedMessagesQuery = $derived(this.threadId ? useQuery(api.messages.getFinishedMessages, { threadId: this.threadId }, { keepPreviousData: true }) : null);
    private completedMessagesInitialData: Doc<'messages'>[] | null = $state<Doc<'messages'>[] | null>(null);
    private completedMessages = $derived<Doc<'messages'>[] | null>(this.completedMessagesQuery?.data ?? this.completedMessagesInitialData ?? null);
    messages = $derived<Doc<'messages'>[] | null>(this.completedMessages ?? null);
    isEmpty = $derived(this.threadId === null || (this.messages?.length ?? 0) === 0);

    async _addInitialData(threadId: Id<'threads'>, data: Doc<'messages'>[]) {
        this.threadId = threadId;
        if (data) {
            this.completedMessagesInitialData = data;
        }
    }

    changeThread(threadId: Id<'threads'> | null) {
        this.threadId = threadId;
    }

    async sendMessage(message: string, model: string): Promise<void> {
        if (!this.threadId) {
            this.threadId = await this.client.mutation(api.threads.create, {});
            this.changeThread(this.threadId);
            if (browser) pushState(`/chat/${this.threadId}`, {});
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