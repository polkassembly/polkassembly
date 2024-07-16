// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, Spin } from 'antd';
import { LoadingOutlined, InfoCircleOutlined, LikeFilled } from '@ant-design/icons';
import BN from 'bn.js';
import React, { FC, useCallback, useEffect, useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import VoteProgress from 'src/ui-components/VoteProgress';
import formatBnBalance from 'src/util/formatBnBalance';
import { useApiContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { CastVoteIcon, CloseIcon, ConvictionPeriodIcon, LikeDislikeIcon, RightArrowIcon, VoteAmountIcon } from '~src/ui-components/CustomIcons';
import PassingInfoTag from '~src/ui-components/PassingInfoTag';
import DefaultProfile from '~assets/icons/dashboard-profile.svg';
import { poppins } from 'pages/_app';
import { useNetworkSelector } from '~src/redux/selectors';
import styled from 'styled-components';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IVotesCount } from '~src/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import _ from 'lodash';

interface IReferendumV2VoteInfoProps {
	className?: string;
	tally?: any;
	ayeNayAbstainCounts: IVotesCount;
	setAyeNayAbstainCounts: (pre: IVotesCount) => void;
	setUpdatetally: (pre: boolean) => void;
	updateTally: boolean;
}

const ZERO = new BN(0);

const ReferendumV2VoteInfo: FC<IReferendumV2VoteInfoProps> = ({ className, tally, ayeNayAbstainCounts, setAyeNayAbstainCounts, setUpdatetally, updateTally }) => {
	const { network } = useNetworkSelector();
	const {
		postData: { status, postIndex, postType }
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

	const handleAyeNayCount = async () => {
		setIsLoading(true);

		const { data, error } = await nextApiClientFetch<{ aye: { totalCount: number }; nay: { totalCount: number }; abstain: { totalCount: number } }>(
			'/api/v1/votes/ayeNayTotalCount',
			{
				postId: postIndex,
				proposalType: getSubsquidLikeProposalType(ProposalType.REFERENDUM_V2)
			}
		);
		if (data) {
			setAyeNayAbstainCounts({ abstain: data?.abstain?.totalCount, ayes: data?.aye?.totalCount, nays: data?.nay?.totalCount });
			setIsLoading(false);
		} else {
			console.log(error);
			setIsLoading(false);
		}
	};

	const handleTallyData = async (tally: any) => {
		if (!api || !apiReady) return;
		if (['confirmed', 'executed', 'timedout', 'cancelled', 'rejected', 'executionfailed'].includes(status.toLowerCase())) {
			setTallyData({
				ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
				nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0),
				support: String(tally?.support).startsWith('0x') ? new BN(tally?.support || 0, 'hex') : new BN(tally?.support || 0)
			});
			setIsLoading(false);
			return;
		}
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
		setIsLoading(false);
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			if (network === 'picasso') {
				const totalIssuance = await api.query.openGovBalances.totalIssuance();
				const inactiveIssuance = await api.query.openGovBalances.inactiveIssuance();
				setActiveIssuance((totalIssuance as any).sub(inactiveIssuance));
			} else {
				const totalIssuance = await api.query.balances.totalIssuance();
				const inactiveIssuance = await api.query.balances.inactiveIssuance();
				setActiveIssuance(totalIssuance.sub(inactiveIssuance) as any);
			}
		})();

		handleTallyData(tally);
		setIsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, api, apiReady, network]);

	useEffect(() => {
		handleAyeNayCount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postIndex]);

	const handleSummaryReload = async () => {
		setIsLoading(true);
		const { data, error } = await nextApiClientFetch<{
			tally: {
				ayes: string;
				nays: string;
				support: string;
				bareAyes: string;
			};
		}>('/api/v1/getTallyVotesData', {
			postId: postIndex,
			proposalType: postType
		});

		if (data) {
			handleTallyData(data?.tally);
		} else if (error) {
			console.log(error);
		}
		setUpdatetally(false);
		setIsLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceTallyData = useCallback(_.debounce(handleSummaryReload, 10000), [updateTally]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceAyeNayCount = useCallback(_.debounce(handleAyeNayCount, 10000), [updateTally]);

	useEffect(() => {
		if (!updateTally) return;
		setIsLoading(true);
		handleDebounceTallyData();
		handleDebounceAyeNayCount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateTally]);

	return (
		<>
			<GovSidebarCard className={className}>
				<div className='relative z-50 flex items-center justify-between'>
					<h6 className='m-0 p-0 text-xl font-medium leading-6 text-bodyBlue dark:text-blue-dark-high'>Summary</h6>
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
					<section className='-mt-4 grid grid-cols-2 gap-x-7 gap-y-3 text-lightBlue dark:text-blue-dark-medium'>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex items-center gap-x-1'>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] dark:font-normal dark:text-white'>Ayes({ayeNayAbstainCounts.ayes})</span>
							</div>
							<div className='text-xs font-medium leading-[22px] text-navBlue dark:text-blue-dark-medium'>
								{formatUSDWithUnits(formatBnBalance(tallyData.ayes, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
							</div>
						</article>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex items-center gap-x-1'>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] dark:text-white'>Nays({ayeNayAbstainCounts.nays})</span>
							</div>
							<div className='text-xs font-medium leading-[22px] text-navBlue dark:text-blue-dark-medium'>
								{formatUSDWithUnits(formatBnBalance(tallyData.nays, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
							</div>
						</article>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex items-center gap-x-1'>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] dark:text-white'>Support</span>
							</div>
							<div className='text-xs font-medium leading-[22px] text-navBlue dark:text-blue-dark-medium'>
								{formatUSDWithUnits(formatBnBalance(tallyData.support, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
							</div>
						</article>
						{activeIssuance ? (
							<article className='flex items-center justify-between gap-x-2'>
								<div className='flex items-center gap-x-1'>
									<span className='text-xs font-medium leading-[18px] tracking-[0.01em] dark:text-white'>Issuance</span>
								</div>
								<div className='text-xs font-medium leading-[22px] text-navBlue dark:text-blue-dark-medium'>
									{formatUSDWithUnits(formatBnBalance(activeIssuance, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
								</div>
							</article>
						) : null}
					</section>
					<Modal
						wrapClassName='dark:bg-modalOverlayDark'
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
									<CustomButton
										text='Got it!'
										variant='primary'
										buttonsize='xs'
										onClick={() => setVoteCalculationModalOpen(false)}
										className='gap-10 px-4 py-1'
									/>
								</div>
							</div>
						]}
						className={`${poppins.variable} ${poppins.className} w-[584px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
						closeIcon={<CloseIcon className='mt-2.5 text-lightBlue dark:text-icon-dark-inactive' />}
						title={
							<div
								className={`${poppins.variable} ${poppins.className} text-xl font-semibold leading-[30px] tracking-[0.01em] text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
							>
								<InfoCircleOutlined className='mr-2 h-6 w-6' />
								<span className='font-semibold dark:text-white'>How are votes calculated</span>
							</div>
						}
					>
						<section className='flex flex-col gap-y-6'>
							<div
								className='-mx-6 mt-3'
								style={{ borderTop: '1px solid #E1E6EB' }}
							>
								<p className='m-0 mt-5 p-0 px-6 text-sm font-normal leading-[18px] text-bodyBlue dark:text-blue-dark-high'>
									Votes are calculated by multiplying the votes casted by a user with the conviction period.
								</p>
							</div>

							<article className='my-2 flex items-center justify-between md:gap-x-2'>
								<div className='flex flex-col items-center justify-center gap-y-3'>
									<CastVoteIcon className='text-4xl' />
									<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue dark:text-blue-dark-high'>
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
									<p className='m-0 hidden flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue dark:text-blue-dark-high md:flex'>
										<span className='whitespace-nowrap'>Chooses vote amount</span>
										<span>and type (Aye/Nay)</span>
									</p>
									<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue dark:text-blue-dark-high md:hidden'>
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
									<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue dark:text-blue-dark-high'>
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
									<p className='m-0 hidden flex-col items-center p-0 text-xs font-normal leading-4 text-bodyBlue dark:text-blue-dark-high md:flex'>
										<span className='whitespace-nowrap'>User casts their</span>
										<span>vote</span>
									</p>
									<p className='m-0 flex flex-col items-center p-0 text-xs font-normal leading-4 text-sidebarBlue dark:text-blue-dark-high md:hidden'>
										<span className='whitespace-nowrap'>User</span>
										<span>casts</span>
										<span className='whitespace-nowrap'>their vote</span>
									</p>
								</div>
							</article>
							<div className='flex flex-col'>
								<div style={{ borderTop: '1.5px dashed #D2D8E0' }}>
									<p className='m-0 mt-5 p-0 text-sm font-medium leading-[18px] text-bodyBlue dark:text-blue-dark-high'>Here,</p>
								</div>
								<article
									className='mt-[12px] flex max-w-[400px] items-start justify-between rounded-lg p-3'
									style={{ backgroundColor: 'rgba(216, 185, 202, 0.19);', boxShadow: '0px 4px 19px 0px rgba(216, 185, 202, 0.19)' }}
								>
									<div className='flex flex-col items-center justify-center'>
										<p className='m-0 mt-[2px] flex flex-col p-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
											<p className='font-semibold leading-3'>Voter</p>
											<div className='flex items-center justify-start leading-6'>
												<DefaultProfile style={{ height: '20px', width: '20px' }} />
												<p className='ml-2 mt-2 text-xs text-navBlue'>DDUX..c..</p>
											</div>
										</p>
									</div>
									<div className='flex flex-col items-center justify-center '>
										<p className='m-0 flex flex-col p-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
											<p className='font-semibold leading-5'>Amount</p>
											<span className='item-start text-xs leading-6 text-navBlue'>11.27 KSM</span>
										</p>
									</div>
									<div className='flex flex-col items-center justify-center '>
										<p className='m-0 flex flex-col p-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
											<p className='font-semibold leading-5'>Conviction</p>
											<span className='text-xs leading-6 text-navBlue'>4x</span>
										</p>
									</div>
									<div className='flex flex-col items-center justify-center '>
										<p className='m-0 flex flex-col p-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
											<p className='font-semibold leading-5'>Vote</p>
											<LikeFilled
												className='text-xl leading-6'
												style={{ color: '#2ED47A' }}
											/>
										</p>
									</div>
								</article>
							</div>
							<p className='m-0 p-0 text-sm font-normal leading-4 text-sidebarBlue dark:text-white'>
								The vote will be calculated by multiplying <span className='text-pink_primary'>11.27 KSM (amount)*4 (conviction)</span> to get the final vote.
							</p>
							<div
								className='mb-1'
								style={{ borderTop: '1.5px dashed #D2D8E0' }}
							>
								<p className='m-0 mt-5 p-0 text-sm font-normal leading-4 text-sidebarBlue dark:text-blue-dark-high'>
									<span className='font-semibold'>NOTE: </span>
									Tokens get locked only if a referendum passes here
								</p>
							</div>
						</section>
					</Modal>
				</Spin>
			</GovSidebarCard>
		</>
	);
};

export default styled(React.memo(ReferendumV2VoteInfo))`
	.ant-modal .ant-modal-header {
		background-color: ${({ theme }: { theme: any }) => (theme === 'dark' ? '#1E1E1E' : '#F5F7FF')} !important;
	}
`;
