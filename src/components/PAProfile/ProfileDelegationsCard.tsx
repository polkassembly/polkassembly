// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Checkbox, Collapse, Popover, Spin } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import Image from 'next/image';
import { poppins } from 'pages/_app';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import { useApiContext } from '~src/context';
import { ETrackDelegationStatus } from '~src/types';
import Address from '~src/ui-components/Address';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import styled from 'styled-components';
import { formatBalance } from '@polkadot/util';
import VoterIcon from '~assets/icons/vote-small-icon.svg';
import ConvictionIcon from '~assets/icons/conviction-small-icon.svg';
import CapitalIcon from '~assets/icons/capital-small-icom.svg';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { getTrackNameFromId } from '~src/util/trackNameFromId';

const { Panel } = Collapse;

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
}
interface IDelegates extends ITrackDelegation {
	expand?: boolean;
}

const ProfileDelegationsCard = ({ userProfile, addressWithIdentity }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { id: loginId } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { addresses } = userProfile;
	const [receiveDelegations, setReceiveDelegations] = useState<IDelegates[]>([]);
	const [delegatedDelegations, setDelegatedDelegations] = useState<IDelegates[]>([]);
	const [checkedAddressList, setCheckedAddressList] = useState<CheckboxValueType[]>(addresses as CheckboxValueType[]);
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);
	const [openDelegateModal, setOpenDelegateModal] = useState<boolean>(false);
	const collapseItems = [
		{ data: receiveDelegations, label: 'RECEIVED DELEGATION', src: '/assets/profile/received-delegation.svg', status: ETrackDelegationStatus.RECEIVED_DELEGATION },
		{ data: delegatedDelegations, label: 'DELEGATED', src: '/assets/profile/delegated.svg', status: ETrackDelegationStatus.DELEGATED }
	];

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={(list) => setCheckedAddressList(list)}
				value={checkedAddressList}
			>
				{addresses?.map((address) => (
					<div
						className={`${poppins.variable} ${poppins.className} flex gap-[13px] p-[8px] text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
						key={address}
					>
						<Checkbox
							className='text-pink_primary'
							value={address}
						/>
						<Address
							address={address}
							isTruncateUsername={false}
							displayInline
							disableAddressClick
							disableTooltip
						/>
					</div>
				))}
			</Checkbox.Group>
		</div>
	);
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const getData = async () => {
		if (!api || !apiReady) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<IDelegates[]>('api/v1/delegations', {
			addresses: checkedAddressList || []
		});
		if (data) {
			const received: IDelegates[] = [];
			const delegated: IDelegates[] = [];

			data.map((item) => {
				if (item.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
					received.push(item);
				} else if (item.status.includes(ETrackDelegationStatus.DELEGATED)) {
					delegated.push(item);
				}
			});
			setReceiveDelegations(received);
			setDelegatedDelegations(delegated);
			setLoading(false);
		} else {
			console.log(error);
		}
	};
	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, addresses]);

	const handleExpand = (index: number, type: ETrackDelegationStatus) => {
		const newData = (type === ETrackDelegationStatus.DELEGATED ? delegatedDelegations : receiveDelegations).map((item, idx) => {
			if (index === idx) {
				return { ...item, expand: !item?.expand };
			}
			return item;
		});
		type === ETrackDelegationStatus.DELEGATED ? setDelegatedDelegations(newData) : setReceiveDelegations(newData);
	};
	return (
		<Spin spinning={loading}>
			<div className='flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'>
				<div className='flex items-center justify-between'>
					<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-medium'>
						<Image
							src='/assets/profile/profile-delegation.svg'
							alt=''
							width={24}
							height={24}
						/>
						Delegations
					</span>
					{/* TODO delegate button onClick */}
					{userProfile?.user_id !== loginId && (
						<CustomButton
							className='delegation-buttons border-none'
							variant='default'
							buttonsize='xs'
							onClick={() => setOpenDelegateModal(true)}
						>
							<Image
								src='/assets/icons/delegate-profile.svg'
								alt=''
								width={18}
								height={18}
								className='mr-2'
							/>
							<span>Delegate</span>
						</CustomButton>
					)}
				</div>
				{addresses.length > 1 && (
					<div className=''>
						<Popover
							zIndex={1056}
							content={content}
							placement='bottom'
							onOpenChange={() => setAddressDropdownExpand(!addressDropdownExpand)}
						>
							<div className='flex h-8 w-[180px] items-center justify-between rounded-md border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-sm font-medium capitalize text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
								Select Addresses
								<span className='flex items-center'>
									<DownArrowIcon className={`cursor-pointer ${addressDropdownExpand && 'pink-color rotate-180'}`} />
								</span>
							</div>
						</Popover>
					</div>
				)}
				{/*TODO delegation bio */}
				<div className='flex flex-col gap-1 text-sm text-bodyBlue dark:text-blue-dark-high'>
					<span className='font-semibold text-lightBlue dark:text-blue-dark-medium'>Delegation Mandate</span>
					<span className='font-normal'>
						Maecenas eget ligula vitae enim posuere volutpat. Pellentesque sed tellus pretium, pellentesque risus vitae, convallis dui. Pellentesque sed tellus pretium, Vestibulum
						nec leo at dui euismod lacinia non quis risus. Vivamus lobortis felis lectus, et consequat lacus dapibus in.
					</span>
				</div>
				<div className='flex flex-col gap-4'>
					{collapseItems?.map((item, index) => (
						<Collapse
							key={item?.status}
							size='small'
							className={'my-custom-collapse border-[#D2D8E0] bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
							expandIconPosition='end'
							expandIcon={({ isActive }) => {
								return <DownArrowIcon className={`${!!item?.data?.length && 'cursor-pointer'} ${isActive && 'pink-color rotate-180'}`} />;
							}}
							collapsible={!item?.data.length ? 'disabled' : 'header'}
						>
							<Panel
								header={
									<div className='channel-header flex w-full items-center gap-2'>
										<Image
											src={item?.src}
											alt=''
											height={32}
											width={32}
										/>
										<div className='mt-0.5 flex flex-col justify-center gap-0 text-xs font-semibold tracking-wide'>
											<span className='text-lightBlue dark:text-blue-dark-medium'>{item?.label}</span>
											<span className='text-base text-bodyBlue dark:text-blue-dark-high'>{item?.data?.length}</span>
										</div>
									</div>
								}
								key={index}
							>
								<div className='-mx-3 -my-3 flex flex-col text-bodyBlue'>
									{item?.data?.map((delegation, index) => (
										<div key={index}>
											<div
												className={`flex justify-between border-0 border-y-[1px] border-solid border-[#D2D8E0] px-3 py-4 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high ${
													(delegation?.expand || index === item?.data?.length - 1) && 'border-b-0 border-t-[1px]'
												}`}
												onClick={() => {
													if (!item?.data.length) return;
													handleExpand(index, item?.status);
												}}
											>
												<span>#{index + 1}</span>
												<span className='w-[50%]'>
													<div
														className='flex justify-between'
														key={delegation?.delegations?.[0]?.track}
													>
														<Address
															address={item?.status === ETrackDelegationStatus.DELEGATED ? delegation?.delegations?.[0]?.to : delegation?.delegations?.[0]?.from}
															displayInline
															disableTooltip
														/>
														<span>
															{formatedBalance(delegation?.delegations?.[0]?.balance.toString(), unit, 2)} {unit}
														</span>
													</div>
												</span>
												<span>
													<DownArrowIcon className={`cursor-pointer ${delegation?.expand && 'pink-color rotate-180'}`} />
												</span>
											</div>
											{delegation?.expand && (
												<div className='border-0 border-t-[1px] border-dashed border-[#D2D8E0] px-3 pb-3 dark:border-separatorDark'>
													<div className='justify-start'>
														<div className='mt-2 flex flex-col gap-2'>
															<div className='flex justify-between'>
																<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
																	<Image
																		src='/assets/profile/delegate.svg'
																		width={16}
																		height={16}
																		alt=''
																	/>
																	{item?.status === ETrackDelegationStatus.DELEGATED ? 'Delegated By' : 'Delegate To'}
																</span>
																<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
																	<Address
																		address={item?.status === ETrackDelegationStatus.DELEGATED ? delegation?.delegations?.[0]?.from : delegation?.delegations?.[0]?.to}
																		disableTooltip
																		iconSize={16}
																		disableHeader
																		addressClassName='dark:text-blue-dark-high text-xs font-semibold'
																		addressWithVerifiedTick
																		addressMaxLength={6}
																	/>
																</span>
															</div>
															<div className='flex justify-between'>
																<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
																	<VoterIcon /> Votes
																</span>
																<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
																	{formatedBalance((delegation?.delegations?.[0]?.balance?.toString() || '0')?.toString(), unit, 2)} {unit}
																</span>
															</div>
															<div className='flex justify-between'>
																<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
																	<ConvictionIcon /> Conviction
																</span>
																<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{delegation?.delegations?.[0]?.lockPeriod || '0.1'}x</span>
															</div>
															<div className='flex justify-between'>
																<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
																	<CapitalIcon /> Capital
																</span>
																<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
																	{formatedBalance((delegation?.delegations?.[0]?.balance || '0')?.toString(), unit, 2)} {unit}
																</span>
															</div>
															<div className='flex justify-between'>
																<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>Track</span>
																<span className='text-sm font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>
																	{getTrackNameFromId(network, delegation?.delegations?.[0]?.track)
																		.split('_')
																		.join(' ')}
																</span>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							</Panel>
						</Collapse>
					))}
				</div>
			</div>
			{!['moonbeam', 'moonbase', 'moonriver'].includes(network) && isOpenGovSupported(network) && (
				<DelegateModal
					open={openDelegateModal}
					setOpen={setOpenDelegateModal}
					defaultTarget={getEncodedAddress(addresses.length > 0 ? addressWithIdentity : addresses?.[0], network) || ''}
				/>
			)}
		</Spin>
	);
};
export default styled(ProfileDelegationsCard)`
	.ant-collapse {
		border-radius: 0px !important;
		border: none !important;
		background: transparent !important;
	}
	.pink-color {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
