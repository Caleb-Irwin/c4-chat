import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { goto } from '$app/navigation';

interface SendMessageParams {
	message: string;
	model: string;
}

interface Chat {
	_addInitialData: (threadId: Id<'threads'>, messages: Promise<Doc<'messages'>[]>) => Promise<void>;
	sendMessage: (msg: SendMessageParams) => Promise<void>;
	threadId: Id<'threads'> | null;
	messages: Doc<'messages'>[];
}

class ChatClass implements Chat {
	threadId: Id<'threads'> | null = $state<Id<'threads'> | null>(null);

	private client = useConvexClient();
	private chatManager = useChatManager();

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
	messages = $derived.by<Doc<'messages'>[]>(() => {
		const all = [
			...(this.completedMessages ?? []),
			...(this.generatingMessage ? [this.generatingMessage] : [])
		];
		if (all.length === 0) return [];
		return all
			.filter((msg) => msg.thread === this.threadId)
			.sort((a, b) => {
				if (a._creationTime === b._creationTime) return 0;
				return a._creationTime < b._creationTime ? -1 : 1;
			});
	});

	async _addInitialData(threadId: Id<'threads'>, data: Promise<Doc<'messages'>[]>) {
		this.threadId = threadId;
		this.chatManager.setup(threadId, this.sendMessage.bind(this));
		if (data) {
			this.completedMessagesInitialData = await data;
		}
	}

	async sendMessage({ message, model }: SendMessageParams): Promise<void> {
		this.generatingMessageText = null;

		if (!this.threadId) {
			throw new Error('Thread ID is not set. Please set the thread ID before sending a message.');
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

		this.generatingMessageText = '';
		const reader = res.body?.getReader();
		if (reader) {
			const decoder = new TextDecoder();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					this.generatingMessageText += chunk;
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

interface ChatManager {
	sendMessage: Chat['sendMessage'];
	setup: (threadId: Id<'threads'> | null, sendMessage: Chat['sendMessage'] | null) => void;
	threadId: Id<'threads'> | null;
}

class ChatManagerClass implements ChatManager {
	threadId: Id<'threads'> | null = $state<Id<'threads'> | null>(null);
	private sendMessageFn: Chat['sendMessage'] | null = null;
	private client = useConvexClient();

	sendMessage = async (msg: SendMessageParams) => {
		if (!this.sendMessageFn) {
			if (this.threadId) {
				throw new Error('sendMessage function is not set');
			} else {
				this.threadId = await this.client.mutation(api.threads.create, {});
				return await new Promise<ReturnType<Chat['sendMessage']>>((res) => {
					goto(`/chat/${this.threadId}`).then(async () => {
						if (!this.sendMessageFn) {
							throw new Error('sendMessage function is not set after navigation');
						}
						res(this.sendMessageFn(msg));
					});
				});
			}
		} else {
			return await this.sendMessageFn(msg);
		}
	};

	setup(threadId: Id<'threads'> | null, sendMessage: Chat['sendMessage'] | null) {
		this.threadId = threadId;
		this.sendMessageFn = sendMessage;
	}
}

export const useChatManager = () => {
	const key = '$_chatManager';
	const existing = getContext(key);
	if (existing) return existing as ChatManager;
	const chatManagerState = new ChatManagerClass();
	setContext(key, chatManagerState);
	return chatManagerState;
};
