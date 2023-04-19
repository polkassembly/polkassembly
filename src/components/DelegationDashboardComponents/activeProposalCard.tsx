// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';

import { ClockCircleOutlined } from '@ant-design/icons';
import { IPostListing } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect, useState } from 'react';
import { noTitle } from '~src/global/noTitle';
import Address from '~src/ui-components/Address';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import VoteIcon from '~assets/icons/vote.svg';
import Link from 'next/link';
import { IPeriod, getDefaultPeriod, getPeriodData, getStatusBlock } from '../Post/GovernanceSideBar/Referenda/ReferendaV2Messages';
import { useNetworkContext } from '~src/context';
import dayjs from 'dayjs';

interface Props{
  proposal: IPostListing;
  trackDetails: any;
}

const ActiveProposalCard = ({ proposal, trackDetails }: Props) => {

	const { network } = useNetworkContext();
	const timeline = [{ created_at: proposal.created_at, hash: proposal.hash }];
	const [decision, setDecision] = useState<IPeriod>(getDefaultPeriod());
	const decidingStatusBlock = getStatusBlock( timeline || [], 'ReferendumV2', 'Deciding');
	const [isDays, setIsDays] = useState(true);

	let titleString = proposal?.title || proposal?.method || noTitle;

	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = <span><div>{titleString}</div></span>;
	const relativeCreatedAt = getRelativeCreatedAt(new Date(proposal?.created_at));

	const convertRemainingTime = (preiodEndsAt: any ) => {

		const diffMilliseconds = preiodEndsAt.diff();

		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		const diffSeconds = diffDuration.seconds();
		return (`${diffDays !== 0 ? diffDays+' days ' : ''} ${diffHours} : ${diffMinutes} : ${diffSeconds} `);
	};

	useEffect(() => {
		const prepare = getPeriodData(network, dayjs(proposal.created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = ((decidingStatusBlock && decidingStatusBlock.timestamp)? dayjs(decidingStatusBlock.timestamp): prepare.periodEndsAt);
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return <Link href={`/referenda/${proposal?.post_id}`}>
		<div className='border-solid px-6 py-6 border-[1px] border-[#D2D8E0] rounded-[6px] flex justify-between max-sm:gap-2 max-sm:items-start max-sm:flex-col hover:border-pink_primary'>
			<div className='flex flex-col '>
				<h2 className='text-sm text-medium text-[#243A57]'>{mainTitle}</h2>
				<div className='mt-[5px] flex items-center gap-1 text-xs font-normal text-[#485F7D] max-lg:flex-col max-lg:items-start max-lg:gap-2'>
					<div className='flex items-center gap-1'>By:
						<span>
							<Address
								address={String(proposal?.proposer)}
								className='address ml-1.5'
								displayInline={true}
							/>
						</span>
					</div>
					<div className='flex justify-center items-center gap-2'>
						<Divider type="vertical" style={{ border: '1px solid #485F7D', marginLeft: '4px', marginRight: '4px' }}/>
						{relativeCreatedAt && <>
							<div className='flex items-center'>
								<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
							</div>
						</>}</div>
					<div className='flex justify-center items-center gap-2'>
						<Divider type="vertical" style={{ border: '1px solid #485F7D', marginLeft: '4px', marginRight: '4px' }}/>
						<div className={`flex items-center ${!isDays ? 'text-[#EB0F36]' :'text-[#243A57]'}`}>
							<ClockCircleOutlined className='mr-1' />
							{convertRemainingTime(decision.periodEndsAt)}
           Remaining
						</div></div>
				</div>
			</div>
			<div className='flex justify-center mt-2 gap-2'>
				<VoteIcon/><span className='text-pink_primary text-sm font-medium'>Cast Vote</span>
			</div>
		</div></Link>;

};
export default ActiveProposalCard;
