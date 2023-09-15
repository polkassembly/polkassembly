// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { useApiContext, useNetworkContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import StatusTag from '~src/ui-components/StatusTag';
import VoteProgress from '~src/ui-components/VoteProgress';
import formatBnBalance from '~src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { VotingHistoryIcon } from '~src/ui-components/CustomIcons';
import { Divider } from 'antd';

interface Props {
	className?: string;
	status?: string;
	pipId: number;
	proposalType: ProposalType;
	setOpen: (pre: boolean) => void;
	tally?: any;
}
const ZERO_BN = new BN(0);

const PIPsVoteInfo = ({ className, status, pipId, setOpen, proposalType, tally }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();

	const [voteInfo, setVoteInfo] = useState({
		ayes: ZERO_BN,
		ayesAmount: ZERO_BN,
		nays: ZERO_BN,
		naysAmount: ZERO_BN
	});

	const getVotes = async () => {
		if (!api || !apiReady) return;
		const voteInfo: any = await api.query.pips.proposalResult(pipId).then((data) => data.toJSON());
		if (voteInfo) {
			setVoteInfo({
				ayes: new BN(voteInfo.ayesCount) || ZERO_BN,
				ayesAmount: new BN(voteInfo.ayesStake) || ZERO_BN,
				nays: new BN(voteInfo.naysCount) || ZERO_BN,
				naysAmount: new BN(voteInfo.naysStake) || ZERO_BN
			});
		}
	};

	useEffect(() => {
		if ([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)) return;

		getVotes();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return (
		<div className={className}>
			<div className='relative z-50 flex items-center justify-between'>
				<h6 className='m-0 p-0 text-xl font-medium leading-6 text-bodyBlue'>Voting</h6>
				<div className='flex items-center gap-x-2'>
					<StatusTag status={status} />
				</div>
			</div>
			{[ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType) ? (
				<VoteProgress
					ayesNum={Number(tally?.ayes) || 0}
					className='vote-progress'
					naysNum={Number(tally?.nays) || 0}
				/>
			) : (
				<VoteProgress
					ayeVotes={voteInfo?.ayesAmount}
					className='vote-progress'
					nayVotes={voteInfo?.naysAmount}
				/>
			)}
			<section className='-mt-4 grid grid-cols-2 gap-x-7 gap-y-3 text-lightBlue'>
				<article className='flex items-center justify-between gap-x-2'>
					<div className='flex items-center gap-x-1'>
						<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Ayes:</span>
					</div>
					<div className='text-xs font-medium leading-[22px] text-navBlue'>
						{[ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)
							? tally?.ayes || 0
							: formatUSDWithUnits(formatBnBalance(voteInfo?.ayesAmount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</div>
				</article>
				<article className='flex items-center justify-between gap-x-2'>
					<div className='flex items-center gap-x-1'>
						<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Nays:</span>
					</div>
					<div className='text-xs font-medium leading-[22px] text-navBlue'>
						{[ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType)
							? tally?.nays || 0
							: formatUSDWithUnits(formatBnBalance(voteInfo?.naysAmount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</div>
				</article>
				{[ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType) && (
					<article className='flex items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-1'>
							<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Total Seats</span>
						</div>
						<div className='text-xs font-medium leading-[22px] text-navBlue'>{tally?.totalSeats || 0}</div>
					</article>
				)}
			</section>
			<Divider
				style={{ border: '1px solid #e3e6eb' }}
				className='my-4'
			/>

			<button
				onClick={() => setOpen(true)}
				className='m-0 -mt-1 flex cursor-pointer items-center gap-x-1 border-none bg-transparent p-0 text-xs font-medium leading-[22px] text-pink_primary outline-none'
			>
				<VotingHistoryIcon />
				<span>Voting History</span>
			</button>
		</div>
	);
};
export default PIPsVoteInfo;
