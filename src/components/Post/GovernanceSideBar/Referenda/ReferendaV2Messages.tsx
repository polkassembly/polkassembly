// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Progress } from 'antd';
import BN from 'bn.js';
import dayjs from 'dayjs';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { blocksToRelevantTime, getTrackData } from '~src/components/Listing/Tracks/AboutTrackCard';
import { useApiContext, useNetworkContext, usePostDataContext } from '~src/context';
import { DecisionPeriodIcon, EnactmentPeriodIcon, PreparePeriodIcon } from '~src/ui-components/CustomIcons';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import CloseIcon from 'public/assets/icons/close.svg';
import { getBlockLink } from '~src/util/subscanCheck';
import { IProgress } from './Curves';
import { IPeriod } from '~src/types';
import { getPeriodData } from '~src/util/getPeriodData';
import { getStatusBlock } from '~src/util/getStatusBlock';

interface IReferendaV2Messages {
    className?: string;
	progress: IProgress;
}

interface IButtonProps extends PropsWithChildren {
	className?: string;
}

export const getDefaultPeriod = () => {
	return {
		period: '',
		periodCardVisible: false,
		periodEndsAt: dayjs(),
		periodPercent: 0
	};
};

export const checkProposalPresent = (timeline: any[], type: string) => {
	if (timeline && Array.isArray(timeline)) {
		return timeline.some((v) => {
			if (v && v.type === type) {
				return true;
			}
			return false;
		});
	}
	return false;
};

