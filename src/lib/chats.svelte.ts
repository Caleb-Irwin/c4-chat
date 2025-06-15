import { getContext, setContext } from 'svelte';
import type { Id } from '../convex/_generated/dataModel';
import { useConvexClient } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';

interface Chat {
    _addInitialData: (threadId: Id<'threads'> | null, data?: Promise<undefined>) => Promise<void>,
    _store: () => void,
    sendMessage: (message: string, model: string) => Promise<void>,
    threadId: Id<'threads'> | null
}

class ChatClass implements Chat {
    threadId: Id<'threads'> | null = null
    private client = useConvexClient();

    async _addInitialData(threadId: Id<'threads'> | null, data?: Promise<undefined>) {
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

        const resText = await res.text();

        console.log(resText);
        alert('Message Response: ' + resText);
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