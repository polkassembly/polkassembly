// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import Image from 'next/image';
import { ClockCircleOutlined } from '@ant-design/icons';
import { IPostListing } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect, useState } from 'react';
import { noTitle } from '~src/global/noTitle';
import Address from '~src/ui-components/Address';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import Link from 'next/link';
import { getDefaultPeriod } from '../Post/GovernanceSideBar/Referenda/ReferendaV2Messages';
import dayjs from 'dayjs';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IVotesResponse } from 'pages/api/v1/votes';
import AyeIcon from '~assets/delegation-tracks/aye-delegation.svg';
import NayIcon from '~assets/delegation-tracks/nay-delegation.svg';
import CautionIcon from '~assets/delegation-tracks/caution.svg';
import BN from 'bn.js';
import { formatBalance } from '@polkadot/util';
import { ETrackDelegationStatus, IPeriod } from '~src/types';
import { chainProperties } from '~src/global/networkConstants';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { getPeriodData } from '~src/util/getPeriodData';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useTranslation } from 'next-i18next';

interface Props {
	proposal: IPostListing;
	trackDetails: any;
	status: ETrackDelegationStatus[];
	delegatedTo: string | null;
}
const ZERO_BN = new BN(0);

const ActiveProposalCard = ({ proposal, trackDetails, status, delegatedTo }: Props) => {
	const { t } = useTranslation('common');
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress: address } = useUserDetailsSelector();

	const timeline = [{ created_at: proposal.created_at, hash: proposal.hash }];
	const [decision, setDecision] = useState<IPeriod>(getDefaultPeriod());
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const [votingData, setVotingData] = useState<IVotesResponse>();
	const [balance, setBalance] = useState<BN>(ZERO_BN);
	const [isAye, setIsAye] = useState<boolean>(false);
	const [isNay, setIsNay] = useState<boolean>(false);
	const [isAbstain, setIsAbstain] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(false);

	let titleString = proposal?.title || proposal?.method || noTitle;
	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = (
		<span>
			<div>
				#{proposal.post_id} {titleString}
			</div>
		</span>
	);
	const relativeCreatedAt = getRelativeCreatedAt(new Date(proposal?.created_at));

	const convertRemainingTime = (periodEndsAt: any) => {
		const diffMilliseconds = periodEndsAt.diff();
		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if (!diffDays) {
			return `${diffHours} h : ${diffMinutes} m `;
		}
		return `${diffDays} d  : ${diffHours} h : ${diffMinutes} m `;
	};

	const remainingTime = convertRemainingTime(decision.periodEndsAt);
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 640);
		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
	}, [network]);

	const getData = async () => {
		if (!address || !proposal?.post_id || status.includes(ETrackDelegationStatus.UNDELEGATED)) return;
		const votesAddress = status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION) ? address : delegatedTo;

		const { data, error } = await nextApiClientFetch<IVotesResponse>(
			`api/v1/votes?listingLimit=10&postId=${proposal?.post_id}&voteType=ReferendumV2&page=1&address=${votesAddress}`
		);
		if (data) {
			setVotingData(data);
			setIsAye(data?.yes?.count === 1);
			setBalance(data?.yes?.votes[0]?.balance?.value || ZERO_BN);
			setIsNay(data?.no?.count === 1);
			setBalance(data?.no?.votes[0]?.balance?.value || ZERO_BN);
			setIsAbstain(data?.abstain?.count === 1);
			setBalance(data?.abstain?.votes[0]?.balance?.value || ZERO_BN);
		} else {
			console.log(error);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const prepare = getPeriodData(network, dayjs(proposal.created_at), trackDetails, 'preparePeriod');
		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, votingData]);

	return (
		<Link href={`/referenda/${proposal?.post_id}`}>
			<div
				className={'rounded-sm rounded-t-[6px] border-[1px] border-solid border-section-light-container hover:border-pink_primary dark:border-[#3B444F] dark:border-separatorDark'}
			>
				<div className='flex w-full flex-wrap justify-between border-[1px] px-3 py-3 hover:border-pink_primary max-sm:flex-col max-sm:items-start max-sm:gap-2 sm:px-6 sm:py-6'>
					<div className='flex w-full shrink-0 flex-col flex-wrap max-sm:flex-col-reverse max-sm:gap-2'>
						{proposal?.status !== 'Submitted' && (
							<div className='flex shrink-0 flex-wrap items-center gap-2 sm:hidden'>
								<div className={`flex items-center text-xs ${!remainingTime.includes('d') ? 'text-[#EB0F36]' : 'text-blue-light-medium dark:text-blue-dark-medium'} shrink-0`}>
									<ClockCircleOutlined className='mr-1 shrink-0' />
									{remainingTime} {t('remaining')}
								</div>
							</div>
						)}
						<h2 className='text-medium shrink-0 break-words text-sm text-bodyBlue dark:text-white max-sm:mt-1'>{mainTitle}</h2>
						<div className='flex shrink-0 flex-wrap gap-1 text-xs font-normal text-lightBlue dark:text-blue-dark-medium sm:mt-[5px] sm:items-start lg:items-center'>
							<div className='flex shrink-0 flex-wrap items-center justify-between max-sm:w-full'>
								<div className='flex shrink-0 flex-wrap items-center gap-[2px] sm:gap-1'>
									{t('by')}:
									<Address
										address={String(proposal?.proposer)}
										className='address ml-1.5 flex shrink-0 items-center break-words'
										displayInline
										usernameClassName='text-xs font-medium shrink-0'
										isTruncateUsername={!isMobile}
										iconSize={isMobile ? 18 : 24}
									/>
									{relativeCreatedAt && (
										<div className='flex shrink-0 items-center justify-center sm:hidden'>
											<Divider
												type='vertical'
												className='border-l-1 shrink-0 border-lightBlue dark:border-icon-dark-inactive'
											/>
											<div className='flex shrink-0 items-center'>
												<ClockCircleOutlined className='mr-1 shrink-0' /> <span className='text-[10px]'>{relativeCreatedAt}</span>
											</div>
										</div>
									)}
								</div>
								<CustomButton
									height={24}
									width={80}
									shape='default'
									className={`ml-1 shrink-0 gap-[2px] self-end max-sm:mt-[6px] sm:hidden ${status.includes(ETrackDelegationStatus.DELEGATED) && 'opacity-50'}`}
									disabled={status.includes(ETrackDelegationStatus.DELEGATED)}
									variant='default'
								>
									<Image
										src={'/assets/icons/vote.svg'}
										height={14}
										width={14}
										alt=''
										className={'dark:text-white'}
									/>
									<span className='shrink-0 text-[10px] font-medium text-pink_primary'>{t('cast_vote')}</span>
								</CustomButton>
							</div>

							<div className='hidden shrink-0 items-center justify-center gap-2 sm:flex'>
								<Divider
									type='vertical'
									className='border-l-1 ml-[4px] mr-[4px] shrink-0 border-lightBlue dark:border-icon-dark-inactive'
								/>
								{relativeCreatedAt && (
									<>
										<div className='flex shrink-0 items-center'>
											<ClockCircleOutlined className='mr-1 shrink-0' /> {relativeCreatedAt}
										</div>
									</>
								)}
							</div>
							{proposal?.status !== 'Submitted' && (
								<div className='hidden shrink-0 items-center justify-center gap-2 sm:flex'>
									<Divider
										type='vertical'
										style={{ border: '1px solid #485F7D', marginLeft: '4px', marginRight: '4px' }}
									/>
									<div className={`flex shrink-0 items-center ${!remainingTime.includes('d') ? 'text-[#EB0F36]' : 'text-bodyBlue dark:text-white'}`}>
										<ClockCircleOutlined className='mr-1 shrink-0' />
										{remainingTime} {t('remaining')}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{(votingData && !status.includes(ETrackDelegationStatus.UNDELEGATED) && isAye) || isNay || isAbstain ? (
					<div
						className={`flex gap-2 rounded-b-[5px] border-[1px] border-solid py-1 sm:px-6 sm:py-2 ${isAye && 'border-aye_green bg-[#F0FCF6] dark:bg-[#0F1B15]'} ${
							isNay && 'border-nay_red bg-[#fff1f4] dark:bg-[#1E1013]'
						} ${isAbstain && 'border-[#ABABAC] bg-[#f9f9f9] dark:border-abstainBlueColor dark:bg-alertColorDark'}`}
					>
						{status.includes(ETrackDelegationStatus.DELEGATED) && (
							<Address
								address={String(delegatedTo)}
								usernameClassName='text-xs font-medium'
								isTruncateUsername={!isMobile}
								iconSize={isMobile ? 18 : 24}
								displayInline
								className='text-xs sm:hidden'
							/>
						)}
						<div className='flex items-center justify-center gap-1 text-xs tracking-[0.01em] text-[#243A5799] dark:text-blue-dark-medium'>{t('voted')}:</div>
						{!isAbstain ? (
							<div className='flex gap-2'>
								<span className='-ml-1 flex items-center justify-center'>
									{isAye && <AyeIcon />} {isNay && <NayIcon />}
								</span>
								<div className='flex items-center justify-center gap-1 text-xs tracking-[0.01em] text-[#243A5799] dark:text-blue-dark-medium'>
									{t('balance')}:<span className='font-medium text-bodyBlue dark:text-white'>{formatBalance(balance.toString(), { forceUnit: unit })}</span>
								</div>
								<div className='flex items-center justify-center gap-1 text-xs tracking-[0.01em] text-[#243A5799] dark:text-blue-dark-medium'>
									{t('conviction')}:{' '}
									<span className='font-medium text-bodyBlue dark:text-white'>{isAye ? votingData?.yes?.votes[0]?.lockPeriod : votingData?.no?.votes[0]?.lockPeriod}x</span>
								</div>
							</div>
						) : (
							<div className='ml-1 flex items-center text-xs font-medium text-abstainBlueColor dark:text-abstainDarkBlueColor'>{t('abstain')}</div>
						)}
					</div>
				) : (
					votingData && (
						<div className='flex rounded-b-[5px] border-[1px] border-solid border-warningAlertBorderDark bg-[#fff7ef] py-1 dark:bg-[#1D160E] sm:gap-2 sm:px-6 sm:py-2'>
							{status.includes(ETrackDelegationStatus.DELEGATED) && (
								<Address
									address={String(delegatedTo)}
									usernameClassName='text-xs font-medium'
									isTruncateUsername={!isMobile}
									iconSize={isMobile ? 18 : 24}
									displayInline
									className='text-xs sm:hidden'
								/>
							)}
							<div className='flex items-center justify-center text-[10px] text-lightBlue dark:text-blue-dark-medium max-sm:pl-[10px] sm:text-xs'>
								{t('not_voted_yet')} <CautionIcon className='ml-1' />
							</div>
						</div>
					)
				)}
			</div>
		</Link>
	);
};
export default ActiveProposalCard;
