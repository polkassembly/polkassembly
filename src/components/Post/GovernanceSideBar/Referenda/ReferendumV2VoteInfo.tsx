// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal, Spin } from 'antd';
import { LoadingOutlined, InfoCircleOutlined, DislikeFilled } from '@ant-design/icons';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import VoteProgress from 'src/ui-components/VoteProgress';
import formatBnBalance from 'src/util/formatBnBalance';

import { useApiContext, useNetworkContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { CastVoteIcon, ConvictionPeriodIcon, LikeDislikeIcon, RightArrowIcon, VoteAmountIcon, IconVoteHistory } from '~src/ui-components/CustomIcons';
import PassingInfoTag from '~src/ui-components/PassingInfoTag';
import CloseIcon from 'public/assets/icons/close.svg';
import DefaultProfile from '~assets/icons/dashboard-profile.svg';
import { poppins } from 'pages/_app';
import ThresholdGraph from '../Modal/VoteData/ThresholdGraph';
import GraphExpandIcon from '~assets/graph-expand.svg';
import AyeApprovalIcon from '~assets/chart-aye-current-approval.svg';
import NayApprovalIcon from '~assets/chart-nay-current-approval.svg';
import AyeThresholdIcon from '~assets/chart-aye-threshold.svg';
import NayThresholdIcon from '~assets/chart-nay-threshold.svg';

interface IReferendumV2VoteInfoProps {
	className?: string;
	referendumId: number;
	tally?: any;
	setOpen: (value: React.SetStateAction<boolean>) => void;
	setThresholdOpen: React.Dispatch<React.SetStateAction<boolean>>;
	showVoteHistory?: boolean;
	thresholdData?: any;
}

const ZERO = new BN(0);

const ReferendumV2VoteInfo: FC<IReferendumV2VoteInfoProps> = ({ className, tally, setOpen, setThresholdOpen, showVoteHistory, thresholdData }) => {
	const { network } = useNetworkContext();
	const {
		postData: { status, postIndex }
	} = usePostDataContext();
	const [voteCalculationModalOpen, setVoteCalculationModalOpen] = useState(false);

	const { api, apiReady } = useApiContext();
	const [activeIssuance, setActiveIssuance] = useState<BN | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [tallyData, setTallyData] = useState({
		ayes: ZERO || 0,
		nays: ZERO || 0,
		support: ZERO || 0
	});

	useEffect(() => {
		if (!api || !apiReady) return;

		(async () => {
			const totalIssuance = await api.query.balances.totalIssuance();
			const inactiveIssuance = await api.query.balances.inactiveIssuance();
			setActiveIssuance(totalIssuance.sub(inactiveIssuance));
		})();

		if (['confirmed', 'executed', 'timedout', 'cancelled', 'rejected', 'executionfailed'].includes(status.toLowerCase())) {
			setTallyData({
				ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
				nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0),
				support: String(tally?.support).startsWith('0x') ? new BN(tally?.support || 0, 'hex') : new BN(tally?.support || 0)
			});
			setIsLoading(false);
			return;
		}

		(async () => {
			const referendumInfoOf = await api.query.referenda.referendumInfoFor(postIndex);
			const parsedReferendumInfo: any = referendumInfoOf.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					ayes:
						typeof parsedReferendumInfo.ongoing.tally.ayes === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays:
						typeof parsedReferendumInfo.ongoing.tally.nays === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.nays),
					support:
						typeof parsedReferendumInfo.ongoing.tally.support === 'string'
							? new BN(parsedReferendumInfo.ongoing.tally.support.slice(2), 'hex')
							: new BN(parsedReferendumInfo.ongoing.tally.support)
				});
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex'),
					support: new BN(tally?.support || 0, 'hex')
				});
			}
		})();
		setIsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, api, apiReady]);

	return (
		<>
			{!showVoteHistory && (
				<GovSidebarCard className={className}>
					<div className='relative z-50 flex items-center justify-between'>
						<h6 className='m-0 p-0 text-xl font-medium leading-6 text-bodyBlue'>Voting</h6>
						<div className='flex items-center gap-x-2'>
							{['Executed', 'Confirmed', 'Approved', 'TimedOut', 'Cancelled', 'Rejected'].includes(status) && (
								<PassingInfoTag
									status={status}
									isPassing={['Executed', 'Confirmed', 'Approved'].includes(status)}
								/>
							)}
							<button
								onClick={() => setVoteCalculationModalOpen(true)}
								className='flex cursor-pointer items-center justify-center border-none bg-transparent text-lg text-navBlue outline-none hover:text-pink_primary'
							>
								<InfoCircleOutlined style={{ color: '#90A0B7' }} />
							</button>
						</div>
					</div>
					<Spin
						spinning={isLoading}
						indicator={<LoadingOutlined />}
					>
						<div>
							<VoteProgress
								ayeVotes={tallyData.ayes}
								className='vote-progress'
								nayVotes={tallyData.nays}
							/>
						</div>
						<section className='-mt-4 grid grid-cols-2 gap-x-7 gap-y-3 text-lightBlue'>
							<article className='flex items-center justify-between gap-x-2'>
								<div className='flex items-center gap-x-1'>
									<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Ayes</span>
								</div>
								<div className='text-xs font-medium leading-[22px] text-navBlue'>
									{formatUSDWithUnits(formatBnBalance(tallyData.ayes, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
								</div>
							</article>
							<article className='flex items-center justify-between gap-x-2'>
								<div className='flex items-center gap-x-1'>
									<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Nays</span>
								</div>
								<div className='text-xs font-medium leading-[22px] text-navBlue'>
									{formatUSDWithUnits(formatBnBalance(tallyData.nays, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
								</div>
							</article>
							<article className='flex items-center justify-between gap-x-2'>
								<div className='flex items-center gap-x-1'>
									<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Support</span>
								</div>
								<div className='text-xs font-medium leading-[22px] text-navBlue'>
									{formatUSDWithUnits(formatBnBalance(tallyData.support, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
								</div>
							</article>
							{activeIssuance ? (
								<article className='flex items-center justify-between gap-x-2'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Issuance</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-navBlue'>
										{formatUSDWithUnits(formatBnBalance(activeIssuance, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
							) : null}
						</section>
						<Modal
							onCancel={() => {
								setVoteCalculationModalOpen(false);
							}}
							open={voteCalculationModalOpen}
							footer={[
								<div
									key='ok'
									className='-mx-6 mt-4'
									style={{ borderTop: '1.5px solid #E1E6EB' }}
								>
									<div className='mt-5 flex items-center justify-end px-6'>
										<Button
											className='flex h-[40px] w-[134px] flex-shrink-0 flex-col items-center justify-center gap-10 rounded-[4px] border-none bg-pink_primary px-4 py-1 text-sm font-medium text-white'
											onClick={() => setVoteCalculationModalOpen(false)}
										>
											Got It
										</Button>
									</div>
								</div>
							]}
							className={`${poppins.variable} ${poppins.className} w-[584px] max-sm:w-full`}
							closeIcon={<CloseIcon className='mt-2' />}
							title={
								<label className={`${poppins.variable} ${poppins.className} text-xl font-semibold leading-[30px] tracking-[0.01em] text-bodyBlue`}>
									<InfoCircleOutlined className='mr-2 h-6 w-6' />
									<span className='font-semibold'>How are votes calculated</span>
								</label>
							}
						>
							<section className='flex flex-col gap-y-6'>
								<div
									className='-mx-6 mt-3'
									style={{ borderTop: '1px solid #E1E6EB' }}
								>
									<p className='m-0 mt-5 p-0 px-6 text-sm font-normal leading-[18px] text-bodyBlue'>
										Votes are calculated by multiplying the votes casted by a user with the conviction period.
									</p>
								</div>

								<article className='my-2 flex items-center justify-between md:gap-x-2'>
									<div className='flex flex-col items-center justify-center gap-y-3'>
										<CastVoteIcon className='text-4xl' />
										<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue'>
											<span className='flex flex-col items-center gap-x-1 whitespace-nowrap md:flex-row'>
												<span>User wants to</span>
											</span>
											<span>cast a vote</span>
										</p>
									</div>
									<div className='flex items-center justify-center'>
										<RightArrowIcon className='text-sm md:text-xl' />
									</div>
									<div className='flex flex-col items-center justify-center gap-y-3'>
										<VoteAmountIcon className='text-4xl' />
										<p className='m-0 hidden flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue md:flex'>
											<span className='whitespace-nowrap'>Chooses vote amount</span>
											<span>and type (Aye/Nay)</span>
										</p>
										<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue md:hidden'>
											<span className='whitespace-nowrap'>Chooses vote</span>
											<span>amount and</span>
											<span className='whitespace-nowrap'>type (Aye/Nay)</span>
										</p>
									</div>
									<div className='flex items-center justify-center'>
										<RightArrowIcon className='text-sm md:text-xl' />
									</div>
									<div className='flex flex-col items-center justify-center gap-y-3'>
										<ConvictionPeriodIcon className='text-4xl' />
										<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue'>
											<span className='flex flex-col items-center gap-x-1 whitespace-nowrap md:flex-row'>
												<span>Sets a</span>
												<a
													className='text-pink_primary underline'
													href='https://wiki.polkadot.network/docs/learn-opengov#voluntary-locking'
													target='_blank'
													rel='noreferrer'
												>
													conviction
												</a>
											</span>
											<span>period</span>
										</p>
									</div>
									<div className='flex items-center justify-center'>
										<RightArrowIcon className='text-sm md:text-xl' />
									</div>
									<div className='flex flex-col items-center justify-center gap-y-3'>
										<LikeDislikeIcon className='text-4xl' />
										<p className='m-0 hidden flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue md:flex'>
											<span className='whitespace-nowrap'>User casts their</span>
											<span>vote</span>
										</p>
										<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-sidebarBlue md:hidden'>
											<span className='whitespace-nowrap'>User</span>
											<span>casts</span>
											<span className='whitespace-nowrap'>their vote</span>
										</p>
									</div>
								</article>
								<div className='flex flex-col'>
									<div style={{ borderTop: '1.5px dashed #D2D8E0' }}>
										<p className='m-0 mt-5 p-0 text-sm font-medium leading-[18px] text-bodyBlue'>Here,</p>
									</div>
									<article
										className='mt-[12px] flex max-w-[400px] items-start justify-between rounded-lg p-3'
										style={{ backgroundColor: 'rgba(216, 185, 202, 0.19);', boxShadow: '0px 4px 19px 0px rgba(216, 185, 202, 0.19)' }}
									>
										<div className='flex flex-col items-center justify-center'>
											<p className='m-0 mt-[2px] flex flex-col p-0 text-sm font-normal text-bodyBlue'>
												<p className='font-semibold leading-3'>Voter</p>
												<div className='flex items-center justify-start leading-6'>
													<DefaultProfile style={{ height: '20px', width: '20px' }} />
													<p className='ml-2 mt-2 text-xs text-navBlue'>DDUX..c..</p>
												</div>
											</p>
										</div>
										<div className='flex flex-col items-center justify-center '>
											<p className='m-0 flex flex-col p-0 text-sm font-normal text-bodyBlue'>
												<p className='font-semibold leading-5'>Amount</p>
												<span className='item-start text-xs leading-6 text-navBlue'>11.27 KSM</span>
											</p>
										</div>
										<div className='flex flex-col items-center justify-center '>
											<p className='m-0 flex flex-col p-0 text-sm font-normal text-bodyBlue'>
												<p className='font-semibold leading-5'>Conviction</p>
												<span className='text-xs leading-6 text-navBlue'>4x</span>
											</p>
										</div>
										<div className='flex flex-col items-center justify-center '>
											<p className='m-0 flex flex-col p-0 text-sm font-normal text-bodyBlue'>
												<p className='font-semibold leading-5'>Vote</p>
												<DislikeFilled
													className='text-xl leading-6'
													style={{ color: '#F53C3C' }}
												/>
											</p>
										</div>
									</article>
								</div>
								<p className='m-0 p-0 text-sm font-normal leading-[18px] text-sidebarBlue'>
									The vote will be calculated by multiplying <span className='text-pink_primary'>11.27 KSM (amount)*4 (conviction)</span> to get the final vote.
								</p>
							</section>
						</Modal>
					</Spin>
				</GovSidebarCard>
			)}
			{showVoteHistory && (
				<GovSidebarCard className={className}>
					<div className='relative z-50 flex items-center justify-between'>
						<h6 className='m-0 p-0 text-xl font-medium leading-6 text-bodyBlue'>Voting Data</h6>
						<div className='flex items-center gap-x-2'>
							{['Executed', 'Confirmed', 'Approved', 'TimedOut', 'Cancelled', 'Rejected'].includes(status) && (
								<PassingInfoTag
									status={status}
									isPassing={['Executed', 'Confirmed', 'Approved'].includes(status)}
								/>
							)}
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
					<div className='mt-10'>
						{thresholdData && (
							<div>
								<div className='flex justify-center border-[#D2D8E0]'>
									<button
										className='absolute right-[20px] top-[50px] mt-7 cursor-pointer border-0 bg-white'
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
								<div className='flex justify-between'>
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
						)}
					</div>
				</GovSidebarCard>
			)}
		</>
	);
};

export default React.memo(ReferendumV2VoteInfo);
