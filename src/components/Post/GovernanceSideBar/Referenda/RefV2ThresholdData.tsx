// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import { IconVoteHistory } from '~src/ui-components/CustomIcons';
import ThresholdGraph from '../Modal/VoteData/ThresholdGraph';
import GraphExpandIcon from '~assets/graph-expand.svg';
import AyeApprovalIcon from '~assets/chart-aye-current-approval.svg';
import NayApprovalIcon from '~assets/chart-nay-current-approval.svg';
import AyeThresholdIcon from '~assets/chart-aye-threshold.svg';
import NayThresholdIcon from '~assets/chart-nay-threshold.svg';

interface IReferendumV2VoteInfoProps {
	className?: string;
	setOpen: (value: React.SetStateAction<boolean>) => void;
	setThresholdOpen: React.Dispatch<React.SetStateAction<boolean>>;
	thresholdData?: any;
}
const ReferendumV2VoteInfo: FC<IReferendumV2VoteInfoProps> = ({ className, setOpen, setThresholdOpen, thresholdData }) => {
	return (
		<>
			<GovSidebarCard className={className}>
				<div className='relative z-50 flex items-center justify-between'>
					<h6 className='m-0 p-0 text-xl font-medium leading-6 text-bodyBlue'>Voting Details</h6>
					<div className='flex items-center gap-x-2'>
						<button
							onClick={() => {
								setOpen(true);
							}}
							className='flex cursor-pointer items-center justify-center border-none bg-transparent text-lg text-navBlue outline-none hover:text-pink_primary'
						>
							<IconVoteHistory
								className='mt-1 text-2xl'
								style={{ color: '#90A0B7' }}
							/>
							<span className='text-xs text-pink_primary'>View Vote History</span>
						</button>
					</div>
				</div>
				<div className='mt-7'>
					{thresholdData && (
						<div>
							<div className='relative flex justify-center border-[#D2D8E0]'>
								<button
									className='absolute right-1 top-0 -mt-5 cursor-pointer border-0 bg-white'
									onClick={() => setThresholdOpen(true)}
								>
									<GraphExpandIcon />
								</button>
								<ThresholdGraph
									{...thresholdData}
									setThresholdOpen={setThresholdOpen}
									forGovSidebar={true}
								/>
							</div>
							<div className='flex justify-center'>
								<div className='flex justify-between gap-5 md:w-[350px]'>
									<div className='mt-4 flex flex-col gap-x-5'>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue'>
											<span>
												<AyeApprovalIcon />
											</span>
											Current Approval
										</span>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue'>
											<span>
												<AyeThresholdIcon />
											</span>
											Threshold
										</span>
									</div>
									<div className='mt-4 flex flex-col gap-x-5'>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue'>
											<span>
												<NayApprovalIcon />
											</span>
											Current Support
										</span>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue'>
											<span>
												<NayThresholdIcon />
											</span>
											Threshold
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</GovSidebarCard>
		</>
	);
};

export default React.memo(ReferendumV2VoteInfo);
