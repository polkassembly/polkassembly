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
import styled from 'styled-components';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import SocialLink from '~src/ui-components/SocialLinks';
import { socialLinks } from '../UserProfile/Details';
import { ESocialType } from '~src/auth/types';
import { formatBalance } from '@polkadot/util';

interface Props{
  delegate: IDelegate;
  className?: string;
  trackNum?: number;
}

const DelegateCard = ({ delegate, className, trackNum }: Props) => {

	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [balance, setBalance] = useState<string>('0');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [lockBalance, setLockBalance] = useState<string>('0');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [transferableBalance, setTransferableBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const [isExpand, setIsExpand] = useState<boolean>(false);
	const [social_links, setSocial_links]= useState<any[]>([]);

	const formatedBalance = (balance: string) => {
		const formated = formatBalance(balance.toString(), { forceUnit: unit, withUnit: false }).split('.');
		if(Number(formated?.[0]) > 0){
			return formated?.[1] ? `${formated[0]}.${formated[1].slice(0,2)}`: '0';
		}else{
			return formated.join('.');
		}

	};

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {

		if(!api || !apiReady) return;

		api.derive.accounts.info(delegate?.address, (info: DeriveAccountInfo) => {
			setSocial_links([...social_links, { link: info.identity?.email, type: ESocialType.EMAIL }, { link: info.identity?.twitter, type: ESocialType.TWITTER }]);
		});

		userProfileBalances({ address: delegate?.address , api, apiReady, network, setBalance, setLockBalance, setTransferableBalance });

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	const handleClick = () => {
		setOpen(true);
		setAddress(address);
	};
	return <div className={`border-solid border-[1px] border-[#D2D8E0] rounded-[6px]  ${delegate?.isNovaWalletDelegate ? 'hover:border-[#3C74E1]' : 'hover:border-pink_primary'} ${className}`}>

		{delegate?.isNovaWalletDelegate && <div className='h-[35px] border-[#3C74E1] border-solid border-[1px] rounded-t-[5px] bg-[#e2eafb] px-[19px] flex items-center gap-[11px]'>
			<NovaWalletIcon/>
			<span className='text-xs text-[#798aa2]'>Nova Wallet Delegate</span>
		</div>}

		<div className='flex justify-between items-center px-5 pt-5'>
			<div className='flex gap-2 max-lg:justify-start'>
				<Address address={delegate?.address} displayInline identiconSize={34}/>

				<div className='flex -mt-5 gap-2 mr-2'>
					{
						socialLinks?.filter((item) => item === ESocialType.EMAIL || item === ESocialType.TWITTER).map((social, index) => {
							const link = (social_links && Array.isArray(social_links))? social_links?.find((s) => s.type === social)?.link || '': '';
							return (
								<SocialLink
									className='flex items-center justify-center text-xl text-[#96A4B6] hover:text-[#576D8B] p-[10px] bg-[#edeff3] rounded-[20px] h-[39px] w-[40px] mt-4'
									key={index}
									link={link}
									disable={!link}
									type={social}
									iconClassName={`text-[20px] ${link ? 'text-[#576D8B]' : 'text-[#96A4B6]'}`}

								/>
							);
						})
					}
				</div>
			</div>
			<Button onClick={handleClick} className='h-[40px] border-none hover:border-solid py-1 px-4 flex justify-around items-center rounded-md text-pink_primary bg-transparent shadow-none gap-2 ml-1 mt-[1px]'>
				<DelegatesProfileIcon/>
				<span className='text-sm font-medium'>
              Delegate
				</span>
			</Button>
		</div>

		<div className={`text-sm tracking-[0.015em] text-[#576D8B] pl-[56px] min-h-[56px] mb-[16px] mt-2 flex gap-1 ${isExpand && 'h-[56px]'}`}>
			<p className = {` w-[80%] ${!isExpand ? 'bio': 'overflow-y-scroll overflow-x-hidden'  }`}>
				{delegate?.bio ? delegate?.bio : 'No Bio'}
			</p>
			{delegate?.bio.length > 100  && <span onClick={() => setIsExpand((pre) => !pre)} className='text-[#1B61FF] text-xs flex justify-center items-center mt-1 leading-3 cursor-pointer'>{!isExpand ? 'Read more' : 'Show less'}</span>}
		</div>
		<div className='border-solid flex min-h-[92px] justify-between border-0 border-t-[1px]  border-[#D2D8E0] '>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[20px] font-semibold text-[#243A57]'>
				<div className='flex gap-1 items-end justify-center'>
					{formatedBalance(balance)}
					<span className='text-sm font-normal text-[#243A57]'>{unit}</span>
				</div>
				<div className='text-xs font-normal mt-[4px] text-[#576D8B]'>Voting power</div>
			</div>
			<div className='pt-4 flex items-center flex-col border-solid w-[33%] border-0 border-x-[1px] border-[#D2D8E0] text-[#243A57] text-[20px] font-semibold'>
				{delegate?.voted_proposals_count}
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal'>Voted proposals </span><span className='text-xs font-normal text-[#576D8B]'>(Past 30 days)</span>
			</div>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[#243A57] text-[20px] font-semibold'>
				{delegate?.active_delegation_count}
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal text-center'>Received Delegation</span>
			</div>
		</div>
		<DelegateModal defaultTarget={delegate?.address} open={open} trackNum={trackNum} setOpen={setOpen} />
	</div>;
};

export default styled(DelegateCard)`
.bio{
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; 
  width: 250px;
  overflow: hidden;
}`;