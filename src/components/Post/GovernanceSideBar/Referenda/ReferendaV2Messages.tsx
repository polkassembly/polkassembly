// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Progress } from 'antd';
import BN from 'bn.js';
import dayjs, { Dayjs } from 'dayjs';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import styled from 'styled-components';
import { blocksToRelevantTime, getTrackData } from '~src/components/Listing/Tracks/AboutTrackCard';
import { useApiContext, useNetworkContext, usePostDataContext } from '~src/context';
import { DecisionPeriodIcon, EnactmentPeriodIcon, PreparePeriodIcon } from '~src/ui-components/CustomIcons';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';

interface IReferendaV2Messages {
    className?: string;
}

interface IButtonProps extends PropsWithChildren {}

const getPeriodData = (network: string, date: Dayjs, trackData: any, fieldKey: string) => {
	const period = blocksToRelevantTime(network, Number(trackData[fieldKey]));
	let periodEndsAt = date.clone();
	let periodPercent = 0;
	if (period) {
		if (period.includes('hrs')) {
			periodEndsAt = periodEndsAt.add(Number(period.split(' ')[0]), 'hour');
		} else if (period.includes('days')) {
			periodEndsAt = periodEndsAt.add(Number(period.split(' ')[0]), 'day');
		} else if (period.includes('min')) {
			periodEndsAt = periodEndsAt.add(Number(period.split(' ')[0]), 'minute');
		}
		periodPercent = Math.round(dayjs().diff(date, 'minute') / periodEndsAt.diff(date, 'minute') * 100);
	}
	const periodCardVisible = periodEndsAt.diff(dayjs(), 'second') > 0;
	return {
		period,
		periodCardVisible,
		periodEndsAt,
		periodPercent
	};
};

interface IPeriod {
	period: string;
	periodCardVisible: boolean;
	periodEndsAt: dayjs.Dayjs;
	periodPercent: number;
}

const getDefaultPeriod = () => {
	return {
		period: '',
		periodCardVisible: false,
		periodEndsAt: dayjs(),
		periodPercent: 0
	};
};

const getDecidingStatusBlock = (timeline?: any[]) => {
	let deciding: any;
	if (timeline && Array.isArray(timeline)) {
		timeline.some((v) => {
			if (v && v.statuses && Array.isArray(v.statuses)) {
				let isFind = false;
				v.statuses.some((v: any) => {
					if (v && v.status === 'Deciding') {
						isFind = true;
						deciding = v;
					}
				});
				return isFind;
			}
			return false;
		});
	}
	return deciding;
};

