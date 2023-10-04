// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import { Button, Modal } from 'antd';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { IDelegate } from '~src/types';
import { NovaWalletIcon,ParityTechIcon } from '~src/ui-components/CustomIcons';
import userProfileBalances from '~src/util/userProfieBalances';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext, useNetworkContext } from '~src/context';
import styled from 'styled-components';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import SocialLink from '~src/ui-components/SocialLinks';
import { socialLinks } from '../UserProfile/Details';
import { ESocialType } from '~src/auth/types';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import BN from 'bn.js';
import { useTheme } from 'next-themes';

interface Props {
	delegate: IDelegate;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
}
const ZERO_BN = new BN(0);

const DelegateCard = ({ delegate, className, trackNum, disabled }: Props) => {
	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [balance, setBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [social_links, setSocial_links] = useState<any[]>([]);
	const [openReadMore, setOpenReadMore] = useState<boolean>(false);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
		setOpen(true);
		setAddress(address);
	};
<<<<<<< HEAD
	return <div className={`border-solid border-[1px] border-[#D2D8E0] dark:border-separatorDark rounded-[6px]  ${delegate?.dataSource === 'nova' ? 'hover:border-[#3C74E1]' : 'hover:border-pink_primary'} ${className}`}>

		{delegate?.dataSource === 'nova' && <div className='h-[36px] border-[#3C74E1] border-solid border-[1px] rounded-t-[6px] mt-[-1px] bg-[#e2eafb] dark:bg-[#141C2D] px-5 flex items-center gap-[11px] mr-[-0.6px] ml-[-0.6px]'>
			<NovaWalletIcon/>
			<span className='text-xs text-blue-light-high dark:text-blue-dark-high font-normal'>Nova Wallet Delegate</span>
		</div>}

		{
			delegate?.dataSource === 'parity' && <div className='h-[36px] border-pink_primary border-solid border-[1px] rounded-t-[6px] mt-[-1px] bg-[#FCE5F2] dark:bg-[#33071E] px-5 flex items-center gap-[11px] mr-[-0.6px] ml-[-0.6px]'>
				<ParityTechIcon className='text-pink_primary'/>
				<span className='text-xs text-blue-light-high dark:text-blue-dark-high font-normal'>Polkadot Delegate</span>
			</div>
		}

		<div className='flex justify-between items-center px-5 pt-5'>
			<div className='flex gap-2 max-lg:justify-start'>
				<Address address={delegate?.address} displayInline identiconSize={34}/>

				<div className='flex -mt-5 gap-2 mr-2'>
					{
						socialLinks?.filter((item) => item === ESocialType.EMAIL || item === ESocialType.TWITTER).map((social, index) => {
							const link = (social_links && Array.isArray(social_links))? social_links?.find((s) => s.type === social)?.link || '': '';
							return (
								<SocialLink
									className='flex items-center justify-center text-xl text-[#96A4B6] hover:text-[#576D8B] p-[10px] bg-[#edeff3] dark:bg-inactiveIconDark rounded-[20px] h-[39px] w-[40px] mt-4'
									key={index}
									link={link}
									disable={!link}
									type={social}
									iconClassName={`text-[20px] ${link ? 'text-[#576D8B] dark:text-blue-dark-medium' : 'text-[#96A4B6] dark:text-[#424141]'}`}

								/>
							);
						})
					}
				</div>
			</div>
			<Button disabled={disabled} onClick={handleClick} className={`h-[40px] border-none hover:border-solid py-1 px-4 flex justify-around items-center rounded-md text-pink_primary bg-transparent shadow-none gap-2 ml-1 mt-[1px] hover:border-pink_primary ${disabled && 'opacity-50'}`}>
				<DelegatesProfileIcon/>
				<span className='text-sm font-medium'>
              Delegate
				</span>
			</Button>
		</div>

		<div className={'text-sm tracking-[0.015em] text-[#576D8B] dark:text-white dark:font-light pl-[56px] min-h-[56px] mb-[16px] mt-2 flex gap-1'}>
			<p className ='w-[80%] bio'>
				{delegate?.bio ? delegate?.bio : 'No Bio'}
			</p>
			{delegate?.bio.length > 100  && <span onClick={() => setOpenReadMore(true)} className='text-[#1B61FF] text-xs flex justify-center items-center mt-1 leading-3 cursor-pointer'>Read more</span>}
		</div>
		<div className='border-solid flex min-h-[92px] justify-between border-0 border-t-[1px]  border-[#D2D8E0] dark:border-separatorDark'>
			<div className='pt-4 flex items-center flex-col w-[33%] text-[20px] font-semibold text-blue-light-high dark:text-blue-dark-high'>
				<div className='flex gap-1 items-end justify-center'>
					{formatedBalance(balance.toString(), unit, 2)}
					<span className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>{unit}</span>
				</div>
				<div className='text-xs font-normal mt-[4px] text-[#576D8B] dark:text-blue-dark-medium'>Voting power</div>
			</div>
			<div className='pt-4 flex items-center flex-col border-solid w-[33%] border-0 border-x-[1px] border-[#D2D8E0] dark:border-separatorDark text-blue-light-high dark:text-blue-dark-high text-[20px] font-semibold'>
				{delegate?.voted_proposals_count}
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal dark:text-blue-dark-medium'>Voted proposals </span><span className='text-xs font-normal text-[#576D8B] dark:text-blue-dark-medium'>(Past 30 days)</span>
			</div>
			<div className='pt-4 flex items-center flex-col w-[33%] text-blue-light-high dark:text-blue-dark-high text-[20px] font-semibold'>
				{delegate?.active_delegation_count}
				<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal text-center dark:text-blue-dark-medium'>Received Delegation</span>
			</div>
		</div>
		<DelegateModal theme={theme} defaultTarget={delegate?.address} open={open} trackNum={trackNum} setOpen={setOpen} />
		<Modal
			open={openReadMore}
			onCancel={() => setOpenReadMore(false)}
			className={`w-[725px] max-md:w-full modal ${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''}`}
			footer={false}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
=======
	return (
		<div
			className={`rounded-[6px] border-[1px] border-solid border-[#D2D8E0]  ${
				delegate?.dataSource === 'nova' ? 'hover:border-[#3C74E1]' : 'hover:border-pink_primary'
			} ${className}`}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		>
			{delegate?.dataSource === 'nova' && (
				<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center gap-[11px] rounded-t-[6px] border-[1px] border-solid border-[#3C74E1] bg-[#e2eafb] px-5'>
					<NovaWalletIcon />
					<span className='text-xs font-normal text-bodyBlue'>Nova Wallet Delegate</span>
				</div>
			)}

			{delegate?.dataSource === 'parity' && (
				<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center gap-[11px] rounded-t-[6px] border-[1px] border-solid border-pink_primary bg-[#FCE5F2] px-5'>
					<ParityTechIcon />
					<span className='text-xs font-normal text-bodyBlue'>Polkadot Delegate</span>
				</div>
			)}

			<div className='flex items-center justify-between px-5 pt-5'>
				<div className='flex gap-2 max-lg:justify-start'>
					<Address
						address={delegate?.address}
						displayInline
						iconSize={34}
						usernameClassName='font-semibold'
						isTruncateUsername={false}
					/>

					<div className='-mt-5 mr-2 flex gap-2'>
						{socialLinks
							?.filter((item) => item === ESocialType.EMAIL || item === ESocialType.TWITTER)
							.map((social, index) => {
								const link = social_links && Array.isArray(social_links) ? social_links?.find((s) => s.type === social)?.link || '' : '';
								return (
									<SocialLink
										className='mt-4 flex h-[39px] w-[40px] items-center justify-center rounded-[20px] bg-[#edeff3] p-[10px] text-xl text-[#96A4B6] hover:text-[#576D8B]'
										key={index}
										link={link}
										disable={!link}
										type={social}
										iconClassName={`text-[20px] ${link ? 'text-[#576D8B]' : 'text-[#96A4B6]'}`}
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

			<div className={'mb-[16px] mt-2 flex min-h-[56px] gap-1 pl-[56px] text-sm tracking-[0.015em] text-[#576D8B]'}>
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
			<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-[#D2D8E0] '>
				<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue'>
					<div className='flex items-end justify-center gap-1'>
						{formatedBalance(balance.toString(), unit, 2)}
						<span className='text-sm font-normal text-bodyBlue'>{unit}</span>
					</div>
					<div className='mt-[4px] text-xs font-normal text-[#576D8B]'>Voting power</div>
				</div>
				<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-[#D2D8E0] pt-4 text-[20px] font-semibold text-bodyBlue'>
					{delegate?.voted_proposals_count}
					<span className='mb-[2px] mt-1 text-xs font-normal text-[#576D8B]'>Voted proposals </span>
					<span className='text-xs font-normal text-[#576D8B]'>(Past 30 days)</span>
				</div>
				<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue'>
					{delegate?.active_delegation_count}
					<span className='mb-[2px] mt-1 text-center text-xs font-normal text-[#576D8B]'>Received Delegation</span>
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
				className='modal w-[725px] max-md:w-full'
				footer={false}
				wrapClassName={className}
				closeIcon={<CloseIcon />}
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
<<<<<<< HEAD
											className='flex items-center justify-center text-xl text-[#96A4B6] hover:text-[#576D8B] p-[10px] bg-[#edeff3] dark:bg-inactiveIconDark rounded-[20px] h-[39px] w-[40px] mt-4'
=======
											className='mt-4 flex h-[39px] w-[40px] items-center justify-center rounded-[20px] bg-[#edeff3] p-[10px] text-xl text-[#96A4B6] hover:text-[#576D8B]'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
											key={index}
											link={link}
											disable={!link}
											type={social}
<<<<<<< HEAD
											iconClassName={`text-[20px] ${link ? 'text-[#576D8B] dark:text-blue-dark-medium' : 'text-[#96A4B6] dark:text-[#424141]'}`}

=======
											iconClassName={`text-[20px] ${link ? 'text-[#576D8B]' : 'text-[#96A4B6]'}`}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
										/>
									);
								})}
							</div>
						</div>
					</div>

<<<<<<< HEAD
				<div className={'text-sm tracking-[0.015em] text-[#576D8B] dark:text-blue-dark-high dark:font-light pl-[56px] min-h-[56px] mb-[16px] mt-2 flex gap-1 '}>
					<p className ='w-[90%]'>
						{delegate?.bio ? delegate?.bio : 'No Bio'}
					</p>
				</div>
				<div className='border-solid flex min-h-[92px] justify-between border-0 border-t-[1px]  border-[#D2D8E0] dark:border-separatorDark'>
					<div className='pt-4 flex items-center flex-col w-[33%] text-[20px] font-semibold text-blue-light-high dark:text-blue-dark-high'>
						<div className='flex gap-1 items-end justify-center'>
							{formatedBalance(balance.toString(), unit, 2)}
							<span className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>{unit}</span>
						</div>
						<div className='text-xs font-normal mt-[4px] text-[#576D8B] dark:text-blue-dark-medium'>Voting power</div>
					</div>
					<div className='pt-4 flex items-center flex-col border-solid w-[33%] border-0 border-x-[1px] border-[#D2D8E0] dark:border-separatorDark text-blue-light-high dark:text-blue-dark-high text-[20px] font-semibold'>
						{delegate?.voted_proposals_count}
						<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal dark:text-blue-dark-medium'>Voted proposals </span><span className='text-xs font-normal text-[#576D8B] dark:text-blue-dark-medium'>(Past 30 days)</span>
					</div>
					<div className='pt-4 flex items-center flex-col w-[33%] text-blue-light-high dark:text-blue-dark-high text-[20px] font-semibold'>
						{delegate?.active_delegation_count}
						<span className='text-[#576D8B] mb-[2px] mt-1 text-xs font-normal text-center dark:text-blue-dark-medium'>Received Delegation</span>
					</div>
				</div></div>
		</Modal>
	</div>;
=======
					<div className={'mb-[16px] mt-2 flex min-h-[56px] gap-1 pl-[56px] text-sm tracking-[0.015em] text-[#576D8B] '}>
						<p className='w-[90%]'>{delegate?.bio ? delegate?.bio : 'No Bio'}</p>
					</div>
					<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-[#D2D8E0] '>
						<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue'>
							<div className='flex items-end justify-center gap-1'>
								{formatedBalance(balance.toString(), unit, 2)}
								<span className='text-sm font-normal text-bodyBlue'>{unit}</span>
							</div>
							<div className='mt-[4px] text-xs font-normal text-[#576D8B]'>Voting power</div>
						</div>
						<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-[#D2D8E0] pt-4 text-[20px] font-semibold text-bodyBlue'>
							{delegate?.voted_proposals_count}
							<span className='mb-[2px] mt-1 text-xs font-normal text-[#576D8B]'>Voted proposals </span>
							<span className='text-xs font-normal text-[#576D8B]'>(Past 30 days)</span>
						</div>
						<div className='flex w-[33%] flex-col items-center pt-4 text-[20px] font-semibold text-bodyBlue'>
							{delegate?.active_delegation_count}
							<span className='mb-[2px] mt-1 text-center text-xs font-normal text-[#576D8B]'>Received Delegation</span>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
