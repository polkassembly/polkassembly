// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import VoteProgress from 'src/ui-components/VoteProgress';
import { VotingHistoryIcon } from '~src/ui-components/CustomIcons';

interface IFellowshipReferendumVoteInfoProps {
	className?: string;
	tally?: any;
	setOpen: (value: React.SetStateAction<boolean>) => void;
}

const FellowshipReferendumVoteInfo: FC<IFellowshipReferendumVoteInfoProps> = (
	props
) => {
	const { className, tally, setOpen } = props;

	return (
		<GovSidebarCard className={className}>
			<h6 className="dashboard-heading mb-6">Voting Status</h6>

			{tally && (
				<>
					<VoteProgress
						ayesNum={Number(tally?.ayes)}
						className="vote-progress"
						naysNum={Number(tally?.nays)}
					/>
					<section className="grid grid-cols-2 gap-x-7 gap-y-3 text-[#485F7D] -mt-4">
						<article className="flex items-center justify-between gap-x-2">
							<div className="flex items-center gap-x-1">
								<span className="font-medium text-xs leading-[18px] tracking-[0.01em]">
									Ayes
								</span>
							</div>
							<div className="text-navBlue text-xs font-medium leading-[22px]">
								{tally.ayes}
							</div>
						</article>
						<article className="flex items-center justify-between gap-x-2">
							<div className="flex items-center gap-x-1">
								<span className="font-medium text-xs leading-[18px] tracking-[0.01em]">
									Bare Ayes
								</span>
							</div>
							<div className="text-navBlue text-xs font-medium leading-[22px]">
								{tally.bareAyes}
							</div>
						</article>
						<article className="flex items-center justify-between gap-x-2">
							<div className="flex items-center gap-x-1">
								<span className="font-medium text-xs leading-[18px] tracking-[0.01em]">
									Nays
								</span>
							</div>
							<div className="text-navBlue text-xs font-medium leading-[22px]">
								{tally.nays}
							</div>
						</article>
					</section>
					<section className="flex items-center gap-x-4 border-0 border-t-[0.75px] border-solid border-[#D2D8E0] mt-[18px] pt-[18px] pb-[14px]">
						<button
							className="bg-transparent p-0 m-0 border-none outline-none cursor-pointer flex items-center gap-x-1 text-pink_primary font-medium text-xs leading-[22px]"
							onClick={() => {
								setOpen(true);
							}}
						>
							<VotingHistoryIcon />
							<span>Voting History</span>
						</button>
					</section>
				</>
			)}
		</GovSidebarCard>
	);
};

export default React.memo(FellowshipReferendumVoteInfo);
