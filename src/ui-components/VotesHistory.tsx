// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import StatusTag from './StatusTag';
import { useNetworkContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IProfileVoteHistoryRespose } from 'pages/api/v1/votesHistory/getVotesByVoter';
import { Empty, Pagination, Popover, Spin, Checkbox } from 'antd';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { noTitle } from '~src/global/noTitle';
import Link from 'next/link';
import Address from './Address';
import ExpandIcon from '~assets/icons/expand-small-icon.svg';
import AyeIcon from '~assets/icons/aye-green-icon.svg';
import NayIcon from '~assets/icons/profile-nay.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import VoterIcon from '~assets/icons/vote-small-icon.svg';
import ConvictionIcon from '~assets/icons/conviction-small-icon.svg';
import CapitalIcon from '~assets/icons/capital-small-icom.svg';
import EmailIcon from '~assets/icons/email_icon.svg';
import { poppins } from 'pages/_app';
import { EGovType } from '~src/types';
import { MinusCircleFilled } from '@ant-design/icons';
import { formatBalance } from '@polkadot/util';

interface Props {
	className?: string;
	userAddresses: string[];
	govType: EGovType;
}
interface IVotesData extends IProfileVoteHistoryRespose {
	expand?: boolean;
	delegatorsCount?: number;
	delegateCapital?: string;
}
const getOrderBy = (sortByPostIndex: boolean) => {
	const orderBy = [];
	orderBy.push(!sortByPostIndex ? 'proposalIndex_DESC' : 'proposalIndex_ASC');
	return orderBy;
};

enum EHeading {
	VOTE = 'Vote',
	PROPOSAL = 'Proposal',
	STATUS = 'Status'
}

