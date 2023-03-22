// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Segmented } from 'antd';
import { SegmentedValue } from 'antd/lib/segmented';
import React from 'react';

import { post_topic } from '~src/global/post_topics';

interface Props {
    className?: string
    onTopicSelection: (id: number)=> void
}

const topicToOptionText = (topic: string) => {
	//replace _ with space and then capitalize first letter of each word
	return topic.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
	});
};

const optionTextToTopic = (optionText: string) => {
	//replace space with _ and then upperCase
	return optionText.replace(/ /g, '_').toUpperCase();
};

const TopicsRadio = ({ className, onTopicSelection }: Props) => {
	const topicOptions: string[] = [];
	Object.keys(post_topic).forEach(topic => {
		topicOptions.push(topicToOptionText(topic));
	});

	const onTopicChange = (value: SegmentedValue) => {
		const topic = optionTextToTopic(String(value));
		onTopicSelection(post_topic[topic as keyof typeof post_topic]);
	};

	return (
		<div className={`${className} overflow-x-auto`}>
			<Segmented options={topicOptions} onChange={onTopicChange} />
		</div>
	);
};

export default TopicsRadio;
