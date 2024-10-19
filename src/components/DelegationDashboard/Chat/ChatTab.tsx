// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Segmented } from 'antd';
import React from 'react';

interface Props {
	setSelectedChatTab: (selectedChatTab: 'sent' | 'received') => void;
	selectedChatTab: 'sent' | 'received';
	sentCount: number;
	receivedCount: number;
}

const ChatTab = ({ selectedChatTab, setSelectedChatTab, receivedCount, sentCount }: Props) => {
	return (
		<Segmented
			options={[
				{
					label: (
						<div className='p-1'>
							<div>Received ({receivedCount})</div>
						</div>
					),
					value: 'received'
				},
				{
					label: (
						<div className='p-1'>
							<div>Sent ({sentCount})</div>
						</div>
					),
					value: 'sent'
				}
			]}
			value={selectedChatTab}
			onChange={(value) => setSelectedChatTab(String(value) as 'sent' | 'received')}
			className='[&_.ant-segmented-item-selected]:font-semibold [&_.ant-segmented-item-selected_.ant-segmented-item-label]:text-bodyBlue [&_.ant-segmented-item-selected_.ant-segmented-item-label]:dark:text-blue-dark-high'
			block
		/>
	);
};
export default ChatTab;
