import { getContext, setContext } from 'svelte';
import type { Id } from '../convex/_generated/dataModel';
import { useConvexClient } from 'convex-svelte';

interface ChatRegistry {
    chats: Chat[];
    currentId: Id<'threads'> | null;
    setCurrent: (threadId: Id<'threads'>) => void;
    get(threadId: Id<'threads'>): Chat;
}

class ChatRegistryClass implements ChatRegistry {
    chats = $state([] as Chat[]);
    currentId: Id<'threads'> | null = $state(null);

    setCurrent(threadId: Id<'threads'>) {
        this.currentId = threadId;

    }

    get(threadId: Id<'threads'>): Chat {
        const existing = this.chats.find(chat => chat.threadId === threadId) || null;
        if (existing) {
            return existing;
        }
        const chat = new ChatsClass(threadId);
        this.chats.push(chat);
        return chat;
    }
}

interface Chat {
    _addInitialData: (data: Promise<undefined> | undefined) => Promise<void>,
    _store: () => void,
    sendMessage: (message: string, model: string) => Promise<void>,
    threadId: Id<'threads'>;
}

class ChatsClass implements Chat {
    threadId: Id<'threads'>;
    constructor(threadId: Id<'threads'>) {
        this.threadId = threadId;
    }

    private client = useConvexClient();

    async _addInitialData(data: Promise<undefined> | undefined) {

    }

    _store() {

    }

    async sendMessage(message: string, model: string): Promise<void> {
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

export const useChatRegistry = () => {
    const key = '$_chatRegistry';
    const existing = getContext(key);
    if (existing) return existing as ChatRegistry;
    const chatsState = new ChatRegistryClass();
    setContext(key, chatsState);
    return chatsState;
};