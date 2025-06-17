import { getContext, setContext } from 'svelte';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';
import { goto } from '$app/navigation';
import type { MessageRequestObject } from '../convex/messages';

type SendMessageParams = Omit<MessageRequestObject, 'threadId'>;

interface Chat {
	sendMessage: (msg: SendMessageParams) => Promise<void>;
	stopGenerating: () => Promise<void>;
	threadId: Id<'threads'> | null;
	messages: Doc<'messages'>[];
	hasGeneratingMessage: boolean;
}

export class ChatClass implements Chat {
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
	hasGeneratingMessage = $derived<boolean>(this.generatingMessage !== null);

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

	constructor(threadId: Id<'threads'>, data: Promise<Doc<'messages'>[]>) {
		this.threadId = threadId;
		this.chatManager.setup(threadId, this);
		if (data) {
			data.then((messages) => {
				this.completedMessagesInitialData = messages;
			});
		}
	}

	async sendMessage(msg: SendMessageParams): Promise<void> {
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
				...msg
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

	async stopGenerating(): Promise<void> {
		try {
			if (this.generatingMessage?._id === undefined) return;
			await this.client.mutation(api.messages.stopMessage, {
				messageId: this.generatingMessage?._id
			});
		} catch (error) {
			console.error('Error stopping message:', error);
			alert(`Error stopping message: ${error}`);
		}
	}
}

export const setChat = (chat: Chat) => {
	const key = '$_chat';
	setContext(key, chat);
};

export const useChat = () => {
	const key = '$_chat';
	return getContext(key) as Chat;
};

interface ChatManager {
	threadId: Id<'threads'> | null;
	generating: boolean;
	chat: Chat | null;
	sendMessage: Chat['sendMessage'];
	setup: (threadId: Id<'threads'> | null, chat: Chat | null) => void;
}

class ChatManagerClass implements ChatManager {
	threadId: Id<'threads'> | null = $state<Id<'threads'> | null>(null);
	chat = $state<Chat | null>(null);
	private _generating = $state<boolean>(false);
	generating = $derived<boolean>(this._generating || this.chat?.hasGeneratingMessage || false);
	private client = useConvexClient();

	sendMessage = async (msg: SendMessageParams) => {
		try {
			this._generating = true;
			if (!this.chat) {
				if (this.threadId) {
					throw new Error('sendMessage function is not set');
				} else {
					this.threadId = await this.client.mutation(api.threads.create, {});
					const res = await new Promise<ReturnType<Chat['sendMessage']>>((res) => {
						goto(`/chat/${this.threadId}`).then(async () => {
							if (!this.chat) {
								throw new Error('sendMessage function is not set after navigation');
							}
							res(this.chat.sendMessage(msg));
						});
					});
					this._generating = false;
					return res;
				}
			} else {
				const res = await this.chat.sendMessage(msg);
				this._generating = false;
				return res;
			}
		} catch (error) {
			this._generating = false;
			alert(`Error sending message: ${error}`);
			console.error('Error sending message:', error);
			throw error;
		}
	};

	setup(threadId: Id<'threads'> | null, chat: Chat | null) {
		this.threadId = threadId;
		this.chat = chat;
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
