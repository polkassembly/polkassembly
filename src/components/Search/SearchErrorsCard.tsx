// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider } from 'antd';
import React from 'react';
import SuperSearchIcon from '~assets/icons/super-search.svg';
import EmptyResultsIcon from '~assets/search/empty-search.svg';
import { EFilterBy } from '.';
import { useRouter } from 'next/router';

interface Props {
	setIsSuperSearch: (pre: boolean) => void;
	setFilterBy: (pre: EFilterBy) => void;
	setOpenModal: (pre: boolean) => void;
	filterBy: EFilterBy;
	isSearchErr: boolean;
	postResultsCounts: number;
	peopleResultsCounts: number;
	isSuperSearch: boolean;
	setPeoplePage: (pre: { totalPeople: number; page: number }) => void;
	setPostsPage: (pre: number) => void;
}

const SearchErrorsCard = ({
	isSearchErr,
	setIsSuperSearch,
	setOpenModal,
	setFilterBy,
	isSuperSearch,
	filterBy,
	postResultsCounts,
	peopleResultsCounts,
	setPostsPage,
	setPeoplePage
}: Props) => {
	const router = useRouter();

	return ((filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && postResultsCounts === 0) || (filterBy === EFilterBy.People && peopleResultsCounts === 0) ? (
		<div className='mb-5 mt-6 flex flex-col items-center justify-center'>
			<div className='text-sm font-medium tracking-[0.01em] text-bodyBlue'>
				<div className='mt-5 flex flex-col items-center justify-center'>
					<EmptyResultsIcon />
					<span className='mt-6 text-center text-sm font-medium tracking-[0.01em] text-bodyBlue'>
						{!isSearchErr ? 'No search results found. You may want to try using different keywords.' : 'Please enter at least 3 characters to proceed.'}
					</span>
				</div>
			</div>
			{!isSuperSearch && (
				<Button
					onClick={() => {
						setFilterBy(EFilterBy.Referenda);
						setPostsPage(1);
						setPeoplePage({ page: 1, totalPeople: 0 });
						setIsSuperSearch(true);
					}}
					className='mt-6 flex items-center justify-center gap-1.5 rounded-[4px] bg-pink_primary text-sm font-medium text-white'
				>
					<SuperSearchIcon />
					<span>Use Super Search</span>
				</Button>
			)}
			<div className='my-4 w-[50%] max-md:w-[80%]'>
				<Divider className='border-[1px] text-[#90A0B7]'>
					<span className='text-[10px] font-medium'>OR</span>
				</Divider>
			</div>
			<div className='flex gap-1 text-sm font-medium tracking-[0.01em] text-bodyBlue'>
				<span>See </span>
				<span
					onClick={() => {
						router.push('/');
						setOpenModal(false);
					}}
					className='mx-[2px] cursor-pointer border-[0px] border-b-[1px] border-solid leading-[-8px] text-pink_primary'
				>
					Latest Activity
				</span>
				<span>on Polkassembly.</span>
			</div>
		</div>
	) : !isSuperSearch ? (
		<div className='mb-2 flex flex-col items-center justify-center'>
			<label className='text-sm font-medium tracking-[0.01em] text-bodyBlue'>Didn’t find what you were looking for?</label>
			<Button
				onClick={() => {
					setFilterBy(EFilterBy.Referenda);
					setPostsPage(1);
					setPeoplePage({ page: 1, totalPeople: 0 });
					setIsSuperSearch(true);
				}}
				className='mt-4 flex items-center justify-center gap-1.5 rounded-[4px] bg-pink_primary text-sm font-medium text-white'
			>
				<SuperSearchIcon />
				<span>Use Super Search</span>
			</Button>
		</div>
	) : null;
};
export default SearchErrorsCard;
