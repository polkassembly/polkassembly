// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, Input, Skeleton } from 'antd';

import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import DelegatedIcon from '~assets/icons/delegate.svg';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import DelegateMenuIcon from '~assets/icons/delegate-menu.svg';
import dynamic from 'next/dynamic';
import DelegateCard from './DelegateCard';

const DelegateModal = dynamic(() => import('../Listing/Tracks/DelegateModal'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface Props{
  className?: string;
  trackDetails: any;
}

const Delegate = ( { className,trackDetails }: Props ) => {

	const [expandProposals, setExpandProposals] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);

	const handleChange = (e: any) => {
		setAddress(e.target.value);

	};
	const handleClick = () => {
		setOpen(true);
		setAddress(address);
	};

	return <div className=  {`${className} rounded-[14px] bg-white py-[24px] px-[37px] mt-[22px]`}>
		<div className=' shadow-[0px 4px 6px rgba(0, 0, 0, 0.08] flex items-center justify-between'>
			<div  className='flex jutify-center items-center gap-2'>
				<DelegatedIcon className='mr-[4px]'/>
				<span className='text-[28px] font-semibold tracking-[0.0015em] text-[#243A57]'>
          Delegate
				</span>
			</div>
			<div onClick={() => setExpandProposals(!expandProposals)}>{!expandProposals ? <ExpandIcon/> : <CollapseIcon/>}</div>
		</div>
		{expandProposals && <div className='mt-[24px]'>
			<h4 className='text-sm font-normal text-[#243A57] mb-4'>Enter an address or Select from the list below to delegate your voting power</h4>
			<div className='flex gap-4 items-center'>
				<div className='text-[#576D8BCC] font-normal text-[14px] h-[48px] border-[1px] border-solid border-[#D2D8E0] rounded-md flex items-center justify-between w-[93%] max-lg:w-[85%]'>
					<Input onChange={(e) => handleChange(e)} type='text' placeholder='Enter address to Delegate vote' className='border-0 h-[46px]' />
					<Button onClick={handleClick} disabled={address?.length === 0} className='h-[40px] py-1 px-4 flex justify-around items-center rounded-md bg-pink_primary gap-2 mr-1 ml-1'>
						<DelegatesProfileIcon/>
						<span className='text-white text-sm font-medium'>
              Delegate
						</span>
					</Button>
				</div>
				<DelegateMenuIcon/>
			</div>
			<div className='mt-6'><DelegateCard trackNum = {trackDetails?.trackId} /></div>
		</div>}
		<DelegateModal trackNum={trackDetails?.trackId} defaultTarget={address} open={open} setOpen={setOpen} />
	</div>;
};
export default Delegate;