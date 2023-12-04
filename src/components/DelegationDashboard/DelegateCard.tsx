// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import { Button, Modal } from 'antd';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { IDelegate } from '~src/types';
import NovaWalletIcon from '~assets/delegation-tracks/nova-wallet.svg';
import ParityTechIcon from '~assets/icons/polkadot-logo.svg';
import userProfileBalances from '~src/util/userProfieBalances';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext } from '~src/context';
import styled from 'styled-components';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import SocialLink from '~src/ui-components/SocialLinks';
import { socialLinks } from '../UserProfile/Details';
import { ESocialType } from '~src/auth/types';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import BN from 'bn.js';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';

interface Props {
	delegate: IDelegate;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
}
const ZERO_BN = new BN(0);

const DelegateCard = ({ delegate, className, trackNum, disabled }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [balance, setBalance] = useState<BN>(ZERO_BN);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [social_links, setSocial_links] = useState<any[]>([]);
	const [openReadMore, setOpenReadMore] = useState<boolean>(false);
	const currentUser = useUserDetailsSelector();

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady || !delegate?.address) return;

		api.derive.accounts.info(delegate?.address, (info: DeriveAccountInfo) => {
			setSocial_links([...social_links, { link: info.identity?.email, type: ESocialType.EMAIL }, { link: info.identity?.twitter, type: ESocialType.TWITTER }]);
		});

		(async () => {
			const balances = await userProfileBalances({ address: delegate?.address, api, apiReady, network });
			setBalance(balances?.freeBalance || ZERO_BN);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	const handleClick = () => {
		// GAEvent for delegate CTA clicked
		trackEvent('delegate_cta_clicked', 'clicked_delegate_cta', {
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		setOpen(true);
		setAddress(address);
	};
	return (
		<div
			className={`rounded-[6px] border-[1px] border-solid border-[#D2D8E0] dark:border-[#3B444F]  dark:border-separatorDark  ${
				delegate?.dataSource === 'nova' ? 'hover:border-[#3C74E1]' : 'hover:border-pink_primary'
			} ${className}`}
		>
			{delegate?.dataSource === 'nova' && (
				<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center gap-[11px] rounded-t-[6px] border-[1px] border-solid border-[#3C74E1] bg-[#e2eafb] px-5 dark:bg-[#141C2D]'>
					<NovaWalletIcon />
					<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Nova Wallet Delegate</span>
				</div>
			)}

			{delegate?.dataSource === 'parity' && (
				<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center gap-[11px] rounded-t-[6px] border-[1px] border-solid border-pink_primary px-5 dark:bg-[#33071E]'>
					<ParityTechIcon />
					<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Polkadot Delegate</span>
				</div>
			)}

			<div className='flex items-center justify-between px-5 pt-5'>
				<div className='flex gap-2 max-lg:justify-start'>
					<Address
						address={delegate?.address}
						displayInline
						destroyTooltipOnHide
						iconSize={34}
						usernameClassName='font-semibold'
						isTruncateUsername={false}
						className='flex items-center'
					/>

					<div className='-mt-5 mr-2 flex gap-2'>
						{socialLinks
							?.filter((item) => item === ESocialType.EMAIL || item === ESocialType.TWITTER)
							.map((social, index) => {
								const link = social_links && Array.isArray(social_links) ? social_links?.find((s) => s.type === social)?.link || '' : '';
								return (
									<SocialLink
										className='mt-4 flex h-[39px] w-[40px] items-center justify-center rounded-[20px] bg-[#edeff3] p-[10px] text-xl text-[#96A4B6] hover:text-[#576D8B] dark:bg-inactiveIconDark'
										key={index}
										link={link}
										disable={!link}
										type={social}
										iconClassName={`text-[20px] ${link ? 'text-[#576D8B] dark:text-blue-dark-medium' : 'text-[#96A4B6]'}`}
									/>
								);
							})}
					</div>
				</div>
				<Button
					disabled={disabled}
					onClick={handleClick}
					className={`ml-1 mt-[1px] flex h-[40px] items-center justify-around gap-2 rounded-md border-none bg-transparent px-4 py-1 text-pink_primary shadow-none hover:border-solid hover:border-pink_primary ${
						disabled && 'opacity-50'
					}`}
				>
					<DelegatesProfileIcon />
					<span className='text-sm font-medium'>Delegate</span>
				</Button>
			</div>

			<div className={'tracking-[0.015em]text-[#576D8B] mb-[16px] mt-2 flex min-h-[56px] gap-1 pl-[56px] text-sm dark:text-blue-dark-high'}>
				<p className='bio w-[80%]'>{delegate?.bio ? delegate?.bio : 'No Bio'}</p>
				{delegate?.bio.length > 100 && (
					<span
						onClick={() => setOpenReadMore(true)}
						className='mt-1 flex cursor-pointer items-center justify-center text-xs leading-3 text-[#1B61FF]'
					>
						Read more
					</span>
				)}
			</div>
			<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-[#D2D8E0] dark:border-[#3B444F]  dark:border-separatorDark '>
				<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
					<div className='flex items-end justify-center gap-1'>
						{formatedBalance(balance.toString(), unit, 2)}
						<span className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>{unit}</span>
					</div>
					<div className='font-normaltext-[#576D8B] mt-[4px] text-xs dark:text-blue-dark-medium'>Voting power</div>
				</div>
				<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-[#D2D8E0] pt-4  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
					{delegate?.voted_proposals_count}
					<span className='font-normaltext-[#576D8B] mb-[2px] mt-1 text-xs dark:text-blue-dark-medium'>Voted proposals </span>
					<span className='font-normaltext-[#576D8B] text-xs dark:text-blue-dark-medium'>(Past 30 days)</span>
				</div>
				<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
					{delegate?.active_delegation_count}
					<span className='font-normaltext-[#576D8B] mb-[2px] mt-1 text-center text-xs dark:text-blue-dark-medium'>Received Delegation</span>
				</div>
			</div>
			<DelegateModal
				defaultTarget={delegate?.address}
				open={open}
				trackNum={trackNum}
				setOpen={setOpen}
			/>
			<Modal
				open={openReadMore}
				onCancel={() => setOpenReadMore(false)}
				className={'modal w-[725px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay'}
				footer={false}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			>
				<div className={'pt-[20px]'}>
					<div className='flex items-center justify-between pl-8 pt-2'>
						<div className='flex gap-2 max-lg:justify-start'>
							<Address
								address={delegate?.address}
								displayInline
								iconSize={40}
								isTruncateUsername={false}
								usernameClassName='text-[20px] font-medium'
							/>

							<div className='-mt-4 mr-2 flex gap-2'>
								{socialLinks?.map((social, index) => {
									const link = social_links && Array.isArray(social_links) ? social_links?.find((s) => s.type === social)?.link || '' : '';
									return (
										<SocialLink
											className='mt-4 flex h-[39px] w-[40px] items-center justify-center rounded-[20px] bg-[#edeff3] p-[10px] text-xl text-[#96A4B6] hover:text-[#576D8B] dark:bg-inactiveIconDark'
											key={index}
											link={link}
											disable={!link}
											type={social}
											iconClassName={`text-[20px] ${link ? 'text-[#576D8B] dark:text-blue-dark-medium' : 'text-[#96A4B6]'}`}
										/>
									);
								})}
							</div>
						</div>
					</div>

					<div className={'tracking-[0.015em]text-[#576D8B] mb-[16px] mt-2 flex min-h-[56px] gap-1 pl-[56px] text-sm dark:text-blue-dark-high'}>
						<p className='w-[90%]'>{delegate?.bio ? delegate?.bio : 'No Bio'}</p>
					</div>
					<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-[#D2D8E0] dark:border-[#3B444F]  dark:border-separatorDark '>
						<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							<div className='flex items-end justify-center gap-1'>
								{formatedBalance(balance.toString(), unit, 2)}
								<span className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>{unit}</span>
							</div>
							<div className='font-normaltext-[#576D8B] mt-[4px] text-xs dark:text-blue-dark-medium'>Voting power</div>
						</div>
						<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-[#D2D8E0] pt-4  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
							{delegate?.voted_proposals_count}
							<span className='font-normaltext-[#576D8B] mb-[2px] mt-1 text-xs dark:text-blue-dark-medium'>Voted proposals </span>
							<span className='font-normaltext-[#576D8B] text-xs dark:text-blue-dark-medium'>(Past 30 days)</span>
						</div>
						<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
							{delegate?.active_delegation_count}
							<span className='font-normaltext-[#576D8B] mb-[2px] mt-1 text-center text-xs dark:text-blue-dark-medium'>Received Delegation</span>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default styled(DelegateCard)`
	.bio {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		width: 250px;
		overflow: hidden;
	}
	.modal .ant-modal-content {
		padding: 0px 0px !important;
		border-radius: 14px !important;
		box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.08) !important;
	}
`;
