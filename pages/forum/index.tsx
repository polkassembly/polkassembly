// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { GetServerSideProps } from 'next';
import React from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';
import ForumLayout from './ForumLayout';
import { fetchForumTopics } from 'pages/api/v1/discourse/getLatestTopics';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const pageNumber = context.query.page ? parseInt(context.query.page as string) : 0;
	try {
		const { data, error } = await fetchForumTopics(pageNumber);
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

interface ForumDiscussionsProps {
	data: ForumData | null;
}

const ForumDiscussions: React.FC<ForumDiscussionsProps> = ({ data }) => {
	return <ForumLayout>{data ? <ForumPostsContainer topics={data?.topic_list} /> : null}</ForumLayout>;
};

export default ForumDiscussions;
