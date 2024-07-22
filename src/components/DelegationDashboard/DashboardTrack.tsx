// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import styled from 'styled-components';
import { RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

import { GetTracksColumns, handleTracksIcon } from './Coloumn';
import Table from '~src/basic-components/Tables/Table';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import dynamic from 'next/dynamic';
import { ETrackDelegationStatus, IDelegation } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import BN from 'bn.js';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Skeleton from '~src/basic-components/Skeleton';
import { useTheme } from 'next-themes';
interface Props {
	className?: string;
	posts: any[];
	trackDetails: any;
	totalCount: number;
	theme: string;
}

const Delegate = dynamic(() => import('./Delegate'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const ActiveProposals = dynamic(() => import('./ActiveProposals'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const UndelegateModal = dynamic(() => import('../Listing/Tracks/UndelegateModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const DelegateModal = dynamic(() => import('../Listing/Tracks/DelegateModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export interface ITrackRowData {
	index: number;
	delegatedTo: string;
	delegatedFrom: string;
	lockPeriod: number;
	balance: string;
	delegatedOn: Date;
	action: string;
	theme?: string;
}

export const handleTrack = (track: string) => {
	const trackName = track.replace(/-/g, ' ');
	return trackName.trim();
};

const DashboardTrackListing = ({ className, posts, trackDetails, totalCount }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const {
		query: { track }
	} = useRouter();
	const [status, setStatus] = useState<ETrackDelegationStatus[]>([]);
	const router = useRouter();
	const [showTable, setShowTable] = useState<boolean>(false);

	const { delegationDashboardAddress: address, loginWallet, id } = currentUser;
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [rowData, setRowData] = useState<ITrackRowData[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [openUndelegateModal, setOpenUndelegateModal] = useState<boolean>(false);
	const [openDelegateModal, setOpenDelegateModal] = useState<boolean>(false);
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		if (!window) return;

		if (!network) return;

		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const getData = async () => {
		if (!address?.length) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: address,
			track: trackDetails?.trackId
		});

		if (data) {
			const rowData: ITrackRowData[] = data[0]?.delegations?.map((delegation: IDelegation, index: number) => {
				return {
					action: 'Undelegate',
					balance: delegation?.balance,
					delegatedFrom: delegation?.from,
					delegatedOn: delegation?.createdAt,
					delegatedTo: delegation?.to,
					index: index + 1,
					lockPeriod: delegation?.lockPeriod
				};
			});

			setRowData(rowData);
			if (data[0]?.status.includes(ETrackDelegationStatus.DELEGATED) || data[0]?.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
				setShowTable(true);
			} else {
				setShowTable(false);
			}
			setStatus(data[0]?.status);
		} else {
			console.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (!address) {
			setOpenModal(true);
		}
		setOpenLoginModal(!id);
		getData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, id]);

	return (
		<div className={`${className}`}>
			<div className='wallet-info-board gap mt-[-25px] flex h-[90px] rounded-b-[20px] max-lg:absolute max-lg:left-0 max-lg:top-[80px] max-lg:w-[99.3vw]'>
				<ProfileBalances />
			</div>
			<div className='dashboard-heading mb-4 mt-5 flex items-center gap-2 dark:text-white max-lg:pt-[60px] md:mb-5'>
				<span
					className='cursor-pointer text-sm'
					onClick={() => router.push('/delegation')}
				>
					Dashboard
				</span>
				<span className='mt-[-2px]'>
					<RightOutlined className='text-xs' />
				</span>
				<span
					className='cursor-pointer text-sm capitalize text-pink_primary'
					onClick={() => router.push(`/delegation/${String(track)}`)}
				>
					{handleTrack(String(track))}
				</span>
			</div>
			{status ? (
				<div className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-9 py-6 dark:border-separatorDark dark:bg-section-dark-overlay'>
					<div className='flex items-center gap-3 text-xl font-semibold capitalize tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>
						{handleTracksIcon(handleTrack(String(track)), 28)}
						<span>{handleTrack(String(track))}</span>
						{status &&
							status.map((item: ETrackDelegationStatus, index: number) => (
								<span
									key={index}
									className={`text-sm ${item === ETrackDelegationStatus.RECEIVED_DELEGATION && 'bg-[#E7DCFF] dark:bg-[#6C2CF8]'} ${
										item === ETrackDelegationStatus.DELEGATED && 'bg-[#FFFBD8] dark:bg-[#69600B]'
									} ${item === ETrackDelegationStatus.UNDELEGATED && 'bg-[#FFDAD8] dark:bg-[#EF6158]'} rounded-[26px] px-3 py-2 text-center`}
								>
									{item?.split('_').join(' ').charAt(0).toUpperCase() + item?.split('_').join(' ').slice(1)}
								</span>
							))}
					</div>
					<p className='mt-5 text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high'>{trackDetails.description}</p>
					<div className='mt-6 flex flex-col gap-4'>
						{showTable &&
							status.map((item: ETrackDelegationStatus, index: number) => (
								<div
									className='flex flex-col gap-2'
									key={index}
								>
									<span className='ml-[1px] text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>
										{item === ETrackDelegationStatus.RECEIVED_DELEGATION ? 'Received Delegation(s)' : 'Delegated'}
									</span>
									<div className='mt-0 rounded-md border-[1px] border-solid border-section-light-container bg-transparent bg-white px-1 dark:border-separatorDark dark:bg-section-dark-overlay'>
										<Table
											className='column'
											theme={theme}
											columns={GetTracksColumns(item, setOpenUndelegateModal, network)}
											dataSource={rowData
												.filter((row) => (item === ETrackDelegationStatus.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
												?.map((item, index) => {
													return { ...item, index: index + 1 };
												})}
											pagination={status.includes(ETrackDelegationStatus.DELEGATED) ? false : { pageSize: 5 }}
											loading={loading}
										/>
									</div>
								</div>
							))}
					</div>
					{status.includes(ETrackDelegationStatus.UNDELEGATED) && (
						<div className='flex flex-col items-center rounded-b-[14px] bg-white pb-8 pt-6 text-[169px] dark:bg-section-dark-overlay'>
							<DelegateDelegationIcon />
							<div className='mt-5 text-center text-bodyBlue dark:text-blue-dark-high'>
								<div className='mt-1 flex items-center justify-center text-sm font-normal tracking-[0.01em] max-md:flex-col'>
									Voting power for this track has not been delegated yet
									<CustomButton
										className='border-none dark:bg-transparent max-md:mt-[10px]'
										onClick={() => setOpenDelegateModal(true)}
										variant='default'
									>
										<DelegatedProfileIcon className='mr-2' />
										<span className='mt-[1px]'>Delegate</span>
									</CustomButton>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				<Skeleton className='py-6' />
			)}

			{status ? (
				<div>
					<ActiveProposals
						posts={posts}
						trackDetails={trackDetails}
						status={status}
						totalCount={totalCount}
						delegatedTo={status.includes(ETrackDelegationStatus.DELEGATED) ? rowData.filter((row) => row.delegatedTo !== address)[0].delegatedTo : null}
						theme={theme as any}
					/>
				</div>
			) : (
				<Skeleton className='mt-6 h-20' />
			)}

			{status ? (
				<div>
					<Delegate
						disabled={status.includes(ETrackDelegationStatus.DELEGATED)}
						trackDetails={trackDetails}
					/>
				</div>
			) : (
				<Skeleton />
			)}

			{!openLoginModal && !openSignupModal && !loginWallet && (
				<AddressConnectModal
					walletAlertTitle='Delegation dashboard'
					localStorageWalletKeyName='delegationWallet'
					localStorageAddressKeyName='delegationDashboardAddress'
					open={openModal}
					setOpen={setOpenModal}
					usedInIdentityFlow={false}
				/>
			)}
			<LoginPopup
				closable={false}
				setSignupOpen={setOpenSignupModal}
				modalOpen={openLoginModal}
				setModalOpen={setOpenLoginModal}
				isModal={true}
				isDelegation={true}
			/>
			<SignupPopup
				closable={false}
				setLoginOpen={setOpenLoginModal}
				modalOpen={openSignupModal}
				setModalOpen={setOpenSignupModal}
				isModal={true}
				isDelegation={true}
			/>

			{rowData?.filter((row) => row.delegatedTo !== address).length > 0 && (
				<UndelegateModal
					balance={new BN(rowData.filter((row) => row.delegatedTo !== address)[0]?.balance)}
					open={openUndelegateModal}
					setOpen={setOpenUndelegateModal}
					defaultTarget={rowData.filter((row) => row.delegatedTo !== address)[0]?.delegatedTo}
					trackNum={trackDetails?.trackId}
					conviction={rowData.filter((row) => row.delegatedTo !== address)[0]?.lockPeriod}
					onConfirm={() => {
						setStatus([ETrackDelegationStatus.UNDELEGATED]);
						setShowTable(false);
					}}
				/>
			)}
			<DelegateModal
				open={openDelegateModal}
				setOpen={setOpenDelegateModal}
				trackNum={trackDetails?.trackId}
				onConfirm={(balance: string, delegatedTo: string, lockPeriod: number) => {
					setStatus([ETrackDelegationStatus.DELEGATED]);
					setRowData([{ action: 'Undelegate', balance, delegatedFrom: address, delegatedOn: new Date(), delegatedTo, index: 1, lockPeriod }]);
					setShowTable(true);
				}}
			/>
		</div>
	);
};

export default styled(DashboardTrackListing)`
	.wallet-info-board {
		margin-top: 0px;
		background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122c 0%, #a6075c 32.81%, #952863 77.08%, #e5007a 100%);
	}
	.column .ant-table-thead > tr > th {
		color: var(--lightBlue) !important;
		font-size: 14px;
		font-weight: 600px;
		line-height: 21px;
	}
	.column .ant-table-thead > tr > th {
		color: ${(props: any) => (props.theme === 'dark' ? '#909090' : '#485F7D')} !important;
		font-size: 14px;
		font-weight: ${(props: any) => (props.theme === 'dark' ? '500' : '600')} !important;
		line-height: 21px;
		white-space: nowrap;
		border-bottom: ${(props: any) => (props.theme === 'dark' ? '1px solid #4B4B4B' : '')} !important;
	}
	.column .ant-table-thead > tr > th:nth-child(1) {
		text-align: center;
	}
	.ant-table-cell {
		background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : '')} !important;
		border-bottom: ${(props: any) => (props.theme === 'dark' ? '1px solid #4B4B4B' : '')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
	.ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
		background-color: transparent !important;
	}
	@media only screen and (max-width: 1024px) {
		.column .ant-table-thead > tr > th:nth-child(2) {
			text-align: center;
		}
	}
	.ant-pagination .ant-pagination-item a {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--bodyBlue)')};
	}
	.ant-pagination .ant-pagination-prev button,
	.ant-pagination .ant-pagination-next button {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--bodyBlue)')};
	}
`;
