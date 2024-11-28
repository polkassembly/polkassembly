// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EChatTab } from '~src/types';
import { useDispatch } from 'react-redux';
import { chatsActions } from '~src/redux/chats';
import { Segmented } from 'antd';

interface Props {
	selectedChatTab: EChatTab;
	messagesCount: number;
	requestsCount: number;
}

const ChatTab = ({ selectedChatTab, messagesCount, requestsCount }: Props) => {
	const dispatch = useDispatch();

	const handleTabChange = (tab: EChatTab) => {
		dispatch(chatsActions.setSelectedChatTab(tab));
	};

	return (
		<Segmented
			options={[
				{
					label: (
						<div className='p-1'>
							<div>Messages ({messagesCount})</div>
						</div>
					),
					value: EChatTab.MESSAGES
				},
				{
					label: (
						<div className='p-1'>
							<div>Requests ({requestsCount})</div>
						</div>
					),
					value: EChatTab.REQUESTS
				}
			]}
			value={selectedChatTab}
			onChange={(value) => handleTabChange(String(value) as EChatTab)}
			className='[&_.ant-segmented-item-label]:dark:text-[#9e9e9e] [&_.ant-segmented-item-selected]:font-semibold [&_.ant-segmented-item-selected_.ant-segmented-item-label]:text-bodyBlue [&_.ant-segmented-item-selected_.ant-segmented-item-label]:dark:text-blue-dark-high'
			block
		/>
	);
};
export default ChatTab;
