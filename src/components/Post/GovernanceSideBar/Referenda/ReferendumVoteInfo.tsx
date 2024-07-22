// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import BN from 'bn.js';
import React, { FC, memo, useContext, useEffect, useMemo, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { subscanApiHeaders } from 'src/global/apiHeaders';
import { useFetch } from 'src/hooks';
import { getFailingThreshold } from 'src/polkassemblyutils';
import { IVotesCount, LoadingStatusType, VoteInfo } from 'src/types';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import Loader from 'src/ui-components/Loader';
import PassingInfoTag from 'src/ui-components/PassingInfoTag';
import VoteProgress from 'src/ui-components/VoteProgress';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { isSubscanSupport } from 'src/util/subscanCheck';
import { chainProperties } from '~src/global/networkConstants';
import { VotingHistoryIcon } from '~src/ui-components/CustomIcons';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProposalType, getSubsquidLikeProposalType } from '~src/global/proposalType';
interface IReferendumVoteInfoProps {
	className?: string;
	referendumId: number;
	setOpen: (value: React.SetStateAction<boolean>) => void;
	voteThreshold?: string;
	ayeNayCounts: IVotesCount;
	setAyeNayCounts: (pre: IVotesCount) => void;
}

const ZERO = new BN(0);

const ReferendumVoteInfo: FC<IReferendumVoteInfoProps> = ({ referendumId, setOpen, voteThreshold, ayeNayCounts, setAyeNayCounts }) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useContext(ApiContext);
	const [totalIssuance, setTotalIssuance] = useState<BN | null>(null);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message: 'Loading votes' });
	const [voteInfo, setVoteInfo] = useState<VoteInfo | null>(null);
	const [isFetchingCereVoteInfo, setIsFetchingCereVoteInfo] = useState(true);

	const { data: voteInfoData, error: voteInfoError } = useFetch<any>(`${chainProperties[network]?.externalLinks}/api/scan/democracy/referendum`, {
		body: JSON.stringify({
			referendum_index: referendumId
		}),
		headers: subscanApiHeaders,
		method: 'POST'
	});
	const handleAyeNayCount = async () => {
		setLoadingStatus({ ...loadingStatus, isLoading: true });
		const { data, error } = await nextApiClientFetch<{ aye: { totalCount: number }; nay: { totalCount: number }; abstain: { totalCount: number } }>(
			'/api/v1/votes/ayeNayTotalCount',
			{
				postId: referendumId,
				proposalType: getSubsquidLikeProposalType(ProposalType.REFERENDUMS)
			}
		);
		if (data) {
			setAyeNayCounts({ ayes: data.aye.totalCount, nays: data.nay.totalCount });
			setLoadingStatus({ ...loadingStatus, isLoading: false });
		} else {
			console.log(error);
			setLoadingStatus({ ...loadingStatus, isLoading: false });
		}
	};

	useEffect(() => {
		if (!['cere', 'equilibrium', 'amplitude', 'pendulum', 'polimec'].includes(network)) return;

		(async () => {
			setIsFetchingCereVoteInfo(true);
			const { data, error } = await nextApiClientFetch<{
				data: VoteInfo;
				totalCount: Number;
			}>('/api/v1/votes/getTotalVotesForOtherNetworks', {
				postId: referendumId
			});
			if (data) {
				if (data && data?.data && data?.data && Array.isArray(data?.data)) {
					const voteInfo: VoteInfo = {
						aye_amount: ZERO,
						aye_without_conviction: ZERO,
						isPassing: null,
						nay_amount: ZERO,
						nay_without_conviction: ZERO,
						turnout: ZERO,
						voteThreshold: ''
					};
					data?.data?.forEach((vote: any) => {
						if (vote) {
							const { balance, lockPeriod, decision } = vote;
							if (decision === 'yes') {
								voteInfo.aye_without_conviction = voteInfo.aye_without_conviction.add(new BN(balance.value));
								if (lockPeriod === 0) {
									voteInfo.aye_amount = voteInfo.aye_amount.add(new BN(balance.value).div(new BN(10)));
								} else {
									voteInfo.aye_amount = voteInfo.aye_amount.add(new BN(balance.value).mul(new BN(lockPeriod)));
								}
							} else {
								voteInfo.nay_without_conviction = voteInfo.nay_without_conviction.add(new BN(balance.value));
								if (lockPeriod === 0) {
									voteInfo.nay_amount = voteInfo.nay_amount.add(new BN(balance.value).div(new BN(10)));
								} else {
									voteInfo.nay_amount = voteInfo.nay_amount.add(new BN(balance.value).mul(new BN(lockPeriod)));
								}
							}
						}
					});
					voteInfo.turnout = voteInfo.aye_without_conviction.add(voteInfo.nay_without_conviction);
					if (voteThreshold) {
						voteInfo.voteThreshold = voteThreshold?.split(/(?=[A-Z])/).join(' ');
						if (totalIssuance !== null) {
							let capitalizedVoteThreshold = voteThreshold?.toLowerCase();
							capitalizedVoteThreshold = `${capitalizedVoteThreshold.charAt(0).toUpperCase()}${capitalizedVoteThreshold.slice(1)}`;
							//nays needed for a referendum to fail
							const { failingThreshold } = getFailingThreshold({
								ayes: voteInfo.aye_amount,
								ayesWithoutConviction: voteInfo.aye_without_conviction,
								threshold: capitalizedVoteThreshold as any,
								totalIssuance: totalIssuance
							});
							if (failingThreshold) {
								try {
									if (voteInfo.nay_amount.gte(failingThreshold)) {
										voteInfo.isPassing = false;
									} else {
										voteInfo.isPassing = true;
									}
								} catch (e) {
									console.log('Error calculating Passing state: ', e);
								}
							}
						}
					}
					setVoteInfo(voteInfo);
				}
			} else if (error) {
				console.log(error);
			}

			setIsFetchingCereVoteInfo(false);
		})();
	}, [network, referendumId, totalIssuance, voteThreshold]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
		handleAyeNayCount();
		let unsubscribe: () => void;

		setLoadingStatus({
			isLoading: true,
			message: 'Loading Data'
		});

		if (['equilibrium'].includes(network)) {
			(async () => {
				const { collateral } = (await api.query.eqAggregates.totalUserGroups('Balances', { '0': 25969 })) as any;
				setTotalIssuance(collateral);
			})();
		} else if (['genshiro'].includes(network)) {
			(async () => {
				const { collateral } = (await api.query.eqAggregates.totalUserGroups('Balances', { '0': 1734700659 })) as any;
				setTotalIssuance(collateral);
			})();
		} else {
			api.query.balances
				.totalIssuance((result) => {
					setTotalIssuance(result);
				})
				.then((unsub) => {
					unsubscribe = unsub;
				})
				.catch(console.error);
		}

		return () => unsubscribe && unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, referendumId]);

	useEffect(() => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading Data'
		});

		if (!voteInfoError && voteInfoData && voteInfoData.data && voteInfoData.data.info) {
			const info = voteInfoData.data.info;

			const voteInfo: VoteInfo = {
				aye_amount: ZERO,
				aye_without_conviction: ZERO,
				isPassing: null,
				nay_amount: ZERO,
				nay_without_conviction: ZERO,
				turnout: ZERO,
				voteThreshold: ''
			};

			voteInfo.aye_amount = new BN(info.aye_amount);
			voteInfo.aye_without_conviction = new BN(info.aye_without_conviction);
			voteInfo.nay_amount = new BN(info.nay_amount);
			voteInfo.nay_without_conviction = new BN(info.nay_without_conviction);
			voteInfo.turnout = new BN(info.turnout);
			voteInfo.voteThreshold = info.vote_threshold.split(/(?=[A-Z])/).join(' ');

			if (totalIssuance !== null) {
				let capitalizedVoteThreshold = info.vote_threshold.toLowerCase();
				capitalizedVoteThreshold = `${capitalizedVoteThreshold.charAt(0).toUpperCase()}${capitalizedVoteThreshold.slice(1)}`;
				//nays needed for a referendum to fail
				const { failingThreshold } = getFailingThreshold({
					ayes: voteInfo.aye_amount,
					ayesWithoutConviction: voteInfo.aye_without_conviction,
					threshold: capitalizedVoteThreshold,
					totalIssuance: totalIssuance
				});

				if (failingThreshold) {
					try {
						if (voteInfo.nay_amount.gte(failingThreshold)) {
							voteInfo.isPassing = false;
						} else {
							voteInfo.isPassing = true;
						}
					} catch (e) {
						console.log('Error calculating Passing state: ', e);
					}
				}
			}

			setVoteInfo(voteInfo);
		}

		setLoadingStatus({
			isLoading: false,
			message: 'Loading Data'
		});
	}, [voteInfoData, voteInfoError, totalIssuance]);

	const turnoutPercentage = useMemo(() => {
		if (!voteInfo || !totalIssuance) {
			return 0;
		}
		if (totalIssuance.isZero()) {
			return 0;
		}
		return voteInfo?.turnout.muln(10000).div(totalIssuance).toNumber() / 100;
	}, [voteInfo, totalIssuance]);
	return (
		<>
			{isSubscanSupport(network) ? (
				!voteInfo ? (
					<GovSidebarCard className='flex min-h-[100px] items-center justify-center'>
						<Loader />
					</GovSidebarCard>
				) : (
					<GovSidebarCard>
						<Spin
							spinning={loadingStatus.isLoading}
							indicator={<LoadingOutlined />}
						>
							<div className='flex items-center justify-between gap-x-2'>
								<h6 className='m-0 p-0 text-xl font-medium leading-[24px] text-bodyBlue dark:text-blue-dark-high'>Voting</h6>
								<div className='flex items-center justify-center gap-x-2'>
									<div
										className={
											'h-min truncate whitespace-nowrap rounded-full border border-solid border-bodyBlue px-3 py-1 text-xs text-bodyBlue dark:text-blue-dark-high xl:max-w-[120px] 2xl:max-w-[100%]'
										}
									>
										{voteInfo?.voteThreshold}
									</div>
									{voteInfo.isPassing !== null && <PassingInfoTag isPassing={voteInfo?.isPassing} />}
								</div>
							</div>
							<VoteProgress
								turnoutPercentage={turnoutPercentage || 0}
								ayeVotes={voteInfo?.aye_amount}
								className='vote-progress'
								nayVotes={voteInfo?.nay_amount}
							/>
							<section className='-mt-4 grid grid-cols-2 gap-x-7 gap-y-3 text-lightBlue dark:text-blue-dark-medium'>
								<article className='flex items-center justify-between gap-x-2'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Aye({ayeNayCounts.ayes})</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-lightBlue dark:text-blue-dark-medium'>
										{formatUSDWithUnits(formatBnBalance(voteInfo?.aye_amount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
								<article className='flex items-center justify-between gap-x-2 text-lightBlue dark:text-blue-dark-medium'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Nay({ayeNayCounts.nays})</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-lightBlue dark:text-blue-dark-medium'>
										{formatUSDWithUnits(formatBnBalance(voteInfo?.nay_amount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
								<article className='flex items-center justify-between gap-x-2'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Turnout</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-lightBlue dark:text-blue-dark-medium'>
										{formatUSDWithUnits(formatBnBalance(voteInfo?.turnout, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
								{totalIssuance ? (
									<article className='flex items-center justify-between gap-x-2'>
										<div className='flex items-center gap-x-1'>
											<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Issuance</span>
										</div>
										<div className='text-xs font-medium leading-[22px] text-lightBlue dark:text-blue-dark-medium'>
											{formatUSDWithUnits(formatBnBalance(totalIssuance, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
										</div>
									</article>
								) : null}
							</section>
							<section className='mt-[18px] flex items-center gap-x-4 border-0 border-t-[0.75px] border-solid border-section-light-container pb-[14px] pt-[18px] dark:border-[#3B444F]'>
								<button
									className='m-0 flex cursor-pointer items-center gap-x-1 border-none bg-transparent p-0 text-xs font-medium leading-[22px] text-pink_primary outline-none'
									onClick={() => {
										setOpen(true);
									}}
								>
									<VotingHistoryIcon />
									<span>Voting History</span>
								</button>
							</section>
						</Spin>
					</GovSidebarCard>
				)
			) : ['cere', 'equilibrium', 'polimec'].includes(network) ? (
				<>
					<GovSidebarCard>
						<Spin
							spinning={isFetchingCereVoteInfo}
							className='bg-white dark:bg-section-light-overlay'
							indicator={<LoadingOutlined />}
						>
							<div className='flex items-center justify-between gap-x-2'>
								<h6 className='m-0 p-0 text-xl font-medium leading-[24px] text-bodyBlue dark:text-blue-dark-high'>Voting</h6>
								<div className='relative z-50 flex items-center justify-center gap-x-2'>
									<div
										title={voteInfo?.voteThreshold}
										className={
											'h-min truncate whitespace-nowrap rounded-full border border-solid border-navBlue px-3 py-1 text-xs text-bodyBlue dark:text-blue-dark-high xl:max-w-[120px] 2xl:max-w-[100%]'
										}
									>
										{voteInfo?.voteThreshold}
									</div>
									{voteInfo !== null && <PassingInfoTag isPassing={voteInfo?.isPassing} />}
								</div>
							</div>
							<VoteProgress
								turnoutPercentage={turnoutPercentage || 0}
								ayeVotes={voteInfo?.aye_amount}
								className='vote-progress'
								nayVotes={voteInfo?.nay_amount}
							/>
							<section className='-mt-4 grid grid-cols-2 gap-x-7 gap-y-3 text-[#485F7D] dark:text-blue-dark-medium'>
								<article className='flex items-center justify-between gap-x-2'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Aye({ayeNayCounts.ayes})</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-navBlue'>
										{formatUSDWithUnits(formatBnBalance(voteInfo?.aye_amount || '', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
								<article className='flex items-center justify-between gap-x-2'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Nay({ayeNayCounts.nays})</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-navBlue'>
										{formatUSDWithUnits(formatBnBalance(voteInfo?.nay_amount || '', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
								<article className='flex items-center justify-between gap-x-2'>
									<div className='flex items-center gap-x-1'>
										<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Turnout</span>
									</div>
									<div className='text-xs font-medium leading-[22px] text-navBlue'>
										{formatUSDWithUnits(formatBnBalance(voteInfo?.turnout || '', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
									</div>
								</article>
								{totalIssuance ? (
									<article className='flex items-center justify-between gap-x-2'>
										<div className='flex items-center gap-x-1'>
											<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>Issuance</span>
										</div>
										<div className='text-xs font-medium leading-[22px] text-navBlue'>
											{formatUSDWithUnits(formatBnBalance(totalIssuance, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
										</div>
									</article>
								) : null}
							</section>
							<section className='mt-[18px] flex items-center gap-x-4 border-0 border-t-[0.75px] border-solid border-section-light-container pb-[14px] pt-[18px] dark:border-[#3B444F]'>
								<button
									className='m-0 flex cursor-pointer items-center gap-x-1 border-none bg-transparent p-0 text-xs font-medium leading-[22px] text-pink_primary outline-none'
									onClick={() => {
										setOpen(true);
									}}
								>
									<VotingHistoryIcon />
									<span>Voting History</span>
								</button>
							</section>
						</Spin>
					</GovSidebarCard>
				</>
			) : null}
		</>
	);
};

export default memo(ReferendumVoteInfo);

{
	/* <GovSidebarCard className={className}>
	<Spin spinning={loadingStatus.isLoading} indicator={<LoadingOutlined />}>
		<div className="flex justify-between mb-7">
			<h6 className='dashboard-heading text-base whitespace-pre mr-3'>Voting Status</h6>
			<div className='flex items-center gap-x-2 justify-end'>
				<div className={'text-sidebarBlue border-navBlue border border-solid xl:max-w-[120px] 2xl:max-w-[100%] text-xs rounded-full px-3 py-1 whitespace-nowrap truncate h-min'}>
					{ voteInfo?.voteThreshold }
				</div>
				{voteInfo.isPassing !== null && <PassingInfoTag isPassing={voteInfo?.isPassing}/>}
			</div>
		</div>

		<div className="flex justify-between">
			<VoteProgress
				ayeVotes={voteInfo?.aye_amount}
				className='vote-progress'
				nayVotes={voteInfo?.nay_amount}
			/>

			<div className='flex-1 flex flex-col justify-between ml-4 md:ml-6 2xl:ml-12 py-9'>
				<div className='mb-auto flex items-center'>
					<div className='mr-auto text-sidebarBlue font-medium'>Turnout {turnoutPercentage > 0 && <span className='turnoutPercentage'>({turnoutPercentage}%)</span>}</div>
					<div className='text-navBlue'>{formatUSDWithUnits(formatBnBalance(voteInfo?.turnout, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}</div>
				</div>

				<div className='mb-auto flex items-center'>
					<div className='mr-auto text-sidebarBlue font-medium flex items-center'>Aye <HelperTooltip className='ml-2' text='Aye votes without taking conviction into account'/></div>
					<div className='text-navBlue'>{formatUSDWithUnits(formatBnBalance(voteInfo?.aye_amount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}</div>
				</div>

				<div className='flex items-center'>
					<div className='mr-auto text-sidebarBlue font-medium flex items-center'>Nay <HelperTooltip className='ml-2' text='Nay votes without taking conviction into account'/></div>
					<div className='text-navBlue'>{formatUSDWithUnits(formatBnBalance(voteInfo?.nay_amount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}</div>
				</div>
			</div>
		</div>
	</Spin>
</GovSidebarCard> */
}
