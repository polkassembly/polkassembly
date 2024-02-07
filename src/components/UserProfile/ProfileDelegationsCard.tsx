// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse, Popover, Radio, Spin } from 'antd';
import Image from 'next/image';
import { poppins } from 'pages/_app';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import { useApiContext } from '~src/context';
import { ETrackDelegationStatus, IDelegation } from '~src/types';
import Address from '~src/ui-components/Address';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import styled from 'styled-components';
import { formatBalance } from '@polkadot/util';
import VoterIcon from '~assets/icons/vote-small-icon.svg';
import CapitalIcon from '~assets/icons/capital-small-icom.svg';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import classNames from 'classnames';
import { DownArrowIcon, ExpandIcon } from '~src/ui-components/CustomIcons';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import ConvictionIcon from '~assets/icons/conviction-small-icon.svg';

const { Panel } = Collapse;

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
}
interface IDelegates {
	[index: string]: {
		delegations: IDelegation[];
		expand: boolean;
		total: number;
		capital: number;
		votingPower: number;
		lockedPeriod: number;
	};
}

const getIsSingleDelegation = (delegations: IDelegation[]) => {
	const filteredData = delegations.filter((delegation) => Number(delegations[0]?.balance) === Number(delegation?.balance) && delegations[0]?.lockPeriod === delegation?.lockPeriod);
	return filteredData?.length === delegations?.length;
};
const handleUniqueDelegations = (data: ITrackDelegation[], type: ETrackDelegationStatus, checkedAddress: string, network: string) => {
	const dataObj: any = {};
	const encodedAddress = getEncodedAddress(checkedAddress, network);
	data.map((delegation) => {
		delegation?.delegations.map((delegate) => {
			let val;
			if (type === ETrackDelegationStatus.RECEIVED_DELEGATION) {
				if (getEncodedAddress(delegate?.from, network) !== encodedAddress) {
					val = delegate.from;
				}
			} else {
				if (getEncodedAddress(delegate?.to, network) !== encodedAddress) {
					val = delegate.to;
				}
			}
			if (val) {
				if (dataObj[val] === undefined) {
					dataObj[val] = {
						capital: Number(delegate?.balance),
						delegations: [delegate],
						expand: false,
						lockedPeriod: delegate?.lockPeriod,
						total: 1,
						votingPower: Number(delegate?.balance) * (delegate?.lockPeriod ? delegate?.lockPeriod : 1)
					};
				} else {
					dataObj[val] = {
						...dataObj[val],
						capital: dataObj[val].capital + Number(delegate?.balance),
						delegations: [...dataObj[val].delegations, delegate],
						lockedPeriod: delegate?.lockPeriod,
						total: dataObj[val]?.total + 1,
						votingPower: dataObj[val].votingPower + Number(delegate?.balance) * (delegate?.lockPeriod ? delegate?.lockPeriod : 1)
					};
				}
			}
		});
	});
	return dataObj;
};

