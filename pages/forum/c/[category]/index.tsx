// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { CategoryKey, fetchForumCategory } from 'pages/api/v1/discourse/getDataByCategory';
import ForumLayout from 'pages/forum/ForumLayout';
import React, { FC } from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const page = context.query.page ? parseInt(context.query.page as string) : 0;
	const category = context.query.category as CategoryKey;

	try {
		const { data, error } = await fetchForumCategory(category, page);
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
	} catch (error) {
		console.error('Failed to fetch data:', error);
		return {
			props: {
				data: null,
				error: error.message || 'Failed to load data'
			}
		};
	}
};

interface ForumCategoryProps {
	data: ForumData | null;
}

const Category: FC<ForumCategoryProps> = ({ data }) => {
	return <ForumLayout>{data ? <ForumPostsContainer topics={data?.topic_list} /> : null}</ForumLayout>;
};

export default Category;
