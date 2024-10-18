// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function generateChatId(senderAddress: string, receiverAddress: string): string {
	const chatId = senderAddress.slice(0, 7) + receiverAddress.slice(-7);
	return chatId;
}
