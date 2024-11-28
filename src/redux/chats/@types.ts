// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EChatTab, IChat } from '~src/types';

export interface IChatsStore {
	messages: IChat[];
	requests: IChat[];
	filteredMessages: IChat[];
	filteredRequests: IChat[];
	selectedChatTab: EChatTab;
	loading: boolean;
	error: string | null;
	openedChat: IChat | null;
	isChatOpen: boolean;
}
