// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import DelegatesProfileIcon from '~assets/icons/delegate-profile.svg';
import { Button, Divider, Modal, Spin } from 'antd';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import { IDelegate } from '~src/types';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext } from '~src/context';
import styled from 'styled-components';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import BN from 'bn.js';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import { IDelegateBalance } from '../UserProfile/TotalProfileBalances';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import SocialsHandle from '~src/ui-components/SocialsHandle';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import PolkadotIcon from '~assets/delegation-tracks/pa-logo-small-delegate.svg';
import W3FIcon from '~assets/profile/w3f.svg';
import ParityTechIcon from '~assets/icons/polkadot-logo.svg';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import userProfileBalances from '~src/util/userProfieBalances';

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
	const currentUser = useUserDetailsSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openReadMore, setOpenReadMore] = useState<boolean>(false);
	const [votingPower, setVotingPower] = useState<BN>(ZERO_BN);
	const [identity, setIdentity] = useState<DeriveAccountRegistration>();
	const [freeBalance, setFreeBalance] = useState<BN>(ZERO_BN);

	const getData = async () => {
		if (!delegate?.address?.length) return;
		const { data, error } = await nextApiClientFetch<IDelegateBalance>('/api/v1/delegations/total-delegate-balance', {
			addresses: [delegate?.address]
		});
		if (data) {
			const bnVotingPower = new BN(data?.votingPower);
			setVotingPower(bnVotingPower);
		} else if (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getData();
		(async () => {
			const balances = await userProfileBalances({ address: delegate?.address, api, apiReady, network });
			setFreeBalance(balances?.freeBalance || ZERO_BN);
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, delegate?.address]);

	useEffect(() => {
		if (!api || !apiReady || !delegate?.address) return;
		setLoading(true);

		api.derive.accounts.info(delegate?.address, (info: DeriveAccountInfo) => {
			if (info?.identity) {
				setIdentity(info?.identity);
			}
		});
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, delegate]);

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
		<Spin spinning={loading}>
			<div
				className={`rounded-[6px] border-[1px] border-solid border-[#D2D8E0] dark:border-[#3B444F]  dark:border-separatorDark  ${
					delegate?.dataSource.includes('nova') ? 'hover:border-[#3C74E1]' : 'hover:border-pink_primary'
				} ${className}`}
			>
				{delegate?.dataSource.length > 1 ? (
					<div
						className={`ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center space-x-3 rounded-t-[6px] border-[1px] border-solid px-5 ${
							delegate?.dataSource.length > 1
								? 'border-[#485F7D] bg-[#EDEFF3] dark:border-[#9E9E9E] dark:bg-[#3D3F41]'
								: 'border-[#F89118] bg-[#FFF7EF] dark:border-[#F89118] dark:bg-[#422A0D]'
						} `}
					>
						{delegate?.dataSource.includes('polkassembly') && (
							<div className='flex items-center space-x-3'>
								<div className='flex items-center space-x-1'>
									<PolkadotIcon />
									<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Polkassembly</span>
								</div>
								<Divider
									type='vertical'
									className='bg-[#7F8FA4]'
								/>
							</div>
						)}

						{delegate?.dataSource.includes('w3f') && (
							<div className='flex items-center space-x-3'>
								<div className='flex items-center space-x-1'>
									<W3FIcon />
									<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>w3f</span>
								</div>
								<Divider
									type='vertical'
									className='bg-[#7F8FA4]'
								/>
							</div>
						)}
						{delegate?.dataSource.includes('parity') && (
							<div className='flex items-center space-x-3'>
								<div className='flex items-center space-x-[6px]'>
									<ParityTechIcon />
									<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Polkadot</span>
								</div>
								<Divider
									type='vertical'
									className='bg-[#7F8FA4]'
								/>
							</div>
						)}
						{delegate?.dataSource.includes('nova') && (
							<div className='flex items-center space-x-1 '>
								<ImageIcon
									src='/assets/delegation-tracks/nova-wallet.svg'
									alt='nova wallet icon'
								/>
								<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Nova Wallet</span>
							</div>
						)}
					</div>
				) : (
					<>
						{delegate?.dataSource.includes('w3f') && (
							<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center space-x-[2px] rounded-t-[6px] bg-[#272525] px-5'>
								<W3FIcon />
								<span className='text-xs font-normal text-white dark:text-blue-dark-high '>W3F Delegate</span>
							</div>
						)}
						{delegate?.dataSource.includes('nova') && (
							<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center space-x-[2px] rounded-t-[6px] border-[1px] border-solid border-[#3C74E1] bg-[#e2eafb] px-5 dark:bg-[#141C2D]'>
								<ImageIcon
									src='/assets/delegation-tracks/nova-wallet.svg'
									alt='nova wallet icon'
								/>
								<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Nova Wallet Delegate</span>
							</div>
						)}
						{delegate?.dataSource.includes('parity') && (
							<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center space-x-[6px] rounded-t-[6px] border-[1px] border-solid border-[#7A67DF] bg-[#E4E1F9] px-5 dark:bg-[#25203D]'>
								<ParityTechIcon />
								<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Polkadot Delegate</span>
							</div>
						)}
						{delegate?.dataSource.includes('polkassembly') && (
							<div className='ml-[-0.6px] mr-[-0.6px] mt-[-1px] flex h-[36px] items-center space-x-[2px] rounded-t-[6px] border-[1px] border-solid border-pink_primary bg-[#FCE5F2] px-5 dark:bg-[#33071E]'>
								<PolkadotIcon />
								<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>Polkassembly Delegate</span>
							</div>
						)}
					</>
				)}
				<div className='flex items-center justify-between px-5 pt-5'>
					<div className='flex items-center gap-2 max-lg:justify-start'>
						<Address
							address={delegate?.address}
							displayInline
							destroyTooltipOnHide
							iconSize={26}
							usernameClassName='font-semibold'
							isTruncateUsername={false}
							className='flex items-center'
						/>

						<div className='mr-2 flex items-center gap-2'>
							<SocialsHandle
								address={address}
								onchainIdentity={identity || null}
								socials={[]}
								iconSize={18}
								boxSize={32}
							/>
						</div>
					</div>
					<Button
						disabled={disabled}
						onClick={handleClick}
						className={`flex items-center space-x-[6px] border-none bg-transparent px-2 shadow-none ${!!disabled && 'opacity-50'}`}
					>
						<DelegatesProfileIcon />
						<span className='text-sm font-medium text-pink_primary'>Delegate</span>
					</Button>
				</div>

				<div className={'mb-[16px] mt-2 flex min-h-[56px] gap-1 pl-[56px] text-sm font-normal tracking-[0.015em] text-[#243A57] dark:text-blue-dark-high'}>
					<p className='bio w-[80%]'>{delegate?.bio ? delegate?.bio : 'No Bio'}</p>
					{delegate?.bio.length > 100 && (
						<span
							onClick={() => setOpenReadMore(true)}
							className='mt-1 flex cursor-pointer items-center justify-center text-xs font-medium leading-3 text-[#1B61FF]'
						>
							Read more
						</span>
					)}
				</div>
				<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-[#D2D8E0] dark:border-[#3B444F]  dark:border-separatorDark '>
					<div className='flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<div className='flex flex-wrap items-end justify-center'>
							<span className='px-1 text-2xl font-semibold'>{parseBalance(votingPower.add(freeBalance).toString(), 2, false, network)}</span>
							<span className='mb-[3px] text-sm font-normal dark:text-blue-dark-high'>{unit}</span>
						</div>
						<div className='mt-[4px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Voting power</div>
					</div>
					<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-[#D2D8E0] py-3  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
						<span className='text-2xl font-semibold'>{delegate?.voted_proposals_count}</span>
						<div className='mt-[2px] flex flex-col items-center'>
							<span className='mb-[2px] text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Voted proposals </span>
							<span className='text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>(Past 30 days)</span>
						</div>
					</div>
					<div className='flex w-[33%] flex-col items-center py-3 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span className='text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high'>{delegate?.active_delegation_count}</span>
						<span className='mb-[2px] mt-1 text-center text-xs font-normal text-textGreyColor dark:text-blue-dark-medium'>Received Delegation</span>
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
							<div className='flex items-center gap-2 max-lg:justify-start'>
								<Address
									address={delegate?.address}
									displayInline
									iconSize={26}
									isTruncateUsername={false}
									usernameClassName='text-[20px] font-medium'
								/>

								<div className='mr-2 flex items-center gap-2'>
									<SocialsHandle
										address={address}
										onchainIdentity={identity || null}
										socials={[]}
										iconSize={18}
										boxSize={32}
									/>
								</div>
							</div>
						</div>

						<div className={'tracking-[0.015em]text-[#576D8B] mb-[16px] mt-2 flex min-h-[56px] gap-1 pl-[56px] text-sm dark:text-blue-dark-high'}>
							<p className='w-[90%]'>
								{delegate?.bio ? (
									<Markdown
										className='post-content'
										md={delegate?.bio}
										isPreview={true}
										imgHidden
									/>
								) : (
									'No Bio'
								)}
							</p>
						</div>
						<div className='flex min-h-[92px] justify-between border-0 border-t-[1px] border-solid  border-[#D2D8E0] dark:border-[#3B444F]  dark:border-separatorDark '>
							<div className='flex w-[33%] flex-col items-center pt-1.5 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
								<div className='flex items-center justify-center gap-1'>
									{parseBalance(votingPower.add(freeBalance).toString(), 2, false, network)}
									<span className='mt-1 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>{unit}</span>
								</div>
								<div className='text-xs font-normal text-[#576D8B] dark:text-blue-dark-medium'>Voting power</div>
							</div>
							<div className='flex w-[33%] flex-col items-center border-0 border-x-[1px] border-solid border-[#D2D8E0] pt-1.5  text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'>
								{delegate?.voted_proposals_count}
								<span className='text-xs font-normal text-[#576D8B] dark:text-blue-dark-medium'>Voted proposals </span>
								<span className='text-xs font-normal text-[#576D8B] dark:text-blue-dark-medium'>(Past 30 days)</span>
							</div>
							<div className='flex w-[33%] flex-col items-center pt-1.5 text-[20px] font-semibold text-bodyBlue dark:text-blue-dark-high'>
								{delegate?.active_delegation_count}
								<span className='mb-[2px] text-center text-xs font-normal text-[#576D8B] dark:text-blue-dark-medium'>Received Delegation</span>
							</div>
						</div>
					</div>
				</Modal>
			</div>
		</Spin>
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