const ReferendaV2Messages: FC<IReferendaV2Messages> = (props) => {
	const { progress } = props;
	const { postData: { track_name, track_number, created_at, status, timeline, requested } } = usePostDataContext();
	const { network } = useNetworkContext();
	const { api, apiReady } = useApiContext();
	const trackData = getTrackData(network, track_name, track_number);
	const proposalCreatedAt = dayjs(created_at);
	const [prepare, setPrepare] = useState<IPeriod>(getDefaultPeriod());
	const [decision, setDecision] = useState<IPeriod>(getDefaultPeriod());
	const [confirm, setConfirm] = useState<IPeriod>(getDefaultPeriod());
	const [minEnactment, setMinEnactment] = useState<IPeriod>(getDefaultPeriod());
	const [spend, setSpend] = useState<IPeriod>(getDefaultPeriod());
	const [open, setOpen] = useState(false);
	const isTreasuryProposal = trackData.group === 'Treasury';
	const isProposalPassed = ['Executed', 'Confirmed', 'Approved'].includes(status);
	const isProposalFailed = ['Rejected', 'TimedOut', 'Cancelled', 'Killed'].includes(status);
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const confirmStartedStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'ConfirmStarted');
	const confirmedStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Confirmed');
	const awardedStatusBlock = getStatusBlock(timeline || [], ['TreasuryProposal'], 'Awarded');
	const isTreasuryProposalPresent = checkProposalPresent(timeline || [], 'TreasuryProposal');

	const Button: FC<IButtonProps> = (props) => {
		const { children, className } = props;
		return (
			<button onClick={() => setOpen(true)} className={`cursor-pointer flex items-center justify-center border-none outline-none bg-[#FEF2F8] w-[30px] h-[30px] rounded-full text-base font-normal leading-[24px] tracking-[0.01em] text-lightBlue ${className}`}>
				{children}
			</button>
		);
	};

	useEffect(() => {
		if (!trackData) return;

		const prepare = getPeriodData(network, proposalCreatedAt, trackData, 'preparePeriod');
		setPrepare(prepare);

		const decisionPeriodStartsAt = ((decidingStatusBlock && decidingStatusBlock.timestamp)? dayjs(decidingStatusBlock.timestamp): prepare.periodEndsAt);
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackData, 'decisionPeriod');
		setDecision(decision);

		const confirmPeriodEndsAt = ((confirmStartedStatusBlock && confirmStartedStatusBlock.timestamp)? dayjs(confirmStartedStatusBlock.timestamp): decision.periodEndsAt);
		const confirm = getPeriodData(network, confirmPeriodEndsAt, trackData, 'confirmPeriod');
		setConfirm(confirm);

		const minEnactmentPeriodStartsAt = ((confirmedStatusBlock && confirmedStatusBlock.timestamp)? dayjs(confirmedStatusBlock.timestamp): confirm.periodEndsAt);
		const minEnactment = getPeriodData(network, minEnactmentPeriodStartsAt, trackData, 'minEnactmentPeriod');
		setMinEnactment(minEnactment);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (isTreasuryProposal) {
			if (!api || !apiReady) return;
			(async () => {
				const currentBlock = await api.derive.chain.bestNumber();
				const spendPeriodConst = api.consts.treasury? api.consts.treasury.spendPeriod : new BN(0);
				const spendPeriod = spendPeriodConst.toNumber();
				const goneBlocks = currentBlock.toNumber() % spendPeriod;
				const percentage = ((goneBlocks / spendPeriod) * 100).toFixed(0);
				setSpend({
					period: blocksToRelevantTime(network, spendPeriod),
					periodCardVisible: false,
					periodEndsAt: dayjs(),
					periodPercent: Number(percentage)
				});
			})();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network]);
	const periodStartAt = (period: string, periodPercent: number) => {
		let startTime = Math.round((parseInt(period) * periodPercent) / 100);
		if(startTime < 0){
			startTime = 0;
		}
		if(startTime > parseInt(period)){
			startTime = parseInt(period);
		}
		return startTime;
	};

	const isDisbursalPeriodCardVisible = isTreasuryProposal? (requested? (isTreasuryProposalPresent? (awardedStatusBlock? false: true): false): false): false;

	return (
		<>
			{
				(!decidingStatusBlock) && !isProposalFailed && (
					<GovSidebarCard>
						<div className='flex items-center justify-between'>
							<h3 className='m-0 mr-[69px] text-bodyBlue font-semibold text-xl whitespace-nowrap leading-6 tracking-[0.0015em]'>Prepare Period</h3>
							<div className="flex w-13 h-[33px] gap-1">
								<p className="flex whitespace-nowrap justify-between m-0 pr-2 mt-[1px] pt-[1px] text-lightBlue" style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}>
									<Button className="bg-pink_primary text-center text-xs h-[23px] w-[23px] -ml-[3px] text-white">1</Button>
									<span className="ml-[1px] pt-[3px]">of 3</span>
								</p>
							</div>
						</div>
						<div className='mt-[20px]'>
							<Progress className='m-0 p-0 flex items-center' showInfo={false} percent={prepare.periodPercent} strokeColor='#E5007A'  trailColor='#FEF2F8' size="small" />
						</div>
						<p className='p-0 m-0 flex items-center justify-between mt-5 leading-[22px]'>
							<>
								<span className='text-bodyBlue text-sm text-bodyblue font-normal'>Prepare Period</span>
								<span className='text-lightBlue text-xs'>{periodStartAt(prepare.period, prepare.periodPercent)}/{prepare.period}</span>
							</>
						</p>
					</GovSidebarCard>
				)
			}
			{
				(decidingStatusBlock && !confirmedStatusBlock) && !isProposalFailed && (
					<GovSidebarCard>
						<div className='flex items-center justify-between'>
							<h3 className='m-0 mr-[69px] justify-center whitespace-nowrap text-bodyBlue font-semibold text-xl leading-6 tracking-[0.0015em]'>Voting has Started</h3>
							<div className="flex w-13 h-[33px] gap-1">
								<p className="flex whitespace-nowrap justify-between m-0 pr-2 mt-[1px] pt-[1px] text-lightBlue" style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}>
									<Button className="bg-pink_primary text-center text-xs h-[23px] w-[23px] -ml-[3px] text-white">2</Button>
									<span className="ml-[1px] pt-[3px]">of 3</span>
								</p>
							</div>
						</div>
						<div className='mt-[30px]'>
							<Progress className='m-0 p-0 flex items-center rounded-lg' showInfo={false} percent={decision.periodPercent} strokeColor='#E5007A' trailColor='#FEF2F8' size="small" />
						</div>
						<p className='p-0 m-0 flex items-center justify-between mt-5 leading-[22px]'>
							<span className='text-bodyBlue text-sm font-normal text-bodyblue'>Decision Period</span>
							<span className='text-lightBlue text-xs'>{periodStartAt(decision.period, decision.periodPercent)}/{decision.period}</span>
						</p>
						<div className='mt-[20px]'>
							<Progress className='m-0 p-0 flex items-center' showInfo={false} percent={confirm.periodPercent} strokeColor='#E5007A' trailColor='#FEF2F8' size="small" />
						</div>
						<p className='p-0 m-0 flex items-center justify-between mt-5 leading-[22px]'>
							<>
								<span className='text-bodyBlue text-sm text-bodyblue font-normal'>Confirmation Period</span>
								<span className='text-lightBlue text-xs'>{periodStartAt(confirm.period, confirm.periodPercent)}/{confirm.period}</span>
							</>
						</p>
					</GovSidebarCard>
				)
			}
			{
				isProposalPassed? (
					<>
						{
							(isDisbursalPeriodCardVisible || minEnactment.periodCardVisible)
								? <GovSidebarCard>
									<div className='flex items-center justify-between'>
										<h3 className='m-0 mr-[69px] whitespace-nowrap text-bodyBlue font-semibold text-xl leading-6 tracking-[0.0015em]'>Proposal Passed</h3>
										<div className="flex w-13 h-[33px] gap-1">
											<p className="flex whitespace-nowrap justify-between m-0 pr-2 mt-[1px] pt-[1px] text-lightBlue" style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}>
												<Button className="bg-pink_primary text-center text-xs h-[23px] w-[23px] -ml-[3px] text-white">3</Button>
												<span className="ml-[1px] pt-[3px]">of 3</span>
											</p>
										</div>
									</div>
									<div className='mt-[20px]'>
										<Progress className='m-0 p-0 flex items-center' showInfo={false} percent={minEnactment.periodPercent} strokeColor='#E5007A' trailColor='#FEF2F8' size="small" />
									</div>
									<p className='p-0 m-0 flex items-center justify-between mt-5 leading-[22px]'>
										<span className='text-bodyBlue text-sm text-bodyblue font-normal'>Enactment Period</span>
										<span className='text-lightBlue text-xs'>{periodStartAt(minEnactment.period, minEnactment.periodPercent)}/{minEnactment.period}</span>
									</p>
									{
										isDisbursalPeriodCardVisible && (
											<>
												<div className='mt-[20px]'>
													<Progress className='m-0 p-0 flex items-center' percent={spend.periodPercent} strokeColor='#E5007A' trailColor='#FEF2F8' size="small" />
												</div>
												<p className='p-0 m-0 flex items-center justify-between mt-2 leading-[22px]'>
													<>
														<span className='text-bodyBlue text-sm font-normal'>Funds Disbursal Period</span>
														<span className='text-lightBlue text-xs'>{spend.period}</span>
													</>
												</p>
											</>
										)
									}
								</GovSidebarCard>
								: null
						}
					</>
				): isProposalFailed && (
					<GovSidebarCard>
						<div className='flex items-center justify-between'>
							<h3 className='m-0 text-bodyBlue font-medium text-xl leading-6 tracking-[0.0015em]'>Proposal { status === 'Cancelled'? 'Cancelled': status === 'Killed'? 'Killer': status === 'TimedOut'? 'Timed Out': 'Failed'}</h3>
							<Button>3</Button>
						</div>
						<div className='mt-[18px] text-bodyBlue text-sm font-normal leading-[22px] tracking-[0.01em]'>
							<FailedReferendaText progress={progress} network={network} status={status} timeline={timeline} />
						</div>
					</GovSidebarCard>
				)
			}
			<Modal
				open={open}
				title={<div className='flex items-center justify-between gap-x-5 py-3 px-2'>
					<h3 className='text-bodyBlue font-medium text-xl leading-[24px] tracking-[0.0015em] m-0 p-0'>Status</h3>
					<button onClick={() => setOpen(false)} className='border-none outline-none cursor-pointer bg-transparent flex items-center justify-center'><CloseIcon /></button>
				</div>}
				onCancel={() => setOpen(false)}
				closable={false}
				footer={[]}
			>
				<section className='text-sidebarBlue mt-[24px] pl-[21px]'>
					<article className='flex gap-x-[23px]'>
						<div className='w-[4.5px] h-[150px] bg-[#FCE5F2] rounded-full'>
							<div style={{
								height: `${(Math.min(prepare.periodPercent, 100) / 100) * 150}px`
							}} className='bg-pink_primary rounded-full border-0'>

							</div>
						</div>
						<div>
							<div className='mt-1.5 relative'>
								<span className={`absolute -top-[2px] -left-[37px] w-[26px] h-[26px] font-medium text-base leading-0 flex items-center justify-center rounded-full ${prepare.periodPercent > 0? 'bg-pink_primary text-white': 'bg-[#FFD3EC] text-[#7A8BA1]'}`}>
									1
								</span>
								<span>
									<PreparePeriodIcon className={`${prepare.periodPercent > 0? 'text-pink_primary': 'text-[#FFD3EC]'} text-xl`} />
								</span>
							</div>
							<h4 className='text-base leading-[24px] tracking-[0.01em] font-medium'>Prepare Period</h4>
							<p className='text-sm leading-[21px] tracking-[0.01em]'>The prepare period is used to avoid decision sniping. It occurs before a referendum goes into voting.</p>
						</div>
					</article>
					<article className='flex gap-x-[23px]'>
						<div className='w-[4.5px] h-[300px] md:h-[250px] bg-[#FCE5F2] rounded-full overflow-hidden'>
							<div style={{
								height: `${decidingStatusBlock? (Math.min(decision.periodPercent, 100) / 100) * 300: 0}px`
							}} className='bg-pink_primary rounded-full border-0'>

							</div>
						</div>
						<div>
							<div className='relative'>
								<span className={`absolute -top-[2px] -left-[37px] w-[26px] h-[26px] font-medium text-base leading-0 flex items-center justify-center rounded-full ${decision.periodPercent > 0 && decidingStatusBlock? 'bg-pink_primary text-white': 'bg-[#FFD3EC] text-[#7A8BA1]'}`}>
									2
								</span>
								<span>
									<DecisionPeriodIcon className={`${decision.periodPercent > 0 && decidingStatusBlock? 'text-pink_primary': 'text-[#FFD3EC]'} text-xl`} />
								</span>
							</div>
							<h4 className='text-base leading-[24px] tracking-[0.01em] font-medium'>Voting Period</h4>
							<ul className='text-sm leading-[21px] tracking-[0.01em] px-5'>
								<li>A referendum will be in voting till the decision period is completed or the proposal is passed.</li>
								<li>For a referendum to pass, the support and approval should be greater than the threshold for the track for the confirmation period.</li>
								<li>If the referendum does not pass during the decision period, it is considered as failed.</li>
							</ul>
						</div>
					</article>
					<article className='flex gap-x-[23px]'>
						<div className='w-[3.5px] h-[30px] bg-[#FCE5F2] rounded-full'>
							<div style={{
								height: `${minEnactment.periodPercent > 0? 30: 0}px`
							}} className='bg-pink_primary rounded-full border-0'>

							</div>
						</div>
						<div>
							<div className='relative'>
								<span className={`absolute -top-[2px] -left-[37px] w-[26px] h-[26px] font-medium text-base leading-0 flex items-center justify-center rounded-full ${minEnactment.periodPercent > 0? 'bg-pink_primary text-white': 'bg-[#FFD3EC] text-[#7A8BA1]'}`}>
									3
								</span>
								<span>
									<EnactmentPeriodIcon className={`${minEnactment.periodPercent > 0? 'text-pink_primary': 'text-[#FFD3EC]'} text-xl`} />
								</span>
							</div>
							<h4 className='text-base leading-[24px] tracking-[0.01em] font-medium'>After Voting Period</h4>
							<ul className='text-sm leading-[21px] tracking-[0.01em] m-0 p-0 px-5'>
								<li>A referendum is executed after the completion of the enactment period.
								</li>
								<li>For treasury referenda, the funds will be disbursed after completion of the funds disbursal period.
								</li>
							</ul>
						</div>
					</article>
				</section>
			</Modal>
		</>
	);
};

