// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider } from 'antd';

import { ClockCircleOutlined } from '@ant-design/icons';
import { IPostListing } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect, useState } from 'react';
import { noTitle } from '~src/global/noTitle';
import Address from '~src/ui-components/Address';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import VoteIcon from '~assets/icons/vote.svg';
import Link from 'next/link';
import { getDefaultPeriod } from '../Post/GovernanceSideBar/Referenda/ReferendaV2Messages';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import dayjs from 'dayjs';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IVotesResponse } from 'pages/api/v1/votes';
import AyeIcon from '~assets/delegation-tracks/aye-delegation.svg';
import NayIcon from '~assets/delegation-tracks/nay-delegation.svg';
import CautionIcon from '~assets/delegation-tracks/caution.svg';
import BN from 'bn.js';
import { BN_ZERO, formatBalance } from '@polkadot/util';
import { ETrackDelegationStatus, IPeriod } from '~src/types';
import { chainProperties } from '~src/global/networkConstants';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { getPeriodData } from '~src/util/getPeriodData';

interface Props {
	proposal: IPostListing;
	trackDetails: any;
	status: ETrackDelegationStatus[];
	delegatedTo: string | null;
}

const ActiveProposalCard = ({ proposal, trackDetails, status, delegatedTo }: Props) => {
	const { network } = useNetworkContext();
	const timeline = [{ created_at: proposal.created_at, hash: proposal.hash }];
	const [decision, setDecision] = useState<IPeriod>(getDefaultPeriod());
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const [votingData, setVotingData] = useState<IVotesResponse>();
	const [balance, setBalance] = useState<BN>(BN_ZERO);
	const [isAye, setIsAye] = useState<boolean>(false);
	const [isNay, setIsNay] = useState<boolean>(false);
	const [isAbstain, setIsAbstain] = useState<boolean>(false);
	const { delegationDashboardAddress: address } = useUserDetailsContext();

	let titleString = proposal?.title || proposal?.method || noTitle;

	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = (
		<span>
			<div>{titleString}</div>
		</span>
	);
	const relativeCreatedAt = getRelativeCreatedAt(new Date(proposal?.created_at));

	const convertRemainingTime = (preiodEndsAt: any) => {
		const diffMilliseconds = preiodEndsAt.diff();

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
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getData = async () => {
		if (!address || !proposal?.post_id) return;
		let votesAddress = '';

		if (status.includes(ETrackDelegationStatus.Undelegated)) {
			return;
		}
		if (status.includes(ETrackDelegationStatus.Received_Delegation)) {
			votesAddress = address;
		} else if (status.includes(ETrackDelegationStatus.Delegated) && delegatedTo !== null) {
			votesAddress = delegatedTo;
		}

		const { data, error } = await nextApiClientFetch<IVotesResponse>(
			`api/v1/votes?listingLimit=10&postId=${proposal?.post_id}&voteType=ReferendumV2&page=1&address=${votesAddress}`
		);
		if (data) {
			setVotingData(data);
		} else {
			console.log(error);
		}
	};

	useEffect(() => {
		!votingData && getData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [votingData]);

	useEffect(() => {
		const prepare = getPeriodData(network, dayjs(proposal.created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);

		if (votingData) {
			if (votingData?.yes?.count === 1) {
				setIsAye(true);
				setBalance(votingData?.yes?.votes[0].balance.value);
			} else if (votingData?.no?.count === 1) {
				setIsNay(true);
				setBalance(votingData?.no?.votes[0].balance.value);
			} else if (votingData?.abstain?.count === 1) {
				setIsAbstain(true);
				setBalance(votingData?.abstain?.votes[0].balance.value);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, votingData]);

	return (
		<Link href={`/referenda/${proposal?.post_id}`}>
			<div className={'rounded-[6px] rounded-t-[6px] border-[1px] border-solid border-[#D2D8E0] hover:border-[#E5007A]'}>
				<div className='flex justify-between border-[1px] px-6 py-6 hover:border-pink_primary max-sm:flex-col max-sm:items-start max-sm:gap-2'>
					<div className='flex flex-col '>
						<h2 className='text-medium text-sm text-[#243A57]'>{mainTitle}</h2>
						<div className='mt-[5px] flex items-center gap-1 text-xs font-normal text-[#485F7D] max-lg:flex-col max-lg:items-start max-lg:gap-2'>
							{
								<div className='flex items-center gap-1'>
									By:
									<span>
										<Address
											address={String(proposal?.proposer)}
											className='address ml-1.5'
											displayInline={true}
										/>
									</span>
								</div>
							}
							<div className='flex items-center justify-center gap-2'>
								<Divider
									type='vertical'
									style={{ border: '1px solid #485F7D', marginLeft: '4px', marginRight: '4px' }}
								/>
								{relativeCreatedAt && (
									<>
										<div className='flex items-center'>
											<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
										</div>
									</>
								)}
							</div>
							{proposal?.status !== 'Submitted' && (
								<div className='flex items-center justify-center gap-2'>
									<Divider
										type='vertical'
										style={{ border: '1px solid #485F7D', marginLeft: '4px', marginRight: '4px' }}
									/>
									<div className={`flex items-center ${!remainingTime.includes('d') ? 'text-[#EB0F36]' : 'text-[#243A57]'}`}>
										<ClockCircleOutlined className='mr-1' />
										{remainingTime}
										Remaining
									</div>
								</div>
							)}
						</div>
					</div>
					<Button
						className={`mt-2 flex justify-center gap-2 border-none bg-white shadow-none ${status.includes(ETrackDelegationStatus.Delegated) && 'opacity-50'}`}
						disabled={status.includes(ETrackDelegationStatus.Delegated)}
					>
						<VoteIcon />
						<span className='text-sm font-medium text-pink_primary'>Cast Vote</span>
					</Button>
				</div>
				{(votingData && !status.includes(ETrackDelegationStatus.Undelegated) && isAye) || isNay || isAbstain ? (
					<div
						className={`flex gap-2 rounded-b-[5px] border-[1px] border-solid px-6 py-2 ${isAye && 'border-[#2ED47A] bg-[#F0FCF6]'} ${isNay && 'border-[#FF3C5F] bg-[#fff1f4]'} ${
							isAbstain && 'border-[#ABABAC] bg-[#f9f9f9]'
						}`}
					>
						{status.includes(ETrackDelegationStatus.Delegated) && (
							<Address
								address={String(delegatedTo)}
								displayInline
							/>
						)}
						<div className='flex items-center justify-center gap-1 text-xs tracking-[0.01em] text-[#243A5799]'>Voted:</div>
						{!isAbstain ? (
							<div className='flex gap-2'>
								<span className='-ml-1 flex items-center justify-center'>
									{isAye && <AyeIcon />} {isNay && <NayIcon />}
								</span>
								<div className='flex items-center justify-center gap-1 text-xs tracking-[0.01em] text-[#243A5799]'>
									Balance:<span className='font-medium text-[#243A57]'>{formatBalance(balance.toString(), { forceUnit: unit })}</span>
								</div>
								<div className='flex items-center justify-center gap-1 text-xs tracking-[0.01em] text-[#243A5799]'>
									Conviction:<span className='font-medium text-[#243A57]'>{isAye ? votingData?.yes?.votes[0]?.lockPeriod : votingData?.no?.votes[0]?.lockPeriod}x</span>
								</div>
							</div>
						) : (
							<div className='ml-1 flex items-center text-xs font-medium text-[#485F7D]'>Abstain</div>
						)}
					</div>
				) : (
					votingData && (
						<div className='flex gap-2 rounded-b-[5px] border-[1px] border-solid border-[#F89118] bg-[#fff7ef] px-6 py-2'>
							{status.includes(ETrackDelegationStatus.Delegated) && (
								<Address
									address={String(delegatedTo)}
									displayInline
								/>
							)}
							<div className='flex items-center justify-center text-xs text-[#485F7D]'>
								Not Voted yet <CautionIcon className='ml-1' />
							</div>
						</div>
					)
				)}
			</div>
		</Link>
	);
};
export default ActiveProposalCard;
