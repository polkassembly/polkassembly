// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Segmented } from 'antd';
import { SegmentedValue } from 'antd/lib/segmented';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { post_topic } from '~src/global/post_topics';

interface Props {
<<<<<<< HEAD
    className?: string;
    topicId: number;
    onTopicSelection: (id: number)=> void;
    govType?: 'gov_1' | 'open_gov';
	theme?: string;
=======
	className?: string;
	topicId: number;
	onTopicSelection: (id: number) => void;
	govType?: 'gov_1' | 'open_gov';
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
}

export const topicToOptionText = (topic: string) => {
	//replace _ with space and then capitalize first letter of each word
	return topic.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
	});
};

export const optionTextToTopic = (optionText: string) => {
	//replace space with _ and then upperCase
	return optionText.replace(/ /g, '_').toUpperCase();
};

const topicIdToTopictext = (topicId: number) => {
	let text = '';
	Object.entries(post_topic).forEach(([key, value]) => {
		if (value === topicId) {
			text = key;
		}
	});
	return topicToOptionText(text);
};

<<<<<<< HEAD
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TopicsRadio = ({ className, onTopicSelection, govType, topicId, theme }: Props) => {

	const [ topicOptions, setTopicOptions] = useState<string[]>([]);
=======
const TopicsRadio = ({ className, onTopicSelection, govType, topicId }: Props) => {
	const [topicOptions, setTopicOptions] = useState<string[]>([]);
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

	useEffect(() => {
		if (govType === 'gov_1') {
			if (![post_topic.COUNCIL, post_topic.DEMOCRACY, post_topic.GENERAL, post_topic.TECHNICAL_COMMITTEE, post_topic.TREASURY].includes(topicId)) {
				onTopicSelection(2);
			}

			setTopicOptions([
				topicToOptionText('COUNCIL'),
				topicToOptionText('DEMOCRACY'),
				topicToOptionText('GENERAL'),
				topicToOptionText('TECHNICAL_COMMITTEE'),
				topicToOptionText('TREASURY')
			]);
		} else if (govType === 'open_gov') {
			if (![post_topic.AUCTION_ADMIN, post_topic.FELLOWSHIP, post_topic.GOVERNANCE, post_topic.ROOT, post_topic.STAKING_ADMIN, post_topic.TREASURY].includes(topicId)) {
				onTopicSelection(8);
			}

			setTopicOptions([
				topicToOptionText('AUCTION_ADMIN'),
				topicToOptionText('FELLOWSHIP'),
				topicToOptionText('GOVERNANCE'),
				topicToOptionText('ROOT'),
				topicToOptionText('STAKING_ADMIN'),
				topicToOptionText('TREASURY')
			]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [govType]);

	const onTopicChange = (value: SegmentedValue) => {
		const topic = optionTextToTopic(String(value));
		onTopicSelection(post_topic[topic as keyof typeof post_topic]);
	};

	return (
		<div className={`${className} overflow-x-auto`}>
<<<<<<< HEAD
			<Segmented className='text-navBlue borderRadius dark:text-white flex gap-4 rounded-xl bg-white dark:bg-section-dark-overlay text-xs' options={topicOptions} onChange={onTopicChange} value={topicIdToTopictext(topicId)}/>
=======
			<Segmented
				className='borderRadius flex gap-4 rounded-xl bg-white text-xs text-navBlue'
				options={topicOptions}
				onChange={onTopicChange}
				value={topicIdToTopictext(topicId)}
			/>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		</div>
	);
};

export default styled(TopicsRadio)`
<<<<<<< HEAD
.borderRadius .ant-segmented-item{
  background:${props => props.theme === 'dark'? '#222': '#EBEEF2'} !important;
  border-radius:16px;
}
.borderRadius .ant-segmented-item:hover{
  background: ${props => props.theme === 'dark'? '#33071E': ''} !important;
  color: ${props => props.theme === 'dark'? '#fff': ''} !important;
}
.borderRadius .ant-segmented-item-selected{
border-radius:16px;
background:${props => props.theme === 'dark'? '#5A1138':'#E5007A'} !important;

}
.borderRadius .ant-segmented-item-selected .ant-segmented-item-label{
border-radius:16px ;
color:white !important;
font-size:12px;

}
.borderRadius .ant-segmented-item .ant-segmented-item-label{
border-radius:16px ;
font-size:12px;
padding:2px 14px;
}
.borderRadius .ant-segmented-group{
gap:12px !important;
}

=======
	.borderRadius .ant-segmented-item {
		background: #ebeef2;
		border-radius: 16px;
	}
	.borderRadius .ant-segmented-item-selected {
		border-radius: 16px;
		background: #e5007a;
	}
	.borderRadius .ant-segmented-item-selected .ant-segmented-item-label {
		border-radius: 16px;
		color: white !important;
		font-size: 12px;
	}
	.borderRadius .ant-segmented-item .ant-segmented-item-label {
		border-radius: 16px;
		font-size: 12px;
		padding: 2px 14px;
	}
	.borderRadius .ant-segmented-group {
		gap: 12px !important;
	}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
`;
