// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { GetServerSideProps } from 'next';
import React from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';
import ForumLayout from './ForumLayout';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const page = context.query.page ? parseInt(context.query.page as string) : 0;

	const url = `http://localhost:3000/api/v1/discourse/getLatestTopics?page=${page}`;

	try {
		const res = await fetch(url);
		const data: ForumData = await res.json();
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

interface ForumDiscussionsProps {
	data: ForumData | null;
}

const ForumDiscussions: React.FC<ForumDiscussionsProps> = ({ data }) => {
	return <ForumLayout>{data ? <ForumPostsContainer topics={data?.topic_list} /> : null}</ForumLayout>;
};

export default ForumDiscussions;
