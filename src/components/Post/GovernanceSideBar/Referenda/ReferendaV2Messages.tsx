// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import BN from 'bn.js';
import dayjs from 'dayjs';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { blocksToRelevantTime, getTrackData } from '~src/components/Listing/Tracks/AboutTrackCard';
import { useApiContext, usePostDataContext } from '~src/context';
import { DecisionPeriodIcon, EnactmentPeriodIcon, PreparePeriodIcon } from '~src/ui-components/CustomIcons';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import { getBlockLink } from '~src/util/subscanCheck';
import { IProgress } from './Curves';
import { IPeriod, ProgressStatusType } from '~src/types';
import { getPeriodData } from '~src/util/getPeriodData';
import { getStatusBlock } from '~src/util/getStatusBlock';
import ConfirmationAttemptsRow from '~src/ui-components/ConfirmationAttemptsRow';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ConfirmMessage from './ConfirmMessage';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import Tooltip from '~src/basic-components/Tooltip';

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
	const {
		postData: { track_name, track_number, created_at, status, timeline, requested }
	} = usePostDataContext();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const trackData = getTrackData(network, track_name, track_number);
	const proposalCreatedAt = dayjs(created_at);
	const [prepare, setPrepare] = useState<IPeriod>(getDefaultPeriod());
	const [decision, setDecision] = useState<IPeriod>(getDefaultPeriod());
	const [confirm, setConfirm] = useState<IPeriod>(getDefaultPeriod());
	const [minEnactment, setMinEnactment] = useState<IPeriod>(getDefaultPeriod());
	const [spend, setSpend] = useState<IPeriod>(getDefaultPeriod());
	const [open, setOpen] = useState(false);
	const [progressBarStatus, setProgressBarStatus] = useState<ProgressStatusType>('active');
	const isTreasuryProposal = trackData.group === 'Treasury';
	const isProposalPassed = ['Executed', 'Confirmed', 'Approved'].includes(status);
	const isProposalFailed = ['Rejected', 'TimedOut', 'Cancelled', 'Killed', 'ExecutionFailed'].includes(status);
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'DecisionDepositPlaced');
	const confirmStartedStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'ConfirmStarted');
	const confirmedStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Confirmed');
	const awardedStatusBlock = getStatusBlock(timeline || [], ['TreasuryProposal'], 'Awarded');
	const isTreasuryProposalPresent = checkProposalPresent(timeline || [], 'TreasuryProposal');

	const Button: FC<IButtonProps> = (props) => {
		const { children, className } = props;
		return (
			<button
				onClick={() => setOpen(true)}
				className={`flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-[#FEF2F8] text-base font-normal leading-[24px] tracking-[0.01em] text-lightBlue outline-none dark:bg-[#E5007A] dark:text-white ${className}`}
			>
				{children}
			</button>
		);
	};

	useEffect(() => {
		if (!trackData) return;

		const prepare = getPeriodData(network, proposalCreatedAt, trackData, 'preparePeriod');
		setPrepare(prepare);

		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackData, 'decisionPeriod');
		setDecision(decision);
		const confirmPeriodEndsAt = confirmStartedStatusBlock && confirmStartedStatusBlock.timestamp ? dayjs(confirmStartedStatusBlock.timestamp) : decision.periodEndsAt;
		const confirm = getPeriodData(network, confirmPeriodEndsAt, trackData, 'confirmPeriod');
		setConfirm(confirm);

		const minEnactmentPeriodStartsAt = confirmedStatusBlock && confirmedStatusBlock.timestamp ? dayjs(confirmedStatusBlock.timestamp) : confirm.periodEndsAt;
		const minEnactment = getPeriodData(network, minEnactmentPeriodStartsAt, trackData, 'minEnactmentPeriod');
		setMinEnactment(minEnactment);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setProgressBarStatus('exception');
		}, 12000);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (isTreasuryProposal) {
			if (!api || !apiReady) return;
			(async () => {
				const currentBlock = await api.derive.chain.bestNumber();
				const spendPeriodConst = api.consts.treasury ? api.consts.treasury.spendPeriod : new BN(0);
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
		if (startTime < 0) {
			startTime = 0;
		}
		if (startTime > parseInt(period)) {
			startTime = parseInt(period);
		}
		return startTime;
	};

	const isDisbursalPeriodCardVisible = isTreasuryProposal ? (requested ? (isTreasuryProposalPresent ? (awardedStatusBlock ? false : true) : false) : false) : false;

	return (
		<>
			{!decidingStatusBlock && !isProposalFailed && (
				<GovSidebarCard>
					<div className='flex items-center justify-between'>
						<h3 className='m-0 w-full whitespace-nowrap text-xl font-semibold leading-6 tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Prepare Period</h3>
						<div className='w-13 flex h-[33px] gap-1'>
							<p
								className='m-0 mt-[1px] flex justify-between whitespace-nowrap pr-2 pt-[1px] text-lightBlue dark:text-blue-dark-medium'
								style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}
							>
								<Button className='-ml-[3px] h-[23px] w-[23px] bg-pink_primary text-center text-xs text-white'>1</Button>
								<span className='ml-[4px] pt-[3px]'>of 3</span>
							</p>
						</div>
					</div>
					<div className='mt-[20px]'>
						<ProgressBar
							className='m-0 flex items-center p-0'
							showInfo={false}
							percent={prepare.periodPercent}
							strokeColor='#E5007A'
							size='small'
							trailColor={theme === 'dark' ? '#222222' : '#FEF2F8'}
						/>
					</div>
					<p className='m-0 mt-5 flex items-center justify-between p-0 leading-[22px]'>
						<>
							<div className='flex gap-1'>
								<span className='text-bodyblue text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>Prepare Period</span>
								<Tooltip
									color='#E5007A'
									title='Minimum waiting time for a referendum to proceed from submission into decision period.'
								>
									<InfoCircleOutlined className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium' />
								</Tooltip>
							</div>
							<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>
								{periodStartAt(prepare.period, prepare.periodPercent)}/{prepare.period}
							</span>
						</>
					</p>
					<ConfirmationAttemptsRow timeline={timeline || []} />
				</GovSidebarCard>
			)}

			{decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
				<GovSidebarCard>
					<div className='flex items-center justify-between'>
						<h3 className='m-0 w-full justify-center whitespace-nowrap text-xl font-semibold leading-6 tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>
							Voting has Started
						</h3>
						<div className='w-13 flex h-[33px] gap-1'>
							<p
								className='m-0 mt-[1px] flex justify-between whitespace-nowrap pr-2 pt-[1px] text-lightBlue dark:text-blue-dark-medium'
								style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}
							>
								<Button className='-ml-[3px] mr-[2px] h-[23px] w-[23px] bg-pink_primary text-center text-xs text-white hover:border-pink_primary  hover:bg-pink_secondary'>
									2
								</Button>
								<span className='ml-[4px] pt-[3px]'>of 3</span>
							</p>
						</div>
					</div>
					<div className='mt-[22px]'>
						<ProgressBar
							className='m-0 flex items-center rounded-lg p-0'
							showInfo={false}
							status={progressBarStatus}
							percent={decision?.periodPercent}
							strokeColor='#E5007A'
							trailColor={theme === 'dark' ? '#222222' : '#FEF2F8'}
							size='small'
						/>
					</div>
					<p className='m-0 mt-5 flex items-center justify-between p-0 leading-[22px]'>
						<div className='flex gap-1'>
							<span className='text-bodyblue text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>Decision Period</span>
							<Tooltip
								color='#E5007A'
								title='Amount of time a proposal may take to be approved. If the proposal is not approved by the end of the decision period, it gets rejected.'
							>
								<InfoCircleOutlined className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium' />
							</Tooltip>
						</div>
						<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>
							{periodStartAt(decision?.period, decision?.periodPercent)}/{decision?.period}
						</span>
					</p>
					<div className='mt-[20px]'>
						<ProgressBar
							className='m-0 flex items-center p-0'
							showInfo={false}
							percent={confirm.periodPercent}
							strokeColor='#E5007A'
							trailColor={theme === 'dark' ? '#222222' : '#FEF2F8'}
							size='small'
						/>
					</div>
					<p className='m-0 mt-5 flex items-center justify-between p-0 leading-[22px]'>
						<>
							<div className='flex gap-1'>
								<span className='text-bodyblue text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>Confirmation Period</span>
								<Tooltip
									color='#E5007A'
									title='Total time the referenda must meet both the min approval and support criteria during the decision period in order to pass'
								>
									<InfoCircleOutlined className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium' />
								</Tooltip>
							</div>
							<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>
								{periodStartAt(confirm?.period, confirm?.periodPercent)}/{confirm?.period}
							</span>
						</>
					</p>
					<ConfirmationAttemptsRow timeline={timeline || []} />
					<ConfirmMessage />
				</GovSidebarCard>
			)}
			{isProposalPassed ? (
				<>
					{isDisbursalPeriodCardVisible || minEnactment.periodCardVisible ? (
						<GovSidebarCard>
							<div className='flex items-center justify-between'>
								<h3 className='m-0 w-full whitespace-nowrap text-xl font-semibold leading-6 tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Proposal Passed</h3>
								<div className='w-13 flex h-[33px] gap-1'>
									<p
										className='m-0 mt-[1px] flex justify-between whitespace-nowrap pr-2 pt-[1px] text-lightBlue dark:text-blue-dark-medium'
										style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}
									>
										<Button className='-ml-[3px] h-[23px] w-[23px] bg-pink_primary text-center text-xs text-white'>3</Button>
										<span className='ml-[4px] pt-[3px]'>of 3</span>
									</p>
								</div>
							</div>
							<div className='mt-[20px]'>
								<ProgressBar
									className='m-0 flex items-center p-0'
									showInfo={false}
									percent={minEnactment.periodPercent}
									strokeColor='#E5007A'
									trailColor={theme === 'dark' ? '#222222' : '#FEF2F8'}
									size='small'
								/>
							</div>
							<p className='m-0 mt-5 flex items-center justify-between p-0 leading-[22px]'>
								<div className='flex gap-1'>
									<span className='text-bodyblue text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>Enactment Period</span>
									<Tooltip
										color='#E5007A'
										title='Time that the proposal must be in dispatch queue after approval.'
									>
										<InfoCircleOutlined className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium' />
									</Tooltip>
								</div>
								<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>
									{periodStartAt(minEnactment.period, minEnactment.periodPercent)}/{minEnactment.period}
								</span>
							</p>
							{isDisbursalPeriodCardVisible && !!spend?.period ? (
								<>
									<div className='mt-[20px]'>
										<ProgressBar
											className='m-0 flex items-center p-0'
											percent={spend.periodPercent}
											strokeColor='#E5007A'
											trailColor={theme === 'dark' ? '#222222' : '#FEF2F8'}
											size='small'
											showInfo={false}
										/>
									</div>
									<p className='m-0 mt-5 flex items-center justify-between p-0 leading-[22px]'>
										<>
											<div className='flex gap-1'>
												<span className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>Funds Disbursal Period</span>
												<Tooltip
													color='#E5007A'
													title='Funds will be automatically dispatched to the beneficiary at the spend periods end.'
												>
													<InfoCircleOutlined className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium' />
												</Tooltip>
											</div>

											<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>
												{periodStartAt(spend.period, spend.periodPercent)}/{spend.period}
											</span>
										</>
									</p>
								</>
							) : null}
							<ConfirmationAttemptsRow timeline={timeline || []} />
						</GovSidebarCard>
					) : (
						<GovSidebarCard>
							<div className='flex items-center justify-between'>
								<h3 className='m-0 w-full whitespace-nowrap text-xl font-semibold leading-6 tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Proposal Passed</h3>
								<div className='w-13 flex h-[33px] gap-1'>
									<p
										className='m-0 mt-[1px] flex justify-between whitespace-nowrap pr-2 pt-[1px] text-lightBlue dark:text-blue-dark-medium'
										style={{ background: 'rgba(210, 216, 224, 0.19)', borderRadius: '15px' }}
									>
										<Button className='-ml-[3px] h-[23px] w-[23px] bg-pink_primary text-center text-xs text-white'>3</Button>
										<span className='ml-[4px] pt-[3px]'>of 3</span>
									</p>
								</div>
							</div>
							<ConfirmationAttemptsRow timeline={timeline || []} />
						</GovSidebarCard>
					)}
				</>
			) : (
				isProposalFailed && (
					<GovSidebarCard>
						<div className='flex items-center justify-between'>
							<h3 className='m-0 text-xl font-medium leading-6 tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>
								Proposal {status === 'Cancelled' ? 'Cancelled' : status === 'Killed' ? 'Killer' : status === 'TimedOut' ? 'Timed Out' : 'Failed'}
							</h3>
							<Button>3</Button>
						</div>
						<div className='mt-[18px] text-sm font-normal leading-[22px] tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high'>
							<FailedReferendaText
								progress={progress}
								network={network}
								status={status}
								timeline={timeline}
							/>
						</div>
						<ConfirmationAttemptsRow timeline={timeline || []} />
					</GovSidebarCard>
				)
			)}

			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				open={open}
				title={
					<div className='flex items-center justify-between gap-x-5 px-2 py-3 dark:bg-section-dark-overlay'>
						<h3 className='m-0 p-0 text-xl font-medium leading-[24px] tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Status</h3>
						<button
							onClick={() => setOpen(false)}
							className='flex cursor-pointer items-center justify-center border-none bg-transparent outline-none'
						>
							<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />
						</button>
					</div>
				}
				onCancel={() => setOpen(false)}
				closable={false}
				footer={[]}
				className={'dark:[&>.ant-modal-content]:bg-section-dark-overlay'}
			>
				<section className='mt-[24px] pl-[21px] text-sidebarBlue dark:text-white'>
					<article className='flex gap-x-[23px]'>
						<div className='h-[150px] w-[4.5px] rounded-full bg-[#FCE5F2]'>
							<div
								style={{
									height: `${(Math.min(prepare.periodPercent, 100) / 100) * 150}px`
								}}
								className='rounded-full border-0 bg-pink_primary'
							></div>
						</div>
						<div>
							<div className='relative mt-1.5'>
								<span
									className={`leading-0 absolute -left-[37px] -top-[2px] flex h-[26px] w-[26px] items-center justify-center rounded-full text-base font-medium ${
										prepare.periodPercent > 0 ? 'bg-pink_primary text-white' : 'bg-[#FFD3EC] text-[#7A8BA1]'
									}`}
								>
									1
								</span>
								<span className='flex items-center gap-x-2'>
									<PreparePeriodIcon className={`${prepare.periodPercent > 0 ? 'text-pink_primary' : 'text-[#FFD3EC]'} text-xl`} />
									<h4 className='text-base font-medium leading-[24px] tracking-[0.01em]'>Prepare Period</h4>
								</span>
							</div>
							<p className='text-sm leading-[21px] tracking-[0.01em]'>The prepare period is used to avoid decision sniping. It occurs before a referendum goes into voting.</p>
						</div>
					</article>
					<article className='flex gap-x-[23px]'>
						<div className='h-[300px] w-[4.5px] overflow-hidden rounded-full bg-[#FCE5F2] md:h-[310px]'>
							<div
								style={{
									height: `${decidingStatusBlock ? (Math.min(decision.periodPercent, 100) / 100) * 300 : 0}px`
								}}
								className='rounded-full border-0 bg-pink_primary'
							></div>
						</div>
						<div>
							<div className='relative'>
								<span
									className={`leading-0 absolute -left-[37px] -top-[2px] flex h-[26px] w-[26px] items-center justify-center rounded-full text-base font-medium ${
										decision.periodPercent > 0 && decidingStatusBlock ? 'bg-pink_primary text-white' : 'bg-[#FFD3EC] text-[#7A8BA1]'
									}`}
								>
									2
								</span>
								<span className='flex items-center gap-x-2'>
									<DecisionPeriodIcon className={`${decision.periodPercent > 0 && decidingStatusBlock ? 'text-pink_primary' : 'text-[#FFD3EC]'} text-xl`} />
									<h4 className='mt-2 text-base font-medium leading-[24px] tracking-[0.01em]'>Voting Period</h4>
								</span>
							</div>
							<ul className='px-5 text-sm leading-[21px] tracking-[0.01em]'>
								<li>A referendum will be in voting till the decision period is completed or the proposal is passed.</li>
								<li>For a referendum to enter confirmation, the support and approval should be greater than the threshold for the track.</li>
								<li>
									Once the proposal enters confirmation, its support and approval should remain greater than the threshold for the duration of the confirmation period for it to
									pass.
								</li>
								<li>If the referendum does not enter confirmation during the decision period, it is considered as failed.</li>
							</ul>
						</div>
					</article>
					<article className='flex gap-x-[23px]'>
						<div className='h-[30px] w-[3.5px] rounded-full bg-[#FCE5F2]'>
							<div
								style={{
									height: `${minEnactment.periodPercent > 0 ? 30 : 0}px`
								}}
								className='rounded-full border-0 bg-pink_primary'
							></div>
						</div>
						<div>
							<div className='relative'>
								<span
									className={`leading-0 absolute -left-[37px] -top-[2px] flex h-[26px] w-[26px] items-center justify-center rounded-full text-base font-medium ${
										minEnactment.periodPercent > 0 ? 'bg-pink_primary text-white' : 'bg-[#FFD3EC] text-[#7A8BA1]'
									}`}
								>
									3
								</span>
								<div></div>
								<span className='flex items-center gap-x-2'>
									<EnactmentPeriodIcon className={`${minEnactment.periodPercent > 0 ? 'text-pink_primary' : 'text-[#FFD3EC]'} text-xl`} />
									<h4 className='mt-2 text-base font-medium leading-[24px] tracking-[0.01em]'>After Voting Period</h4>
								</span>
							</div>
							<ul className='m-0 p-0 px-5 text-sm leading-[21px] tracking-[0.01em]'>
								<li>A referendum is executed after the completion of the enactment period.</li>
								<li>For treasury referenda, the funds will be disbursed after completion of the funds disbursal period.</li>
							</ul>
						</div>
					</article>
				</section>
			</Modal>
		</>
	);
};

