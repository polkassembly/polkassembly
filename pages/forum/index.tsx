// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { ForumData } from '~src/components/ForumDiscussions/types';
import { DiscussionsIcon } from '~src/ui-components/CustomIcons';
import { Cascader } from 'antd';
import { useRouter } from 'next/router';

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

interface Option {
	value: string;
	label: string;
	children?: Option[];
}

interface ForumDiscussionsProps {
	data: ForumData | null;
}

const ForumDiscussions: React.FC<ForumDiscussionsProps> = ({ data }) => {
	const router = useRouter();
	const [category, setCategory] = useState<string[] | undefined>(undefined);

	const options: Option[] = [
		{ value: 'polkadot-technology', label: 'Tech Talk' },
		{ value: 'ambassador-programme', label: 'Ambassador Programme' },
		{ value: 'governance', label: 'Governance' },
		{
			value: 'ecosystem',
			label: 'Ecosystem',
			children: [{ value: 'digest', label: 'Digest' }]
		},
		{ value: 'uncategorized', label: 'Miscellaneous' },
		{
			value: 'polkadot-forum-meta',
			label: 'Polkadot Forum Meta',
			children: [
				{ value: 'profiles', label: 'Profiles' },
				{ value: 'suggestions', label: 'Suggestions' }
			]
		}
	];

	const onChange: any = (value: string[]) => {
		setCategory(value);
		if (value.length > 1) {
			const subcategory = value[value.length - 2];
			const category = value[value.length - 1];
			router.push(`/forum/c/${subcategory}/${category}`);
		} else if (value.length === 1) {
			router.push(`/forum/c/${value[0]}`);
		} else {
			router.push('/forum');
		}
	};

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
				<Cascader
					key={category?.toString() || 'default-key'}
					placeholder='All Categories'
					options={options}
					onChange={onChange}
					// changeOnSelect
					value={category as string[]}
				/>
				<>{data ? <ForumPostsContainer topics={data?.topic_list} /> : null}</>
			</div>
		</>
	);
};

export default ForumDiscussions;
