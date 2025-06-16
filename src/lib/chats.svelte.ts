import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { browser } from '$app/environment';
import { pushState } from '$app/navigation';

interface Chat {
	_addInitialData: (threadId: Id<'threads'>, data: Doc<'messages'>[]) => Promise<void>;
	changeThread: (threadId: Id<'threads'> | null) => void;
	sendMessage: (message: string, model: string) => Promise<void>;
	threadId: Id<'threads'> | null;
	isEmpty: boolean;
	messages: Doc<'messages'>[] | null;
}

class ChatClass implements Chat {
	threadId: Id<'threads'> | null = $state(null);
	private client = useConvexClient();

	private generatingMessageQuery = $derived(
		this.threadId
			? useQuery(
					api.messages.getGeneratingMessage,
					{ threadId: this.threadId },
					{ keepPreviousData: true }
				)
			: null
	);
	private generatingMessageText = $state<string | null>(null);
	private generatingMessage = $derived.by<Doc<'messages'> | null>(() => {
		if (
			this.generatingMessageText !== null &&
			this.generatingMessageQuery?.data?.thread === this.threadId
		) {
			return {
				...this.generatingMessageQuery.data,
				message: this.generatingMessageText
			};
		}
		return this.generatingMessageQuery?.data ?? null;
	});

	private completedMessagesQuery = $derived(
		this.threadId
			? useQuery(
					api.messages.getFinishedMessages,
					{ threadId: this.threadId },
					{ keepPreviousData: true }
				)
			: null
	);
	private completedMessagesInitialData: Doc<'messages'>[] | null = $state<Doc<'messages'>[] | null>(
		null
	);
	private completedMessages = $derived<Doc<'messages'>[] | null>(
		this.completedMessagesQuery?.data ?? this.completedMessagesInitialData ?? null
	);
	messages = $derived.by<Doc<'messages'>[] | null>(() => {
		const all = [
			...(this.completedMessages ?? []),
			...(this.generatingMessage ? [this.generatingMessage] : [])
		];
		if (all.length === 0) return null;
		return all
			.filter((msg) => msg.thread === this.threadId)
			.sort((a, b) => {
				if (a._creationTime === b._creationTime) return 0;
				return a._creationTime < b._creationTime ? -1 : 1;
			});
	});
	isEmpty = $derived(this.threadId === null || (this.messages?.length ?? 0) === 0);

	async _addInitialData(threadId: Id<'threads'>, data: Doc<'messages'>[]) {
		this.changeThread(threadId);
		if (data) {
			this.completedMessagesInitialData = data;
		}
	}

	changeThread(threadId: Id<'threads'> | null) {
		this.threadId = threadId;
	}

	async sendMessage(message: string, model: string): Promise<void> {
		let threadId = this.threadId;
		this.generatingMessageText = null;

		if (!threadId) {
			threadId = await this.client.mutation(api.threads.create, {});
			this.changeThread(threadId);
			if (browser) pushState(`/chat/${threadId}`, {});
		}

		const res = await fetch('/chat/postMessage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				threadId: threadId,
				userMessage: message,
				model
			})
		});

		this.generatingMessageText = '';
		const reader = res.body?.getReader();
		if (reader) {
			const decoder = new TextDecoder();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					if (this.threadId === threadId) {
						this.generatingMessageText += chunk;
					} else {
						reader.cancel();
						break;
					}
				}
			} finally {
				reader.releaseLock();
			}
		}
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
