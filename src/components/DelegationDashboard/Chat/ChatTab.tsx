// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Segmented } from 'antd';
import React from 'react';

interface Props {
	setSelectedChatTab: (selectedChatTab: 'messages' | 'requests') => void;
	selectedChatTab: 'messages' | 'requests';
	requestsCount: number;
	messagesCount: number;
}

const ChatTab = ({ selectedChatTab, setSelectedChatTab, messagesCount, requestsCount }: Props) => {
	return (
		<Segmented
			options={[
				{
					label: (
						<div className='p-1'>
							<div>Messages ({messagesCount})</div>
						</div>
					),
					value: 'messages'
				},
				{
					label: (
						<div className='p-1'>
							<div>Requests ({requestsCount})</div>
						</div>
					),
					value: 'requests'
				}
			]}
			value={selectedChatTab}
			onChange={(value) => setSelectedChatTab(String(value) as 'messages' | 'requests')}
			className='[&_.ant-segmented-item-selected]:font-semibold [&_.ant-segmented-item-selected_.ant-segmented-item-label]:text-bodyBlue [&_.ant-segmented-item-selected_.ant-segmented-item-label]:dark:text-blue-dark-high'
			block
		/>
	);
};
export default ChatTab;
