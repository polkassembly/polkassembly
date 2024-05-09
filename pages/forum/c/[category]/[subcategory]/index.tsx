// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { fetchForumSubcategory } from 'pages/api/v1/discourse/getDataBySubcategory';
import ForumLayout from 'pages/forum/ForumLayout';
import React from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const page = context.query.page ? parseInt(context.query.page as string, 10) : 0;
	const { category, subcategory } = context.query;

	if (typeof category !== 'string' || typeof subcategory !== 'string') {
		return { props: { data: null } };
	}

	try {
		const { data, error } = await fetchForumSubcategory(category, subcategory, page);
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

interface ForumSubCategoryProps {
	data: ForumData | null;
}

const SubCategory: React.FC<ForumSubCategoryProps> = ({ data }) => {
	return <ForumLayout>{data ? <ForumPostsContainer topics={data.topic_list} /> : null}</ForumLayout>;
};

export default SubCategory;
