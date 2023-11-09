// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState, useEffect } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import { CloseIcon, IconVoteHistory } from '~src/ui-components/CustomIcons';
import ThresholdGraph from '../Modal/VoteData/ThresholdGraph';
import GraphExpandIcon from '~assets/graph-expand.svg';
import AyeApprovalIcon from '~assets/chart-aye-current-approval.svg';
import NayApprovalIcon from '~assets/chart-nay-current-approval.svg';
import AyeThresholdIcon from '~assets/chart-aye-threshold.svg';
import NayThresholdIcon from '~assets/chart-nay-threshold.svg';
import { Modal } from 'antd';
import Curves from './Curves';
import Loader from '~src/ui-components/Loader';

interface IRefV2ThresholdDataProps {
	canVote: boolean;
	className?: string;
	setOpen: (value: React.SetStateAction<boolean>) => void;
	thresholdData?: any;
}
const RefV2ThresholdData: FC<IRefV2ThresholdDataProps> = ({ className, setOpen, thresholdData, canVote }) => {
	const [thresholdOpen, setThresholdOpen] = useState(false);
	const [isCurvesRender, setIsCurvesRender] = useState(true);
	useEffect(() => {
		if (thresholdOpen && isCurvesRender) {
			setTimeout(() => {
				setIsCurvesRender(false);
			}, 50);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [thresholdOpen]);

	return (
		<>
			<GovSidebarCard className={className}>
				<div className='relative z-50 flex items-center justify-between'>
					<h6 className='m-0 p-0 text-xl font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Voting Details</h6>
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
							<div className='relative flex justify-center border-[#D2D8E0] dark:border-[#3B444F]'>
								<button
									className='absolute right-1 top-0 -mt-5 cursor-pointer border-0 bg-white dark:bg-section-dark-overlay'
									onClick={() => setThresholdOpen(true)}
								>
									<GraphExpandIcon />
								</button>
								<ThresholdGraph
									{...thresholdData}
									forGovSidebar={true}
								/>
							</div>
							<div className='flex justify-center'>
								<div className='flex justify-between gap-5 md:w-[350px]'>
									<div className='mt-4 flex flex-col gap-x-5'>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high'>
											<span>
												<AyeApprovalIcon />
											</span>
											Current Approval
										</span>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high'>
											<span>
												<AyeThresholdIcon />
											</span>
											Threshold
										</span>
									</div>
									<div className='mt-4 flex flex-col gap-x-5'>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high'>
											<span>
												<NayApprovalIcon />
											</span>
											Current Support
										</span>
										<span className='flex gap-[6px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high'>
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
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				onCancel={() => {
					setThresholdOpen(false);
				}}
				open={thresholdOpen}
				footer={[]}
				className='md:min-w-[700px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				title={<h2 className='text-xl font-semibold leading-[30px] tracking-[0.01em] text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'>Threshold Curves</h2>}
			>
				<div className='relative mt-5 min-h-[250px] md:min-h-[400px]'>
					{isCurvesRender ? (
						<div className='flex min-h-[250px] w-full items-center justify-center md:min-h-[400px]'>
							<Loader />
						</div>
					) : (
						<Curves
							curvesError={thresholdData.curvesError}
							curvesLoading={thresholdData.curvesLoading}
							data={thresholdData.data}
							progress={thresholdData.progress}
							setData={thresholdData.setData}
							canVote={canVote}
							status={thresholdData.status}
						/>
					)}
				</div>
			</Modal>
		</>
	);
};

export default React.memo(RefV2ThresholdData);
