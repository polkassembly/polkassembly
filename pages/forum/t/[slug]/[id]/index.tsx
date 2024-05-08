// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { GetServerSideProps } from 'next/types';
import { Topic } from '~src/components/ForumDiscussions/types';
import ForumTopicContainer from '~src/components/ForumDiscussions/ForumTopic';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { slug, id } = context.query;
	try {
		const res = await fetch(`http://localhost:3000/api/v1/discourse/getTopicData?slug=${slug}&id=${id}`);
		const data: Topic = await res.json();
		return {
			props: {
				data
			}
		};
	} catch (error) {
		console.error('Failed to fetch data:', error);
		return {
			props: {
				data: null
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
