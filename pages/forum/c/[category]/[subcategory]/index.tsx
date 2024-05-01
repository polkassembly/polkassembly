// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import React, { FC } from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';
import { DiscussionsIcon } from '~src/ui-components/CustomIcons';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const page = context.query.page ? parseInt(context.query.page as string) : 0;
	const category = context.query.category as string | undefined;

	const url = `http://localhost:3000/api/v1/discourse/getDataBySubcategory?category=${category}&page=${page}`;

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

interface ForumSubCategoryProps {
	data: ForumData | null;
}

const SubCategory: FC<ForumSubCategoryProps> = ({ data }) => {
	return (
		<>
			<div className='mt-3 flex w-full flex-col justify-between align-middle sm:flex-row'>
				<div className='mx-2 flex text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>
					<DiscussionsIcon className='text-lg text-lightBlue dark:text-icon-dark-inactive xs:mr-3 sm:mr-2 sm:mt-[2px]' />
					Latest Discussion
				</div>
			</div>
			<div className='mt-3 w-full rounded-xxl bg-white px-4 py-2 shadow-md dark:bg-section-dark-overlay md:px-8 md:py-4'>
				<p className='m-0 mt-2 p-0 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
					This is the place to discuss on-chain proposals. On-chain posts are automatically generated as soon as they are created on the chain. Only the proposer is able to edit
					them.
				</p>
			</div>
			<div>
				<>{data ? <ForumPostsContainer topics={data?.topic_list} /> : null}</>
			</div>
		</>
	);
};

export default SubCategory;