export default styled(ReferendaV2Messages)`
	.ant-modal .ant-modal-header {
		background-color: ${({ theme }: { theme: any }) => (theme === 'dark' ? '#1E1E1E' : '#fff')};
	}
`;

const FailedReferendaText: FC<{ status: string; network: string; timeline?: any[]; progress: IProgress }> = (props) => {
	const { status, timeline, network, progress } = props;
	const url = getBlockLink(network);
	const block = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], status);
	const BlockElement = (
		<a
			className='font-medium text-pink_primary'
			href={`${url}${block?.block}`}
			target='_blank'
			rel='noreferrer'
		>
			#{block?.block && block?.block}
		</a>
	);

	const isSupportLess = Number(progress.support) < Number(progress.supportThreshold);
	const isApprovalLess = Number(progress.approval) < Number(progress.approvalThreshold);

	return (
		<>
			{status === 'Cancelled' ? (
				<>The proposal has been cancelled at block {BlockElement} via the referendum canceller track</>
			) : status === 'Killed' ? (
				<>The proposal has been killed at block {BlockElement} via the referendum killer track and the deposit was slashed</>
			) : status === 'TimedOut' ? (
				<>The proposal has been timed out as the decision deposit was not placed in due time</>
			) : (
				<>
					{isSupportLess && isApprovalLess ? (
						<>
							<p>Referendum failed because either of the 2 reasons:</p>
							<ul className='m-0 pl-5'>
								<li>The support was lesser than the threshold for this track.</li>
								<li>The approval was lesser than the threshold for this track.</li>
							</ul>
						</>
					) : isSupportLess ? (
						<>The support was lesser than the threshold for this track.</>
					) : (
						<>The approval was lesser than the threshold for this track.</>
					)}
				</>
			)}
		</>
	);
};
