// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Segmented } from 'antd';
import { SegmentedValue } from 'antd/lib/segmented';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { post_topic } from '~src/global/post_topics';

interface Props {
  className?: string;
  topicId: number;
  onTopicSelection: (id: number) => void;
  govType?: 'gov_1' | 'open_gov';
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

const TopicsRadio = ({
	className,
	onTopicSelection,
	govType,
	topicId
}: Props) => {
	const [topicOptions, setTopicOptions] = useState<string[]>([]);

	useEffect(() => {
		if (govType === 'gov_1') {
			onTopicSelection(2);
			setTopicOptions([
				topicToOptionText('COUNCIL'),
				topicToOptionText('DEMOCRACY'),
				topicToOptionText('GENERAL'),
				topicToOptionText('TECHNICAL_COMMITTEE'),
				topicToOptionText('TREASURY')
			]);
		} else if (govType === 'open_gov') {
			onTopicSelection(8);
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
			<Segmented
				className="text-navBlue borderRadius flex gap-4 rounded-xl bg-white text-xs"
				options={topicOptions}
				onChange={onTopicChange}
				value={topicIdToTopictext(topicId)}
			/>
		</div>
	);
};

export default styled(TopicsRadio)`
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
`;
