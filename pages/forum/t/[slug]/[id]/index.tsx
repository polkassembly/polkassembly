// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { GetServerSideProps } from 'next/types';
import { Topic } from '~src/components/ForumDiscussions/types';
import ForumTopicContainer from '~src/components/ForumDiscussions/ForumTopic';
import { fetchTopicData } from 'pages/api/v1/discourse/getTopicData';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { slug, id } = context.query;

	if (typeof slug !== 'string' || typeof id !== 'string') {
		return { props: { data: null } };
	}

	try {
		const { data, error } = await fetchTopicData(slug, id);
		if (data) {
			return {
				props: {
					data: data || null,
					error: null
				}
			};
		} else {
			return {
				props: {
					data: null,
					error: error
				}
			};
		}
	} catch (error: any) {
		console.error('Failed to execute fetchForumTopics:', error.message);
		return {
			props: {
				data: null,
				error: error.message || 'Failed to load data'
			}
		};
	}
};

interface TopicIdProps {
	data: Topic | null;
}

const TopicId: FC<TopicIdProps> = ({ data }) => {
	return <div>{data && <ForumTopicContainer data={data} />}</div>;
};

export default TopicId;
