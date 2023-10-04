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

<<<<<<< HEAD
	return (((filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && postResultsCounts === 0)
      || (filterBy ===  EFilterBy.People && peopleResultsCounts === 0 )
		? <div className='flex flex-col justify-center items-center mt-6 mb-5'>
			<div className='text-blue-light-high dark:text-blue-dark-high text-sm font-medium tracking-[0.01em]'>
				<div className='flex flex-col mt-5 justify-center items-center'>
					<EmptyResultsIcon/>
					<span className='text-sm font-medium text-blue-light-high dark:text-blue-dark-high mt-6 tracking-[0.01em] text-center'>{!isSearchErr ? 'No search results found. You may want to try using different keywords.' : 'Please enter at least 3 characters to proceed.'}</span>
				</div>
			</div>
			{!isSuperSearch && <Button onClick={() => {setFilterBy(EFilterBy.Referenda); setPostsPage(1); setPeoplePage({ page: 1, totalPeople: 0 }); setIsSuperSearch(true);}} className='flex items-center justify-center gap-1.5 bg-pink_primary text-white text-sm font-medium rounded-[4px] mt-6'>
				<SuperSearchIcon/>
				<span>Use Super Search</span>
			</Button>}
			<div className='w-[50%] max-md:w-[80%] my-4'>
				<Divider className='text-[#90A0B7] border-[1px]'><span className='text-[10px] font-medium'>OR</span></Divider>
			</div>
			<div className='text-sm text-blue-light-high dark:text-blue-dark-high font-medium tracking-[0.01em] flex gap-1'><span>See </span><span onClick={() =>  {router.push(checkGov2Route(router?.pathname) ? '/opengov' : '/'); setOpenModal(false);}} className='text-pink_primary mx-[2px] border-solid border-[0px] border-b-[1px] leading-[-8px] cursor-pointer'>Latest Activity</span><span >on Polkassembly.</span></div>
		</div>
		:!isSuperSearch ?
			<div className='flex flex-col justify-center items-center mb-2'>
				<label className='text-sm font-medium text-blue-light-high dark:text-blue-dark-high tracking-[0.01em]'>Didn’t find what you were looking for?</label>
				<Button onClick={() => {setFilterBy(EFilterBy.Referenda); setPostsPage(1); setPeoplePage({ page: 1, totalPeople: 0 }); setIsSuperSearch(true);}} className='flex items-center justify-center gap-1.5 bg-pink_primary text-white text-sm font-medium rounded-[4px] mt-4'>
					<SuperSearchIcon/>
=======
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
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
