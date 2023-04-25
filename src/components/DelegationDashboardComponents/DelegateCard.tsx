// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import { Button } from 'antd';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { IDelegate } from '~src/types';
import NovaWalletIcon from '~assets/delegation-tracks/nova-wallet.svg';
import userProfileBalances from '~src/util/userProfieBalances';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext, useNetworkContext } from '~src/context';
import formatBnBalance from '~src/util/formatBnBalance';
import styled from 'styled-components';

interface Props{
  trackName: string;
  delegate: IDelegate;
  className: string;
}

const DelegateCard = ({ trackName, delegate, className }: Props) => {

	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [balance, setBalance] = useState<string>('0');
	const [lockBalance, setLockBalance] = useState<string>('0');
	const [transferableBalance, setTransferableBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;

	useEffect(() => {

		userProfileBalances({ address: delegate?.address , api, apiReady, network, setBalance, setLockBalance, setTransferableBalance });

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	const handleClick = () => {
		setOpen(true);
		setAddress(address);
	};
	return <div className={`border-solid border-[1px] border-[#D2D8E0] rounded-[6px] ${className}`}>

		{delegate?.isNovaWalletDelegate && <div className='h-[35px] border-[#3C74E1] border-solid border-[1px] rounded-t-[5px] bg-[#e2eafb] px-[19px] flex items-center gap-[11px]'>
			<NovaWalletIcon/>
			<span className='text-xs text-[#798aa2]'>Nova Wallet Delegate</span>
		</div>}

		<div className='flex justify-between items-center px-5 pt-5'>
			<Address address={delegate?.address}/>
			<Button onClick={handleClick} className='h-[40px] border-none hover:border-solid py-1 px-4 flex justify-around items-center rounded-md text-pink_primary bg-transparent shadow-none gap-2 mr-1 ml-1 '>
				<DelegatesProfileIcon/>
				<span className='text-sm font-medium'>
              Delegate
				</span>
			</Button>
		</div>

		<p className = 'text-sm tracking-[0.015em] text-[#576D8B] pl-[56px] h-[60px] mb-[16px] mt-2 w-[95%] bio'>
			{delegate?.bio ? delegate?.bio : 'No Bio'}
		</p>
		<div className='border-solid flex min-h-[92px] justify-between border-0 border-t-[1px]  border-[#D2D8E0]'>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[24px] font-medium text-[#243A57]'>
				<div className='flex gap-1 items-end justify-center'> {formatBnBalance(balance,{ numberAfterComma:2, withUnit:false },network)}
					<span className='text-sm font-normal text-[#243A57]'>{unit}</span>
				</div>
				<div className='text-xs font-normal mt-[4px] text-[#576D8B]'>Voting power</div>
			</div>
			<div className='pt-4 flex items-center flex-col border-solid w-[33%] border-0 border-x-[1px] border-[#D2D8E0] text-[#243A57] text-[24px] font-semibold'>
				{delegate?.voted_proposals_count}
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal'>Voted proposals </span><span className='text-xs font-normal text-[#576D8B]'>(Past 30 days)</span>
			</div>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[#243A57] text-[24px] font-semibold'>
				{delegate?.active_delegation_count}
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal text-center'>Received Delegation</span>
			</div>
		</div>
		<DelegateModal trackName={trackName} defaultTarget={delegate?.address} open={open} setOpen={setOpen} />
	</div>;
};

export default styled(DelegateCard)`
.bio{
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; 
  width: 250px;
  overflow: hidden;
}`;