export default ReferendaV2Messages;

const FailedReferendaText: FC<{ status: string; network: string; timeline?: any[]; progress: IProgress }> = (props) => {
	const { status, timeline, network, progress } = props;
	const url = getBlockLink(network);
	const block = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], status);
	const BlockElement = <a className='text-pink_primary font-medium' href={`${url}${block?.block}`} target='_blank' rel="noreferrer">#{block?.block && block?.block}</a>;
	const isSupportLess = Number(progress.support) < Number(progress.supportThreshold);
	const isApprovalLess = Number(progress.approval) < Number(progress.approvalThreshold);
	return <>
		{
			status === 'Cancelled'?
				<>The proposal has been cancelled at block {BlockElement} via the referendum canceller track</>
				: status === 'Killed'?
					<>The proposal has been killed at block {BlockElement} via the referendum killer track and the deposit was slashed</>
					: status === 'TimedOut'?
						<>The proposal has been timed out as the decision deposit was not placed in due time</>
						: <>
							{
								isSupportLess && isApprovalLess?
									<>
										<p>
											Referendum failed because either of the 2 reasons:
										</p>
										<ul className='pl-5 m-0'>
											<li>The support was lesser than the threshold for this track.</li>
											<li>The approval was lesser than the threshold for this track.</li>
										</ul>
									</>
									: isSupportLess?
										<>The support was lesser than the threshold for this track.</>
										: <>The approval was lesser than the threshold for this track.</>
							}
						</>
		}
	</>;
};
