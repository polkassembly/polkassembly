// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { post_topic } from '~src/global/post_topics';
import { useNetworkSelector } from '~src/redux/selectors';
import { EGovType } from '~src/types';

interface Props {
	className?: string;
	topicId: number;
	onTopicSelection: (id: number) => void;
	govType?: EGovType;
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

const TopicsRadio = ({ className, onTopicSelection, govType, topicId }: Props) => {
	const { network } = useNetworkSelector();
	const [topicOptions, setTopicOptions] = useState<string[]>([]);

	useEffect(() => {
		if (network === 'polymesh') {
			if (![post_topic.GENERAL, post_topic.COMMUNITY_PIPS, post_topic.TECHNICAL_PIPS, post_topic.UPGRADE_PIPS].includes(topicId)) {
				onTopicSelection(5);
			}
			setTopicOptions([topicToOptionText('COMMUNITY_PIPS'), topicToOptionText('TECHNICAL_PIPS'), topicToOptionText('UPGRADE_PIPS'), topicToOptionText('GENERAL')]);
		} else if (govType === EGovType.GOV1) {
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
		} else if (govType === EGovType.OPEN_GOV) {
			if (
				![post_topic.AUCTION_ADMIN, post_topic.FELLOWSHIP, post_topic.GOVERNANCE, post_topic.ROOT, post_topic.STAKING_ADMIN, post_topic.TREASURY, post_topic.WHITELIST].includes(
					topicId
				)
			) {
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

	const onTopicChange = (value: any) => {
		const topic = optionTextToTopic(String(value));
		onTopicSelection(post_topic[topic as keyof typeof post_topic]);
	};

	return (
		<div className={`${className} overflow-x-auto`}>
			<div className='mt-2 flex gap-2'>
				{topicOptions.map((topic) => (
					<div
						onClick={() => onTopicChange(topic)}
						className={`cursor-pointer rounded-2xl px-3 py-2 text-xs ${topicIdToTopictext(topicId) === topic ? 'bg-pink_primary text-white' : 'bg-[#ebeef2] text-lightBlue'}`}
						key={topic}
					>
						{topic}
					</div>
				))}
			</div>
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
		gap: 8px !important;
	}
`;
