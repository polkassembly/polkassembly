// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import styled from 'styled-components';
import { RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Image from 'next/image';
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
import dayjs from 'dayjs';
import { dmSans } from 'pages/_app';
import Address from '~src/ui-components/Address';
import classNames from 'classnames';
import Tooltip from '~src/basic-components/Tooltip';
interface Props {
	className?: string;
	posts: any[];
	trackDetails: any;
	totalCount: number;
	theme: string;
}

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

export function capitalizeWords(input: string): string {
	return input
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

const CONVICTION_VOTES_LOCKED_DAYS = 7;

const DashboardTrackListing = ({ className, posts, trackDetails, totalCount }: Props) => {
	const { resolvedTheme: theme } = useTheme();
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

	useEffect(() => {
		if (!window) return;

		if (!network) return;

		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleUndelegationDisable = (item: any) => {
		if (!item?.length || !item?.[0]?.delegatedOn || !item?.[0]?.lockPeriod) return { delegationDisable: false, timeLeftInUndelegation: { percentage: 0, time: null } };

		const lockedDays = item?.[0]?.lockPeriod ? CONVICTION_VOTES_LOCKED_DAYS * 2 ** (item?.[0]?.lockPeriod - 1 || 0) : 0;
		const daysComplete = dayjs().diff(dayjs(item?.[0]?.delegatedOn), 'days');

		let daysLeft = lockedDays - daysComplete;

		if (daysComplete >= lockedDays) {
			daysLeft = 0;
		}
		let percentageTimeLeft = 0;
		if (daysLeft) {
			percentageTimeLeft = Math.floor((daysLeft * 100) / lockedDays);
		}
		const undelegationEnableOn = dayjs().add(daysLeft, 'days').format('DD MMM YYYY').toString();
		return { delegationDisable: !!daysLeft, timeLeftInUndelegation: { percentage: percentageTimeLeft, time: daysLeft ? undelegationEnableOn : null } };
	};

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

	const getIconForUndelegationTimeLeft = (percentage: number) => {
		if (percentage >= 75) {
			return '/assets/icons/whole-time-left-clock.svg';
		} else if (percentage < 75 && percentage >= 50) {
			return '/assets/icons/three-forth-time-left-clock.svg';
		} else if (percentage < 50 && percentage >= 25) {
			return '/assets/icons/half-time-left-clock.svg';
		} else {
			return '/assets/icons/one-third-time-left-clock.svg';
		}
	};

	return (
		<div className={`${className}`}>
			<div className='wallet-info-board gap mt-[-110px] flex h-[70px] rounded-b-[20px] max-lg:absolute max-lg:left-0 max-lg:top-[80px] max-lg:w-[99.3vw] sm:h-[90px]'>
				<ProfileBalances />
			</div>
			<div className='dashboard-heading mb-4 flex items-center gap-2 dark:text-white max-lg:pt-[60px] sm:mt-4 md:mb-5'>
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
				<div className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-3 dark:border-separatorDark dark:bg-section-dark-overlay sm:px-9 sm:py-6'>
					<div className='flex items-center gap-2 text-xl font-semibold capitalize tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high sm:gap-3'>
						<div className='flex items-center gap-2 '>
							<span className='sm:hidden'>{handleTracksIcon(capitalizeWords(handleTrack(String(track))), 20)}</span>
							<span className='hidden sm:block'>{handleTracksIcon(capitalizeWords(handleTrack(String(track))), 28)}</span>
							<span className='max-sm:text-[18px]'>{handleTrack(String(track))}</span>
						</div>
						{status &&
							status.map((item: ETrackDelegationStatus, index: number) => (
								<span
									key={index}
									className={` text-xs sm:text-sm ${item === ETrackDelegationStatus.RECEIVED_DELEGATION && 'bg-[#E7DCFF] dark:bg-[#6C2CF8]'} ${
										item === ETrackDelegationStatus.DELEGATED && 'bg-[#FFFBD8] dark:bg-[#69600B]'
									} ${item === ETrackDelegationStatus.UNDELEGATED && 'bg-[#FFDAD8] dark:bg-[#EF6158]'} rounded-[26px] px-2 py-1 text-center sm:px-3 sm:py-2 ${
										item === ETrackDelegationStatus.RECEIVED_DELEGATION && status && status.length > 1 ? 'w-[115px] truncate' : ''
									}`}
								>
									{item?.split('_').join(' ').charAt(0).toUpperCase() + item?.split('_').join(' ').slice(1)}
								</span>
							))}
					</div>
					<p className='mt-[10px] text-sm font-normal tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high sm:mt-5'>{trackDetails.description}</p>

					{/* For small screens */}
					<div className='mb-[6px] sm:hidden'>
						{showTable &&
							status.map((item: ETrackDelegationStatus, index: number) => (
								<div
									className='mt-3 flex flex-col gap-2'
									key={index}
								>
									<span className=' text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>
										{item === ETrackDelegationStatus.RECEIVED_DELEGATION ? 'Received Delegation(s)' : 'Delegated'}
									</span>
									<div className='mt-1 flex flex-col gap-4 border-[1px] border-solid border-section-light-container bg-white p-4 dark:border-separatorDark dark:bg-section-dark-overlay'>
										{rowData
											.filter((row) => (item === ETrackDelegationStatus.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
											?.map((row, rowIndex) => (
												<div
													key={rowIndex}
													className='dark:border-separatorDark dark:bg-section-dark-overlay'
												>
													<div className={`${dmSans.className} ${dmSans.variable} flex items-center justify-between`}>
														<div className='flex items-center gap-2'>
															<div className='text-sm font-medium text-bodyBlue dark:text-white'>#{row.index}</div>
															<span
																className={`rounded-[26px] px-2 py-1 text-xs font-medium ${
																	item === ETrackDelegationStatus.RECEIVED_DELEGATION
																		? 'bg-[#E7DCFF] text-[#6C2CF8] dark:bg-[#6C2CF8] dark:text-white'
																		: item === ETrackDelegationStatus.DELEGATED
																		? 'bg-[#FFFBD8] text-[#69600B] dark:bg-[#69600B] dark:text-white'
																		: ''
																}`}
															>
																{item === ETrackDelegationStatus.RECEIVED_DELEGATION ? 'Received Delegation' : 'Delegated'}
															</span>
														</div>
														{item === ETrackDelegationStatus.DELEGATED && (
															<div className='flex items-start justify-center'>
																<CustomButton
																	onClick={() => setOpenUndelegateModal(true)}
																	disabled={
																		handleUndelegationDisable(
																			rowData
																				.filter((row) => row?.delegatedTo !== address)
																				.map((filteredItem, index) => {
																					return { ...filteredItem, index: index + 1 };
																				})
																		)?.delegationDisable || false
																	}
																	height={24}
																	width={90}
																	shape='default'
																	variant='default'
																	className={classNames(
																		'gap-[2px]',
																		handleUndelegationDisable(
																			rowData
																				.filter((row) => row?.delegatedTo !== address)
																				.map((filteredItem, index) => {
																					return { ...filteredItem, index: index + 1 };
																				})
																		)?.delegationDisable
																			? 'opacity-50'
																			: ''
																	)}
																>
																	<Image
																		src={'/assets/icons/undelegate-profile.svg'}
																		height={14}
																		width={14}
																		alt=''
																		className={'dark:text-white'}
																	/>
																	<span className={`${dmSans.className} ${dmSans.variable} text-[10px] font-medium tracking-wide text-pink_primary`}>Undelegate</span>
																</CustomButton>
															</div>
														)}
													</div>

													<div className={`${dmSans.className} ${dmSans.variable} mt-2 grid grid-cols-2 gap-4 text-sm `}>
														<div className='flex flex-col'>
															<span className='text-[10px] text-blue-light-medium dark:text-blue-dark-medium'>Delegated to:</span>{' '}
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>
																<Address
																	address={row.delegatedTo || ''}
																	isTruncateUsername={false}
																	displayInline
																	usernameClassName='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'
																	addressClassName='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'
																	iconSize={18}
																/>
															</span>
														</div>
														<div className='flex flex-col'>
															<span className='text-[10px] text-blue-light-medium dark:text-blue-dark-medium'>Conviction:</span>{' '}
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{row.lockPeriod}x</span>
														</div>
														<div className='flex flex-col'>
															<span className='text-[10px] text-blue-light-medium dark:text-blue-dark-medium'>Balance:</span>{' '}
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{row.balance} DOT</span>
														</div>
														<div className='flex flex-col'>
															<span className='text-[10px] text-blue-light-medium dark:text-blue-dark-medium'>Delegated on:</span>{' '}
															<div className='flex items-center gap-1'>
																<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{dayjs(row.delegatedOn).format('DD MMM YYYY')}</span>
																{handleUndelegationDisable(
																	rowData
																		.filter((row) => (item === ETrackDelegationStatus.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
																		?.map((item, index) => {
																			return { ...item, index: index + 1 };
																		})
																)?.timeLeftInUndelegation && (
																	<Tooltip
																		title={
																			<div className={classNames(dmSans.className, dmSans.variable, 'text-[13px]')}>
																				You can undelegate votes on{' '}
																				{
																					handleUndelegationDisable(
																						rowData
																							.filter((row) => (item === ETrackDelegationStatus.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
																							?.map((item, index) => {
																								return { ...item, index: index + 1 };
																							})
																					)?.timeLeftInUndelegation?.time
																				}
																			</div>
																		}
																		className={classNames(dmSans.className, dmSans.variable, 'text-xs')}
																		overlayClassName='px-1 max-w-[300px]'
																	>
																		<span className='-mt-1'>
																			<Image
																				src={getIconForUndelegationTimeLeft(
																					handleUndelegationDisable(
																						rowData
																							.filter((row) => (item === ETrackDelegationStatus.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
																							?.map((item, index) => {
																								return { ...item, index: index + 1 };
																							})
																					)?.timeLeftInUndelegation?.percentage || 0
																				)}
																				alt=''
																				width={16}
																				height={16}
																			/>
																		</span>
																	</Tooltip>
																)}
															</div>
														</div>
													</div>
												</div>
											))}
									</div>
								</div>
							))}
					</div>

					{/* For Large screens */}
					<div className='mt-3 hidden flex-col gap-4 sm:mt-6 sm:flex'>
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
											key={item}
											columns={GetTracksColumns(
												item,
												setOpenUndelegateModal,
												network,
												handleUndelegationDisable(
													rowData
														.filter((row) => (item === ETrackDelegationStatus?.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
														?.map((item, index) => {
															return { ...item, index: index + 1 };
														})
												)?.delegationDisable,
												handleUndelegationDisable(
													rowData
														.filter((row) => (item === ETrackDelegationStatus.RECEIVED_DELEGATION ? row?.delegatedTo === address : row?.delegatedTo !== address))
														?.map((item, index) => {
															return { ...item, index: index + 1 };
														})
												)?.timeLeftInUndelegation
											)}
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
						<div className='flex flex-col items-center rounded-b-[14px] bg-white pt-2 text-[169px] dark:bg-section-dark-overlay sm:pb-8 sm:pt-6'>
							<DelegateDelegationIcon />
							<div className='mt-3 text-center text-bodyBlue dark:text-blue-dark-high sm:mt-5'>
								<div className='mt-1 flex items-center justify-center text-sm font-normal tracking-[0.01em] max-md:flex-col'>
									Voting power for this track has not been delegated yet
									<CustomButton
										className='border-none dark:bg-transparent max-sm:mt-1'
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