const ReferendaV2Messages: FC<IReferendaV2Messages> = () => {
	const { postData: { track_name, track_number, created_at, status, timeline } } = usePostDataContext();
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
	const isProposalFailed = ['Rejected', 'TimedOut', 'Cancelled'].includes(status);
	const decidingStatusBlock = getDecidingStatusBlock(timeline);

	const Button: FC<IButtonProps> = (props) => {
		const { children } = props;
		return (
			<button onClick={() => setOpen(true)} className='cursor-pointer flex items-center justify-center border-none outline-none bg-[#FCE5F2] w-[30px] h-[30px] rounded-full'>
				{children}
			</button>
		);
	};

	useEffect(() => {
		if (!trackData) return;
		const prepare = getPeriodData(network, proposalCreatedAt, trackData, 'preparePeriod');
		setPrepare(prepare);
		const preparePeriodEndsAt = ((decidingStatusBlock && decidingStatusBlock.timestamp)? dayjs(decidingStatusBlock.timestamp): prepare.periodEndsAt);
		const decision = getPeriodData(network, preparePeriodEndsAt, trackData, 'decisionPeriod');
		setDecision(decision);
		const confirm = getPeriodData(network, decision.periodEndsAt, trackData, 'confirmPeriod');
		setConfirm(confirm);
		const minEnactment = getPeriodData(network, confirm.periodEndsAt, trackData, 'minEnactmentPeriod');
		setMinEnactment(minEnactment);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (isTreasuryProposal) {
			if (!api || !apiReady) return;
			const spendPeriodConst = api.consts.treasury? api.consts.treasury.spendPeriod : new BN(0);
			(trackData as any).spendPeriod = spendPeriodConst.toNumber();
			const spend = getPeriodData(network, confirm.periodEndsAt, trackData, 'spendPeriod');
			setSpend(spend);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network]);

	if (!prepare.periodCardVisible && !decision.periodCardVisible && !confirm.periodCardVisible && !minEnactment.periodCardVisible && (isTreasuryProposal? !spend.periodCardVisible: isProposalPassed)) return null;
	return (
		<GovSidebarCard>
			{
				(prepare.periodCardVisible || !decidingStatusBlock) && !isProposalFailed && (
					<article className='py-6'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sidebarBlue font-semibold text-xl leading-6 tracking-[0.0015em]'>Prepare Period</h3>
							<Button>1</Button>
						</div>
						<div className='mt-[20px]'>
							<Progress className='m-0 p-0 flex items-center' percent={prepare.periodPercent} strokeColor='#E5007A' size="small" />
						</div>
						<p className='p-0 m-0 flex items-center justify-between mt-2 font-medium text-sm leading-[22px]'>
							<span className='text-sidebarBlue'>Prepare Period</span>
							<span className='text-navBlue'>{prepare.period}</span>
						</p>
					</article>
				)
			}
			{
				(confirm.periodCardVisible && decidingStatusBlock) && !isProposalFailed && (
					<article className='py-6'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sidebarBlue font-semibold text-xl leading-6 tracking-[0.0015em]'>Voting has Started</h3>
							<Button>2</Button>
						</div>
						<div className='mt-[20px]'>
							<Progress className='m-0 p-0 flex items-center' percent={decision.periodPercent} strokeColor='#E5007A' size="small" />
						</div>
						<p className='p-0 m-0 flex items-center justify-between mt-2 font-medium text-sm leading-[22px]'>
							<span className='text-sidebarBlue'>Decision Period</span>
							<span className='text-navBlue'>{decision.period}</span>
						</p>
						<div className='mt-[20px]'>
							<Progress className='m-0 p-0 flex items-center' percent={confirm.periodPercent} strokeColor='#E5007A' size="small" />
						</div>
						<p className='p-0 m-0 flex items-center justify-between mt-2 font-medium text-sm leading-[22px]'>
							<span className='text-sidebarBlue'>Confirmation Period</span>
							<span className='text-navBlue'>{confirm.period}</span>
						</p>
					</article>
				)
			}
			{
				!prepare.periodCardVisible && !confirm.periodCardVisible && (
					<>
						{
							isProposalPassed? (
								<>
									<article className='py-6'>
										<div className='flex items-center justify-between'>
											<h3 className='text-sidebarBlue font-semibold text-xl leading-6 tracking-[0.0015em]'>Proposal Passed</h3>
											<Button>3</Button>
										</div>
										<div className='mt-[20px]'>
											<Progress className='m-0 p-0 flex items-center' percent={minEnactment.periodPercent} strokeColor='#E5007A' size="small" />
										</div>
										<p className='p-0 m-0 flex items-center justify-between mt-2 font-medium text-sm leading-[22px]'>
											<span className='text-sidebarBlue'>Enactment Period</span>
											<span className='text-navBlue'>{minEnactment.period}</span>
										</p>
										{
											isTreasuryProposal && (
												<>
													<div className='mt-[20px]'>
														<Progress className='m-0 p-0 flex items-center' percent={spend.periodPercent} strokeColor='#E5007A' size="small" />
													</div>
													<p className='p-0 m-0 flex items-center justify-between mt-2 font-medium text-sm leading-[22px]'>
														<span className='text-sidebarBlue'>Funds Disbursal Period</span>
														<span className='text-navBlue'>{spend.period}</span>
													</p>
												</>
											)
										}
									</article>
								</>
							): (
								<>
									<article className='py-6'>
										<div className='flex items-center justify-between'>
											<h3 className='text-sidebarBlue font-semibold text-xl leading-6 tracking-[0.0015em]'>Proposal Failed</h3>
											<Button>3</Button>
										</div>
										<div className='mt-[20px] text-sidebarBlue text-sm font-normal leading-[21px] tracking-[0.01em]'>
											<p>
                                                Referendum failed because either of the 2 reasons:
											</p>
											<ul className='pl-5 m-0'>
												<li>The support was lesser than the threshold for this track.</li>
												<li>The approval was lesser than the threshold for this track.</li>
											</ul>
										</div>
									</article>
								</>
							)
						}
					</>
				)
			}
			<Modal
				open={open}
				title={<h3 className='text-sidebarBlue font-semibold text-xl leading-[24px] tracking-[0.0015em]'>Status</h3>}
				onCancel={() => setOpen(false)}
				footer={[]}
			>
				<section className='text-sidebarBlue mt-[30px]'>
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
		</GovSidebarCard>
	);
};

export default styled(ReferendaV2Messages)``;