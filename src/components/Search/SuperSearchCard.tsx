// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider } from 'antd';
import React from 'react';
import SuperSearchIcon from '~assets/icons/super-search.svg';
import EmptyResultsIcon from '~assets/search/empty-search.svg';
import Link from 'next/link';
import { EFilterBy } from '.';

interface Props{
  setIsSuperSearch: (pre: boolean) => void;
  setFilterBy: (pre: EFilterBy) => void;
  filterBy: EFilterBy;
  postResultsCounts: number;
  userResultsCounts: number;
  isSuperSearch: boolean;
}

const SuperSearchCard = ({ setIsSuperSearch, setFilterBy, isSuperSearch, filterBy, postResultsCounts, userResultsCounts }: Props) =>
{
	return (((filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && postResultsCounts === 0)
      || (filterBy ===  EFilterBy.Users && userResultsCounts === 0 )
		? <div className='flex flex-col justify-center items-center mt-7 mb-5'>
			<div className='text-[#243A57] text-sm font-medium tracking-[0.01em]'>
				<div className='flex flex-col mt-5 justify-center items-center'>
					<EmptyResultsIcon/>
					<span className='text-sm font-medium text-[#243A57] mt-8 tracking-[0.01em]'>No search results found. You may want to try using different keywords,.</span>
				</div>
			</div>
			{!isSuperSearch && <Button onClick={() => {setIsSuperSearch(true); setFilterBy(EFilterBy.Referenda);}} className='flex items-center justify-center gap-1.5 bg-[#E5007A] text-white text-sm font-medium rounded-[4px] mt-6'>
				<SuperSearchIcon/>
				<span>Use Super Search</span>
			</Button>}
			<div className='w-[50%] max-md:w-[80%] my-8'>
				<Divider className='text-[#90A0B7] border-[1px]'><span className='text-[10px] font-medium'>OR</span></Divider>
			</div>
			<div className='text-sm text-[#243A57] font-medium tracking-[0.01em]'>See latest<Link href='/discussion' className='text-[#E5007A] mx-[2px]'> Discussions</Link> on Polkassembly.</div>
		</div>
		:!isSuperSearch ?
			<div className='flex flex-col justify-center items-center mb-5'>
				<label className='text-sm font-medium text-[#243A57] mt-8 tracking-[0.01em]'>Didn’t find what you were looking for?</label>
				<Button onClick={() => {setIsSuperSearch(true); setFilterBy(EFilterBy.Referenda);}} className='flex items-center justify-center gap-1.5 bg-[#E5007A] text-white text-sm font-medium rounded-[4px] mt-4'>
					<SuperSearchIcon/>
					<span>Use Super Search</span>
				</Button>
			</div>: null
	);
};
export default SuperSearchCard;