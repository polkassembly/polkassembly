// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import { CategoryKey, fetchForumCategory } from 'pages/api/v1/discourse/getDataByCategory';
import ForumLayout from 'pages/forum/ForumLayout';
import React, { FC } from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';
import ImageIcon from '~src/ui-components/ImageIcon';

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
	const { resolvedTheme: theme } = useTheme();
	return (
		<ForumLayout>
			{data ? (
				<ForumPostsContainer topics={data?.topic_list} />
			) : (
				<div className='my-[60px] flex flex-col items-center gap-6'>
					<ImageIcon
						src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
						alt='Empty Icon'
						imgClassName='w-[225px] h-[225px]'
					/>
					<h3 className='text-blue-light-high dark:text-blue-dark-high'>Something went wrong , Please try again later</h3>
				</div>
			)}
		</ForumLayout>
	);
};

export default Category;
