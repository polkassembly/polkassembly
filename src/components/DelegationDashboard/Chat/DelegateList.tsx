// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { List } from 'antd';
import DelegateCard from './DelegateCard';
import { IDelegateAddressDetails } from '~src/types';

interface DelegateListProps {
	delegates: IDelegateAddressDetails[];
	onStartChat: (address: string) => void;
}

const DelegateList = ({ delegates, onStartChat }: DelegateListProps) => (
	<List
		itemLayout='horizontal'
		dataSource={delegates}
		renderItem={(delegate) => (
			<DelegateCard
				key={delegate?.address}
				delegate={delegate}
				onStartChat={onStartChat}
			/>
		)}
	/>
);

export default DelegateList;