const VotesHistory = ({ className, userAddresses, govType }: Props) => {
	const { network } = useNetworkContext();
	const headings = [EHeading.PROPOSAL, EHeading.VOTE, EHeading.STATUS];
	const [votesData, setVotesData] = useState<IVotesData[] | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [delegatorsLoading, setDelegatorsLoading] = useState<{ isLoading: boolean; index: number | null }>({ index: null, isLoading: false });
	const [sortByPostIndex, setSortByPostIndex] = useState<boolean>(false);
	const [checkedAddressList, setCheckedAddressList] = useState<CheckboxValueType[]>(userAddresses as CheckboxValueType[]);
	const [addressDropdownExpand, setAddressDropdownExpand] = useState(false);

	const content = (
		<div className='flex flex-col'>
			<Checkbox.Group
				className='flex max-h-[200px] flex-col overflow-y-auto'
				onChange={(list) => setCheckedAddressList(list)}
				value={checkedAddressList}
			>
				{userAddresses?.map((address, index) => (
					<div
						className={`${poppins.variable} ${poppins.className} flex gap-[13px] p-[8px] text-sm tracking-[0.01em] text-bodyBlue`}
						key={index}
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
						/>
					</div>
				))}
			</Checkbox.Group>
		</div>
	);

	const handleVoteHistoryData = async () => {
		setVotesData(null);
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IProfileVoteHistoryRespose[]; totalCount: number }>('api/v1/votesHistory/getVotesByVoter', {
			orderBy: getOrderBy(sortByPostIndex),
			page,
			type: govType === EGovType.OPEN_GOV ? 'ReferendumV2' : 'Referendum',
			voterAddresses: checkedAddressList || []
		});
		if (data) {
			setVotesData(data?.data);
			setTotalCount(data?.totalCount);
		} else {
			console.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		handleVoteHistoryData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, userAddresses, sortByPostIndex, checkedAddressList, govType]);

	const handleExpand = (index: number) => {
		const newData = votesData?.map((vote, idx) => {
			if (index === idx) {
				return { ...vote, expand: !vote?.expand };
			}
			return vote;
		});
		setVotesData(newData || votesData);
		handleDelegatesAndCapital(index);
	};

	const handleDelegatesAndCapital = async (index: number) => {
		const filteredVote = votesData?.filter((item, idx) => index === idx)?.[0];
		if ((filteredVote?.delegatorsCount && filteredVote?.delegateCapital) || filteredVote?.isDelegatedVote) return;
		setDelegatorsLoading({ index, isLoading: true });

		const { data, error } = await nextApiClientFetch<{ count: number; voteCapital: string }>(
			`api/v1/votes/delegationVoteCountAndPower?postId=${filteredVote?.proposal?.id}&decision=${filteredVote?.decision || 'yes'}&type=${
				govType === EGovType.OPEN_GOV ? 'ReferendumV2' : 'Referendum'
			}&voter=${filteredVote?.voter}`
		);
		if (data) {
			const newData = votesData?.map((vote, idx) => {
				if (index === idx) {
					return { ...vote, delegateCapital: data?.voteCapital, delegatorsCount: data?.count, expand: !vote?.expand };
				}
				return vote;
			});
			setVotesData(newData || votesData);
		} else {
			console.log(error);
		}
		setDelegatorsLoading({ index: null, isLoading: true });
	};

	const handleSortingClick = (heading: EHeading) => {
		if (heading === EHeading.STATUS || heading === EHeading.VOTE) return;
		setSortByPostIndex(!sortByPostIndex);
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<>
			{userAddresses.length > 1 && (
				<div className='pb-4'>
					<Popover
						zIndex={1056}
						content={content}
						placement='bottom'
						open={addressDropdownExpand}
					>
						<div className=' flex w-[180px] items-center gap-2 rounded-[4px] border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-sm font-medium text-lightBlue'>
							Select Addresses
							<span
								onClick={() => setAddressDropdownExpand(!addressDropdownExpand)}
								className='flex items-center'
							>
								<DownArrowIcon className={`cursor-pointer ${addressDropdownExpand && 'pink-color rotate-180'}`} />
							</span>
						</div>
					</Popover>
				</div>
			)}
			<Spin
				className={`${className} w-full`}
				spinning={loading}
			>
				{votesData && votesData?.length > 0 && !loading ? (
					<div className={`flex min-w-[100%] flex-shrink-0 flex-col overflow-x-auto overflow-y-hidden ${className}`}>
						<div className='flex h-14 items-center justify-between gap-2 border-0 border-y-[1px] border-solid border-[#DCDFE3] bg-[#fbfbfc] px-3 max-md:hidden'>
							{headings.map((heading, index) => (
								<span
									onClick={() => handleSortingClick(heading as EHeading)}
									className={`flex items-center text-sm font-medium text-lightBlue ${
										heading === EHeading.PROPOSAL ? 'w-[45%] ' : heading === EHeading.VOTE ? 'w-[35%]' : 'w-[20%] justify-end'
									} pr-10`}
									key={index}
								>
									{heading}
									{heading === EHeading.PROPOSAL && (
										<ExpandIcon className={heading === EHeading.PROPOSAL && !!sortByPostIndex ? 'ml-1 rotate-180 cursor-pointer' : 'ml-1 cursor-pointer'} />
									)}
								</span>
							))}
						</div>
						<div className='max-md:flex max-md:flex-col max-md:gap-4'>
							{votesData &&
								votesData?.map((data, index) => (
									<div
										className={`border-[#DCDFE3] text-sm text-bodyBlue max-md:rounded-[14px] max-md:border-[1px] max-md:border-solid ${data?.expand && 'max-md:bg-[#fbfbfc]'}`}
										key={index}
									>
										<div className={`border-0 ${!data?.expand && !loading && 'border-b-[1px]'} border-solid border-[#DCDFE3] text-sm text-bodyBlue max-md:border-none `}>
											<div className='flex h-14 items-center justify-between gap-2 border-0 px-3 max-md:border-b-[1px] max-md:border-solid max-md:border-[#DCDFE3]'>
												<Link
													target='_blank'
													href={`https:${network}.polkassembly.io/${govType === EGovType.OPEN_GOV ? 'referenda' : 'referendum'}/${data?.proposal?.id}`}
													className='flex w-[45%] truncate font-medium text-bodyBlue hover:text-bodyBlue max-md:w-[95%]'
												>
													<span className='flex w-[60px] items-center gap-1 '>
														{`#${data?.proposal?.id}`}
														<span className='text-[9px] text-bodyBlue'>&#9679;</span>
													</span>
													<span className='w-[100%] truncate hover:underline '>{data?.proposal?.title || noTitle}</span>
												</Link>
												<div className='flex w-[35%] justify-between max-md:hidden'>
													{data?.decision === 'yes' ? (
														<span className='flex w-[50px] flex-shrink-0 items-center justify-start text-[#2ED47A]'>
															<AyeIcon className='mr-1' />
															Aye
														</span>
													) : data?.decision === 'no' ? (
														<span className='flex w-[50px] flex-shrink-0 items-center justify-start text-[#F53C3C]'>
															<NayIcon className='mr-1' />
															Nay
														</span>
													) : (
														<span className='flex w-[50px] flex-shrink-0 items-center justify-start text-[#407BFF]'>
															<MinusCircleFilled className='mr-1' /> Abstain
														</span>
													)}
													<span className='flex w-[40.3%] flex-shrink-0 justify-end lg:w-[51%]'>
														{formatedBalance((data?.balance.toString() || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
													</span>
													<span className='flex w-[20.3%] justify-end'>
														{data?.lockPeriod ? data?.lockPeriod : 0.1}x{data.isDelegatedVote && '/d'}
													</span>
												</div>
												<span className='flex w-[20%] justify-end max-md:hidden'>
													<StatusTag
														status={data?.proposal?.status}
														className='truncate max-lg:w-[80px]'
													/>
													<span onClick={() => handleExpand(index)}>
														<DownArrowIcon className={`cursor-pointer ${data?.expand && 'pink-color rotate-180'}`} />
													</span>
												</span>
												<div className='md:hidden'>
													<span onClick={() => handleExpand(index)}>
														<DownArrowIcon className={`cursor-pointer ${data?.expand && 'pink-color rotate-180'}`} />
													</span>
												</div>
											</div>
											<div className='flex justify-between px-3 py-4 md:hidden'>
												<div className='flex w-[50%] items-center justify-between gap-2 max-sm:w-[70%]'>
													{data?.decision === 'yes' ? (
														<span className='flex items-center justify-end text-[#2ED47A]'>
															<AyeIcon className='mr-1' />
															Aye
														</span>
													) : (
														<span className='flex items-center justify-end text-[#F53C3C]'>
															<NayIcon className='mr-1' />
															Nay
														</span>
													)}
													<span className='flex justify-end'>
														{formatedBalance((data?.balance.toString() || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
													</span>
													<span>
														{data?.lockPeriod ? data?.lockPeriod : 0.1}x{data.isDelegatedVote && '/d'}
													</span>
												</div>
												<StatusTag
													status={data?.proposal?.status}
													className='truncate max-sm:w-[90px] max-xs:w-[70px]'
												/>
											</div>
										</div>
										{data?.expand && (
											<Spin spinning={delegatorsLoading.isLoading && delegatorsLoading?.index === index}>
												<div className='border-0 border-t-[1px] border-dashed border-[#DCDFE3] bg-[#fbfbfc] px-3 py-4 text-sm text-lightBlue max-md:bg-transparent'>
													<div className='flex flex-col gap-4'>
														<div className=' flex items-center gap-2 max-md:flex-col max-md:items-start'>
															<label className='flex items-center gap-2 font-medium'>Vote Details:</label>
															{!data?.isDelegatedVote && (
																<Address
																	address={data?.voter}
																	iconSize={18}
																	displayInline
																	isTruncateUsername={false}
																/>
															)}
														</div>
														{data.isDelegatedVote && (
															<div className=' flex items-center gap-2 max-md:flex-col max-md:items-start'>
																<label className='flex items-center gap-2 font-medium'>
																	Delegator:
																	<Address
																		address={data?.voter}
																		iconSize={18}
																		displayInline
																		isTruncateUsername={false}
																	/>
																</label>
																<label className='flex items-center gap-2 font-medium'>
																	Vote Casted by:
																	<Address
																		address={data?.delegatedTo || ''}
																		iconSize={18}
																		displayInline
																		isTruncateUsername={false}
																	/>
																</label>
															</div>
														)}
														<div className='flex justify-between max-md:flex-col max-md:gap-2'>
															<div className='w-[50%] border-0 border-r-[1px] border-dashed border-[#DCDFE3] max-md:w-[100%] max-md:border-0 max-md:border-b-[1px] max-md:pb-2'>
																<label className='font-semibold'>Self Votes</label>
																<div className='mt-2 flex flex-col gap-2 pr-6 max-md:pr-0'>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-sm text-[#576D8B]'>
																			<VoterIcon /> Votes
																		</span>
																		<span className='text-sm text-bodyBlue'>
																			{Number(formatedBalance((data?.balance.toString() || '0').toString(), unit, 2).replaceAll(',', '')) * Number(data?.lockPeriod || 0.1)} {unit}
																		</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-sm text-[#576D8B]'>
																			<ConvictionIcon /> Conviction
																		</span>
																		<span className='text-sm text-bodyBlue'>
																			{data?.lockPeriod || 0.1}x{data.isDelegatedVote && '/d'}
																		</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-sm text-[#576D8B]'>
																			<CapitalIcon /> Capital
																		</span>
																		<span className='text-sm text-bodyBlue'>
																			{formatedBalance((data?.balance.toString() || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
																		</span>
																	</div>
																</div>
															</div>
															<div className='w-[50%] justify-start max-md:w-[100%] md:pl-6'>
																<label className='font-semibold'>Delegation Votes</label>
																<div className='mt-2 flex flex-col gap-2 lg:pr-4'>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-sm text-[#576D8B]'>
																			<VoterIcon /> Votes
																		</span>
																		<span className='text-sm text-bodyBlue'>
																			{formatedBalance((data?.delegatedVotingPower || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
																		</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-sm text-[#576D8B]'>
																			<EmailIcon /> Delegators
																		</span>
																		<span className='text-sm text-bodyBlue'>{data?.delegatorsCount || 0}</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-sm text-[#576D8B]'>
																			<CapitalIcon /> Capital
																		</span>
																		<span className='text-sm text-bodyBlue'>
																			{formatedBalance((data?.delegateCapital || '0').toString(), chainProperties[network].tokenSymbol, 2)} {unit}
																		</span>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</Spin>
										)}
									</div>
								))}
						</div>
						<div className='mt-4 flex w-full items-center justify-center'>
							<Pagination
								defaultCurrent={1}
								current={page}
								pageSize={LISTING_LIMIT}
								total={totalCount}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={(page: number) => setPage(page)}
								responsive={true}
							/>
						</div>
					</div>
				) : (
					<div className='mt-16'>{votesData && <Empty />}</div>
				)}
			</Spin>
		</>
	);
};

export default styled(VotesHistory)`
	.ant-collapse {
		border-radius: 0px !important;
		border: none !important;
		background: transparent !important;
	}
	.pink-color {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
