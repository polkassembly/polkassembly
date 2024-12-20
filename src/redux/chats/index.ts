// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IChatsStore } from './@types';
import { EChatRequestStatus, EChatTab, IChat } from '~src/types';
/* eslint-disable sort-keys */

const initialState: IChatsStore = {
	messages: [],
	requests: [],
	filteredMessages: [],
	filteredRequests: [],
	selectedChatTab: EChatTab.MESSAGES,
	loading: false,
	error: null,
	openedChat: null,
	isChatOpen: false,
	tempRecipient: null,
	unreadChatCount: 0
};

export const chatsStore = createSlice({
	name: 'chats',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setChats: (state, action: PayloadAction<{ messages: IChat[]; requests: IChat[] }>) => {
			state.messages = action.payload.messages;
			state.requests = action.payload.requests;
			state.filteredMessages = action.payload.messages;
			state.filteredRequests = action.payload.requests;
		},
		setFilteredMessages: (state, action: PayloadAction<IChat[]>) => {
			state.filteredMessages = action.payload;
		},
		setFilteredRequests: (state, action: PayloadAction<IChat[]>) => {
			state.filteredRequests = action.payload;
		},
		setSelectedChatTab: (state, action: PayloadAction<EChatTab>) => {
			state.selectedChatTab = action.payload;
		},
		addNewChat: (state, action: PayloadAction<IChat>) => {
			state.requests.push(action.payload);
			state.filteredRequests.push(action.payload);
			state.selectedChatTab = EChatTab.REQUESTS;
		},
		updateChatStatus: (state, action: PayloadAction<{ chatId: string; status: EChatRequestStatus }>) => {
			const { chatId, status } = action.payload;
			const requestIndex = state.requests.findIndex((chat) => chat.chatId === chatId);
			if (requestIndex !== -1) {
				const chat = state.requests[requestIndex];

				if (status === EChatRequestStatus.ACCEPTED) {
					state.messages.push({ ...chat, requestStatus: status });
					state.filteredMessages.push({ ...chat, requestStatus: status });
					state.requests = state.requests.filter((c) => c.chatId !== chatId);
					state.filteredRequests = state.filteredRequests.filter((c) => c.chatId !== chatId);
					state.selectedChatTab = EChatTab.MESSAGES;
					if (chat) {
						state.openedChat = { ...chat, requestStatus: status };
						state.isChatOpen = true;
					}
				} else {
					state.requests[requestIndex] = { ...chat, requestStatus: status };
					state.filteredRequests[requestIndex] = { ...chat, requestStatus: status };
				}
			}
		},
		setOpenChat: (state, action: PayloadAction<{ chat: IChat | null; isOpen: boolean }>) => {
			state.openedChat = action.payload.chat;
			state.isChatOpen = action.payload.isOpen;
		},
		setTempRecipient: (state, action: PayloadAction<string | null>) => {
			state.tempRecipient = action.payload;
		},
		updateLatestMessageViewedBy: (state, action: PayloadAction<{ chatId: string; address: string }>) => {
			const { chatId, address } = action.payload;
			const chatIndex = state.messages.findIndex((chat) => chat.chatId === chatId);
			if (chatIndex !== -1) {
				const chat = state.messages[chatIndex];
				const latestMessage = { ...chat.latestMessage };
				if (!latestMessage.viewed_by) {
					latestMessage.viewed_by = [];
				}
				if (!latestMessage.viewed_by.includes(address)) {
					latestMessage.viewed_by = [...latestMessage.viewed_by, address];
				}
				state.messages[chatIndex] = { ...chat, latestMessage };
			}
		},
		setUnreadChatCount: (state, action: PayloadAction<number>) => {
			state.unreadChatCount = action.payload;
		},
		markChatAsRead: (state, action: PayloadAction<{ chatId: string; address: string }>) => {
			const { chatId, address } = action.payload;
			const chatIndex = state.messages.findIndex((chat) => chat.chatId === chatId);
			if (chatIndex !== -1) {
				const chat = state.messages[chatIndex];
				const latestMessage = { ...chat.latestMessage };
				if (!latestMessage.viewed_by) {
					latestMessage.viewed_by = [];
				}
				if (!latestMessage.viewed_by.includes(address)) {
					latestMessage.viewed_by.push(address);
					state.messages[chatIndex] = { ...chat, latestMessage };
					if (state.unreadChatCount > 0) {
						state.unreadChatCount -= 1;
					}
				}
			}
		}
	},
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.chats
			};
		});
	}
});

export const chatsActions = chatsStore.actions;
export default chatsStore.reducer;