const ProfileDelegationsCard = ({ className, userProfile, addressWithIdentity }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { id: loginId, username } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { addresses } = userProfile;
	const [receiveDelegations, setReceiveDelegations] = useState<IDelegates>();
	const [delegatedDelegations, setDelegatedDelegations] = useState<IDelegates>();
	const [checkedAddress, setCheckedAddress] = useState<string>(getSubstrateAddress(addressWithIdentity || '') || '');
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);
	const [openDelegateModal, setOpenDelegateModal] = useState<boolean>(false);
	const [collapseItems, setCollapseItems] = useState([
		{ data: receiveDelegations, label: 'RECEIVED DELEGATION', src: '/assets/profile/received-delegation.svg', status: ETrackDelegationStatus.RECEIVED_DELEGATION },
		{ data: delegatedDelegations, label: 'DELEGATED', src: '/assets/profile/delegated.svg', status: ETrackDelegationStatus.DELEGATED }
	]);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;

	useEffect(() => {
		setCheckedAddress(getSubstrateAddress(addressWithIdentity || '') || '');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addressWithIdentity]);

	const content = (
		<div className='flex flex-col'>
			<Radio.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={(e) => setCheckedAddress(e.target.value)}
				value={checkedAddress?.length ? checkedAddress : getSubstrateAddress(addressWithIdentity || '')}
				defaultValue={getSubstrateAddress(addressWithIdentity || '')}
			>
				{addresses?.map((address) => (
					<div
						className={`${poppins.variable} ${poppins.className} flex gap-[13px] p-[8px] text-sm tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
						key={address}
					>
						<Radio
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
			</Radio.Group>
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
		if (!api || !apiReady || !(checkedAddress?.length || addressWithIdentity?.length)) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: checkedAddress || addressWithIdentity
		});
		if (data) {
			const received: ITrackDelegation[] = [];
			const delegated: ITrackDelegation[] = [];

			data.map((item) => {
				if (item.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
					received.push(item);
				}
				if (item.status.includes(ETrackDelegationStatus.DELEGATED)) {
					delegated.push(item);
				}
			});
			const uniqueReceived = handleUniqueDelegations(received, ETrackDelegationStatus.RECEIVED_DELEGATION, checkedAddress, network);
			const uniqueDelegated = handleUniqueDelegations(delegated, ETrackDelegationStatus.DELEGATED, checkedAddress, network);

			setReceiveDelegations(uniqueReceived);

			setCollapseItems(
				collapseItems.map((item) => {
					if (item?.status === ETrackDelegationStatus.RECEIVED_DELEGATION) {
						return { ...item, data: uniqueReceived };
					}
					return {
						...item,
						data: uniqueDelegated
					};
				})
			);
			setDelegatedDelegations(uniqueDelegated);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};
	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, checkedAddress]);

	const handleExpand = (address: string, type: ETrackDelegationStatus) => {
		const newData = type === ETrackDelegationStatus.DELEGATED ? delegatedDelegations : receiveDelegations;

		if (type === ETrackDelegationStatus.DELEGATED) {
			setDelegatedDelegations({ ...(delegatedDelegations as any), [address]: { ...newData, expand: !newData?.expand } });
		} else {
			setReceiveDelegations({ ...(receiveDelegations as any), [address]: { ...newData, expand: !newData?.expand } });
		}

		const updatedData: any = collapseItems.map((item) => {
			if (item.status === type) {
				return { ...item, data: { ...item?.data, [address]: { ...(item?.data?.[address] || {}), expand: !(item?.data?.[address] || {})?.expand || false } } };
			}
			return item;
		});
		setCollapseItems(updatedData);
	};
	return (
		<Spin spinning={loading}>
			<div
				className={classNames(
					className,
					'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
				)}
			>
				<div className='flex items-center justify-between'>
					<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
						<Image
							src='/assets/profile/profile-delegation.svg'
							alt=''
							width={24}
							height={24}
						/>
						Delegations
					</span>
					{userProfile?.user_id !== loginId && !!(username || '').length && (
						<CustomButton
							className='delegation-buttons border-none shadow-none'
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
									<DownArrowIcon className={`cursor-pointer text-2xl ${addressDropdownExpand && 'pink-color rotate-180'}`} />
								</span>
							</div>
						</Popover>
					</div>
				)}
				{/*TODO delegation bio */}
				{/* <div className='flex flex-col gap-1 text-sm text-bodyBlue dark:text-blue-dark-high'>
          <span className='font-semibold text-lightBlue dark:text-blue-dark-medium'>Delegation Mandate</span>
          <span className='font-normal'>
            Maecenas eget ligula vitae enim posuere volutpat. Pellentesque sed tellus pretium, pellentesque risus vitae, convallis dui. Pellentesque sed tellus pretium, Vestibulum
            nec leo at dui euismod lacinia non quis risus. Vivamus lobortis felis lectus, et consequat lacus dapibus in.
          </span>
        </div> */}
				<div className='flex flex-col gap-4'>
					{collapseItems?.map((item, index) => (
						<Collapse
							key={item?.status}
							size='small'
							className={'my-custom-collapse border-[#D2D8E0] bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
							expandIconPosition='end'
							expandIcon={({ isActive }) => {
								return (
									<div className='flex h-full items-end justify-end'>
										{!!Object.keys(item?.data || {})?.length && (
											<DownArrowIcon className={`${!!item?.data?.length && 'cursor-pointer'} text-2xl ${isActive && 'pink-color rotate-180'}`} />
										)}{' '}
									</div>
								);
							}}
							collapsible={!Object.keys(item?.data || {})?.length ? 'disabled' : 'header'}
						>
							<Panel
								collapsible={!Object.keys(item?.data || {})?.length ? 'disabled' : 'header'}
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
											<span className='text-base text-bodyBlue dark:text-blue-dark-high'>{Object.keys(item?.data || {}).length || 0}</span>
										</div>
									</div>
								}
								key={index}
							>
								<div className='-mx-3 -my-3 flex flex-col p-[1px] text-bodyBlue'>
									{!!Object.keys(item?.data || {}).length && (
										<div className='flex h-12 items-center justify-between border-0 border-b-[1px] border-solid border-[#D2D8E0] px-3 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high max-lg:text-xs'>
											<span className='flex items-center justify-center gap-1'>
												index <ExpandIcon className='text-xl text-bodyBlue dark:text-[#909090]' />
											</span>
											<span className='flex w-[40%] items-center justify-center gap-1'>
												{item?.status === ETrackDelegationStatus.RECEIVED_DELEGATION ? 'Delegated By' : 'Delegate To'}{' '}
												<ExpandIcon className='text-xl text-bodyBlue dark:text-[#909090]' />
											</span>
											<span className='flex items-center justify-center gap-1'>
												Voting Power <ExpandIcon className='text-xl text-bodyBlue dark:text-[#909090]' />
											</span>
											<span className='w-[10%] max-lg:w-[5%]' />
										</div>
									)}
									{!!Object.keys(item?.data || {}).length &&
										item?.data &&
										Object.entries(item?.data)?.map(([address, value], idx) => {
											return (
												<div
													key={address}
													onClick={() => handleExpand(address, item?.status)}
												>
													<div
														className={`flex justify-between border-0 border-y-[1px] border-solid border-[#D2D8E0] px-3 py-4 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high ${
															(value?.expand || idx === value?.delegations.length - 1) && 'border-b-0 border-t-[1px]'
														}`}
														onClick={() => {
															if (!value?.delegations.length) return;
															handleExpand(address, item?.status);
														}}
													>
														<span className='w-[15%] max-lg:w-[5%]'>#{idx + 1}</span>
														<div
															className='flex w-[40%] items-center justify-center max-lg:w-[60%]'
															key={address}
														>
															<Address
																address={address}
																displayInline
																usernameMaxLength={isMobile ? 5 : 30}
															/>
														</div>
														<div className='flex w-[50%] items-center justify-center text-sm'>
															{formatedBalance(String(value.votingPower), unit, 2)} {unit}
														</div>
														<span className=''>
															<DownArrowIcon className={`cursor-pointer text-2xl ${value?.expand && 'pink-color rotate-180'}`} />
														</span>
													</div>
													{value?.expand && (
														<div className='border-0 border-t-[1px] border-dashed border-[#D2D8E0] px-3 pb-3 dark:border-separatorDark'>
															<div className='justify-start'>
																<div className='mt-2 flex flex-col gap-2'>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-icon-dark-inactive'>
																			<Image
																				src='/assets/profile/delegate.svg'
																				width={16}
																				height={16}
																				alt=''
																			/>
																			{item?.status === ETrackDelegationStatus.RECEIVED_DELEGATION ? 'Delegated By' : 'Delegate To'}
																		</span>
																		<span className='text-xs font-medium text-bodyBlue dark:text-blue-dark-high'>
																			<Address
																				address={address}
																				disableTooltip
																				disableHeader
																				iconSize={16}
																				addressClassName='dark:text-blue-dark-high text-xs font-semibold'
																				addressWithVerifiedTick
																				addressMaxLength={6}
																			/>
																		</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs font-normal text-[#576D8B] dark:text-icon-dark-inactive'>
																			<VoterIcon /> Voting Power
																		</span>
																		<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>
																			{value?.delegations?.length === 1 || getIsSingleDelegation(value?.delegations)
																				? `${formatedBalance(String(value?.votingPower), unit, 2)} ${unit}`
																				: 'Multiple'}
																		</span>
																	</div>
																	{getIsSingleDelegation(value?.delegations) && (
																		<div className='flex justify-between'>
																			<span className='flex items-center gap-1 text-xs font-normal text-[#576D8B] dark:text-icon-dark-inactive'>
																				<ConvictionIcon /> Conviction
																			</span>
																			<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>{value?.lockedPeriod || 0.1}x</span>
																		</div>
																	)}
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs font-normal text-[#576D8B] dark:text-icon-dark-inactive'>
																			<CapitalIcon /> Capital
																		</span>
																		<span className='text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>
																			{value?.delegations?.length === 1 || getIsSingleDelegation(value?.delegations)
																				? `${formatedBalance(String(value?.capital), unit, 2)} ${unit}`
																				: 'Multiple'}
																		</span>
																	</div>
																	<div className='flex justify-between'>
																		<div className='flex w-[300px] flex-col items-start justify-between gap-1 text-xs font-normal text-[#576D8B] dark:text-icon-dark-inactive'>
																			Tracks {value?.delegations?.length !== 1 ? `(${value?.delegations?.length})` : ''}
																		</div>
																		<div
																			className={`text-xs font-normal capitalize text-bodyBlue dark:text-blue-dark-high ${
																				getIsSingleDelegation(value?.delegations) ? 'flex flex-wrap justify-end gap-0.5 break-words' : 'flex flex-col gap-1'
																			}`}
																		>
																			{value?.delegations.map((delegate, trackIndex) => (
																				<span
																					key={delegate?.track}
																					className='flex items-center'
																				>
																					{getTrackNameFromId(network, delegate?.track)
																						.split('_')
																						.join(' ')}{' '}
																					{value?.delegations.length !== 1 && !getIsSingleDelegation(value?.delegations)
																						? `(VP: ${formatedBalance(String(Number(delegate?.balance) * (delegate?.lockPeriod || 1)), unit, 2)} ${unit}, Ca: ${formatedBalance(
																								String(delegate?.balance),
																								unit,
																								2
																						  )} ${unit}, Co: ${delegate?.lockPeriod || 0.1}x)`
																						: trackIndex !== value.delegations.length - 1
																						? ', '
																						: ''}
																					{}
																				</span>
																			))}
																		</div>
																	</div>
																</div>
																{value?.delegations?.length !== 1 && !getIsSingleDelegation(value?.delegations) && (
																	<div className='mt-2 flex w-full justify-start text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>
																		VP: Voting Power, Ca: Capital, Co: Conviction
																	</div>
																)}
															</div>
														</div>
													)}
												</div>
											);
										})}
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
	.pink-color {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
