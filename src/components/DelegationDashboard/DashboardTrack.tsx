// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

import { GetTracksColumns, handleTracksIcon } from './Coloumn';
import { Button, Skeleton, Table } from 'antd';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import dynamic from 'next/dynamic';
import { ETrackDelegationStatus, IDelegation, Wallet } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import BN from 'bn.js';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { checkIsAddressMultisig } from './utils/checkIsAddressMultisig';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { setUserDetailsState } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';
interface Props {
	className?: string;
	posts: any[];
	trackDetails: any;
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
}

export const handleTrack = (track: string) => {
	const firstPart = track.split('-')[0];
	const secondPart = track.split('-')[1] ? track.split('-')[1] : '';
	const trackName = `${firstPart.charAt(0).toUpperCase() + firstPart.slice(1)} ${secondPart.length > 0 ? secondPart.charAt(0).toUpperCase() + secondPart.slice(1) : ''}`;

	return trackName.trim();
};

const DashboardTrackListing = ({ className, posts, trackDetails }: Props) => {
	const {
		query: { track }
	} = useRouter();
	const { network } = useNetworkSelector();
	const [status, setStatus] = useState<ETrackDelegationStatus[]>([]);
	const router = useRouter();
	const [showTable, setShowTable] = useState<boolean>(false);
	const currentUser = useUserDetailsSelector();
	const { delegationDashboardAddress: address, loginWallet, id } = currentUser;
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [rowData, setRowData] = useState<ITrackRowData[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [openUndelegateModal, setOpenUndelegateModal] = useState<boolean>(false);
	const [openDelegateModal, setOpenDelegateModal] = useState<boolean>(false);
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);
	const [isSelectedAddressMultisig, setIsSelectedAddressMultisig] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		setIsSelectedAddressMultisig(false);
		if (address) {
			checkIsAddressMultisig(address).then((isMulti) => setIsSelectedAddressMultisig(isMulti));
		}
	}, [address]);

	useEffect(() => {
		if (!window) return;

		const wallet = localStorage.getItem('delegationWallet') || '';
		const address = localStorage.getItem('delegationDashboardAddress') || '';
		dispatch(
			setUserDetailsState({
				...currentUser,
				delegationDashboardAddress: address,
				loginWallet: wallet as Wallet
			})
		);

		if (!network) return;

		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		!id && setOpenLoginModal(true);
	}, [id]);

	useEffect(() => {
		if (!address) {
			setOpenModal(true);
		}

		if (status?.length === 0) {
			setLoading(true);
		} else {
			setLoading(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, status]);

	useEffect(() => {
		if (status.includes(ETrackDelegationStatus.Delegated)) {
			setShowTable(true);
		} else if (status.includes(ETrackDelegationStatus.Received_Delegation)) {
			setShowTable(true);
		} else if (status.includes(ETrackDelegationStatus.Undelegated)) {
			setShowTable(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, address]);

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, network]);

	const getData = async () => {
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>(`api/v1/delegations?address=${address}&track=${trackDetails?.trackId}`);

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

			setStatus(data[0]?.status);
		} else {
			console.log(error);
		}
	};

	const handleReroute: any = (route: string) => {
		if (route.length === 0) {
			return;
		}
		route = route.toLowerCase();
		if (route === 'dashboard') {
			router.push('/delegation');
		} else {
			router.push(`/delegation/${route}`);
		}
	};

	return (
		<div className={`${className}`}>
			<div className='wallet-info-board gap mt-[-25px] flex h-[90px] rounded-b-[20px] max-lg:absolute max-lg:left-0 max-lg:top-[80px] max-lg:w-[99.3vw]'>
				<ProfileBalances />
			</div>
			<div className='dashboard-heading mb-4 mt-5 flex items-center gap-2 dark:text-white max-lg:pt-[60px] md:mb-5'>
				<span
					className='cursor-pointer text-sm'
					onClick={() => handleReroute('dashboard')}
				>
					Dashboard
				</span>
				<span className='mt-[-2px]'>
					<RightOutlined className='text-xs' />
				</span>
				<span
					className='cursor-pointer text-sm text-pink_primary'
					onClick={() => handleReroute(String(track))}
				>
					{handleTrack(String(track))}
				</span>
			</div>
			{status ? (
				<div className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-9 py-6 dark:border-separatorDark dark:bg-section-dark-overlay'>
					<div className='flex items-center gap-3 text-[24px] font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>
						{handleTracksIcon(handleTrack(String(track)), 28)}
						<span>{handleTrack(String(track))}</span>
						{status &&
							status.map((item: ETrackDelegationStatus, index: number) => (
								<span
									key={index}
									className={`text-sm ${item === ETrackDelegationStatus.Received_Delegation && 'bg-[#E7DCFF]'} ${item === ETrackDelegationStatus.Delegated && 'bg-[#FFFBD8]'} ${
										item === ETrackDelegationStatus.Undelegated && 'bg-[#FFDAD8] dark:bg-[#EF6158]'
									} rounded-[26px] px-[12px] py-[6px] text-center`}
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
										{item === ETrackDelegationStatus.Received_Delegation ? 'Received Delegation(s)' : 'Delegated'}
									</span>
									<div className='mt-0 rounded-md border-[1px] border-solid border-[#D2D8E0] bg-transparent bg-white pl-[3px] pr-[3px] dark:bg-section-dark-overlay'>
										<Table
											className='column'
											columns={GetTracksColumns(item, setOpenUndelegateModal, network)}
											dataSource={
												item === ETrackDelegationStatus.Received_Delegation
													? rowData
															.filter((row) => row.delegatedTo === address)
															?.map((item, index) => {
																return { ...item, index: index + 1 };
															})
													: rowData
															.filter((row) => row.delegatedTo !== address)
															?.map((item, index) => {
																return { ...item, index: index + 1 };
															})
											}
											pagination={status.includes(ETrackDelegationStatus.Delegated) ? false : { pageSize: 5 }}
											loading={loading}
										/>
									</div>
								</div>
							))}
					</div>
					{status.includes(ETrackDelegationStatus.Undelegated) && (
						<div className='flex flex-col items-center rounded-b-[14px] bg-white pb-[33px] pt-[24px] text-[169px] dark:bg-section-dark-overlay'>
							<DelegateDelegationIcon />
							<div className='mt-[18px] text-center text-bodyBlue dark:text-blue-dark-high'>
								<div className='mt-1 flex items-center justify-center text-sm font-normal tracking-[0.01em] max-md:flex-col'>
									Voting power for this track has not been delegated yet
									<Button
										onClick={() => setOpenDelegateModal(true)}
										className='ml-1 flex items-center justify-center border-none text-sm font-normal tracking-wide text-pink_primary shadow-none dark:bg-transparent max-md:mt-[10px]'
									>
										<DelegatedProfileIcon className='mr-[7px]' />
										<span className='mt-[1px]'>Delegate</span>
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				<Skeleton className='py-6' />
			)}

			{status.length > 0 ? (
				<div>
					<ActiveProposals
						posts={posts}
						trackDetails={trackDetails}
						status={status}
						delegatedTo={status.includes(ETrackDelegationStatus.Delegated) ? rowData.filter((row) => row.delegatedTo !== address)[0].delegatedTo : null}
					/>
				</div>
			) : (
				<Skeleton className='mt-6 h-[200px]' />
			)}

			{status.length > 0 ? (
				<div>
					<Delegate
						disabled={status.includes(ETrackDelegationStatus.Delegated)}
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
					isMultisig={isSelectedAddressMultisig}
				/>
			)}
			<DelegateModal
				open={openDelegateModal}
				setOpen={setOpenDelegateModal}
				trackNum={trackDetails?.trackId}
				isMultisig={isSelectedAddressMultisig}
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
`;
