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

interface Props{
  className?: string;
  status?: string;
  pipId: number;
  proposalType: ProposalType;
  setOpen: (pre: boolean) => void;
}
const ZERO_BN = new BN(0);

const PIPsVoteInfo = ({ className, status, pipId, setOpen }: Props) => {

	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();

	const [voteInfo, setVoteInfo] = useState({
		ayes:ZERO_BN,
		ayesAmount:ZERO_BN,
		nays: ZERO_BN,
		naysAmount: ZERO_BN
	});

	const getVotes = async() => {
		if(!api || !apiReady) return;
		const voteInfo:any = await api.query.pips.proposalResult(pipId).then((data) => data.toJSON());
		if(voteInfo){

			setVoteInfo({
				ayes:new BN( voteInfo.ayesCount) || ZERO_BN,
				ayesAmount: new BN(voteInfo.ayesStake) || ZERO_BN,
				nays: new BN(voteInfo.naysCount) || ZERO_BN,
				naysAmount: new BN(voteInfo.naysStake) || ZERO_BN
			});
		}
	};

	useEffect(() => {
		getVotes();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[api, apiReady]);

	return <div className={className}>
		<div className='flex items-center justify-between relative z-50'>
			<h6 className='text-bodyBlue font-medium text-xl leading-6 m-0 p-0'>Voting</h6>
			<div className='flex items-center gap-x-2'>
				<StatusTag status={status} />
			</div>
		</div>
		<VoteProgress
			ayeVotes={voteInfo?.ayesAmount}
			className='vote-progress'
			nayVotes={voteInfo?.naysAmount}
		/>
		<section className='flex text-lightBlue -mt-4 justify-between px-1.5'>
			<article className='flex items-center gap-x-2'>
				<div className='flex items-center gap-x-1'>
					<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
										Aye:
					</span>
					<span
						className='text-lightBlue text-xs font-medium leading-[22px]'
					>
						{formatUSDWithUnits(formatBnBalance(voteInfo?.ayesAmount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</span>
				</div>

			</article>
			<article className='flex items-center text-lightBlue gap-x-2'>
				<div className='flex items-center gap-x-1'>
					<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
										Nay:
					</span>
					<span className='text-lightBlue text-xs font-medium leading-[22px]'>
						{formatUSDWithUnits(formatBnBalance(voteInfo?.naysAmount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
					</span>
				</div>
			</article>
		</section>
		<Divider style={{ border: '1px solid #e3e6eb' }} className='my-4'/>

		<button onClick={() => setOpen(true)} className='bg-transparent p-0 m-0 border-none outline-none cursor-pointer flex items-center gap-x-1 text-pink_primary font-medium text-xs leading-[22px] -mt-1'>
			<VotingHistoryIcon />
			<span>Voting History</span>
		</button>
	</div>;
};
export default PIPsVoteInfo;
