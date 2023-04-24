// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import { Button } from 'antd';
import DelegateModal from '../Listing/Tracks/DelegateModal';

interface Props{
  trackName: string;
}

const DelegateCard = ({ trackName }: Props) => {

	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');

	const handleClick = () => {
		setOpen(true);
		setAddress(address);
	};
	return <div className='pt-5  border-solid border-[1px] border-[#D2D8E0] rounded-b-[6px]'>
		<div className='flex justify-between items-center px-5'>
			<Address address='5GBnMKKUHNbN2fqBY4NbwMMNNieJLYHjr3p9J5W9i1nxKk8e' />
			<Button onClick={handleClick} className='h-[40px] py-1 px-4 flex justify-around items-center rounded-md text-pink_primary bg-transparent shadow-none gap-2 mr-1 ml-1 border-none'>
				<DelegatesProfileIcon/>
				<span className='text-sm font-medium'>
              Delegate
				</span>
			</Button>
		</div>
		<div className = ' text-sm tracking-[0.015em] text-[#576D8B] pl-[56px] min-h-[42px] mb-[16px]'>No Bio</div>
		<div className='border-solid flex min-h-[92px] justify-between border-0 border-t-[1px]  border-[#D2D8E0]'>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[24px] font-medium text-[#243A57]'>
				<div className='flex gap-1 items-end justify-center'> 1k
					<span className='text-sm font-normal text-[#243A57]'>DOT</span>
				</div>
				<div className='text-xs font-normal mt-[4px] text-[#576D8B]'>Voting power</div>
			</div>
			<div className='pt-4 flex items-center flex-col border-solid w-[33%] border-0 border-x-[1px] border-[#D2D8E0] text-[#243A57] text-[24px] font-semibold'>
        24
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal'>Voted proposals </span><span className='text-xs font-normal text-[#576D8B]'>(Past 30 days)</span>
			</div>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[#243A57] text-[24px] font-semibold'>
        12
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal'>Received Delegation</span>
			</div>
		</div>
		<DelegateModal trackName={trackName} defaultTarget={address} open={open} setOpen={setOpen} />
	</div>;
};

export default DelegateCard;