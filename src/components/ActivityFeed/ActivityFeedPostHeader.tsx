// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { chainProperties } from '~src/global/networkConstants';
import { useAssetsCurrentPriceSelector, useCurrentTokenDataSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ILastVote, IPeriod } from '~src/types';
import getQueryToTrack from '~src/util/getQueryToTrack';
import { getTrackData } from '../Listing/Tracks/AboutTrackCard';
import { getPeriodData } from '~src/util/getPeriodData';
import { getStatusBlock } from '~src/util/getStatusBlock';
import getReferendumVotes from '~src/util/getReferendumVotes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { inputToBn } from '~src/util/inputToBn';
import Link from 'next/link';
import getBeneficiaryAmountAndAsset from '../OpenGovTreasuryProposal/utils/getBeneficiaryAmountAndAsset';
import { formatedBalance } from '~src/util/formatedBalance';
import SkeletonInput from '~src/basic-components/Skeleton/SkeletonInput';
import { getUsdValueFromAsset } from '../OpenGovTreasuryProposal/utils/getUSDValueFromAsset';
import getAssetDecimalFromAssetId from '../OpenGovTreasuryProposal/utils/getAssetDecimalFromAssetId';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import StatusTag from '~src/ui-components/StatusTag';
import NameLabel from '~src/ui-components/NameLabel';
import TopicTag from '~src/ui-components/TopicTag';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Divider, Spin, Tooltip } from 'antd';
import { dmSans } from 'pages/_app';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import ActivityFeedProgressinlisting from './ActivityFeedProgressinlisting';
import { ProposalType } from '~src/global/proposalType';
import VoteReferendumModal from '../Post/GovernanceSideBar/Referenda/VoteReferendumModal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import DarkCastVoteIcon from '~assets/icons/cast-vote-icon-white.svg';
import styled from 'styled-components';

const ZERO_BN = new BN(0);

export interface ITallyData {
	ayes: BN;
	nays: BN;
	support: BN;
}

export interface IPostHeaderProps {
	post: any;
	tallyData: ITallyData;
	setUpdateTally: React.Dispatch<React.SetStateAction<boolean>>;
	updateTally: boolean;
	isLoading: boolean;
}

export const ActivityFeedPostHeader: React.FC<IPostHeaderProps> = ({
	post,
	tallyData,
	setUpdateTally,
	updateTally,
	isLoading
}: {
	post: any;
	tallyData: ITallyData;
	setUpdateTally: React.Dispatch<React.SetStateAction<boolean>>;
	updateTally: boolean;
	isLoading: boolean;
}) => {
	const currentUserdata = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const userid = currentUserdata?.id;
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const requestedAmountFormatted = useMemo(() => {
		return post?.requestedAmount ? new BN(post.requestedAmount).div(new BN(10).pow(new BN(chainProperties?.[network]?.tokenDecimals))) : ZERO_BN;
	}, [post?.requestedAmount, network]);
	const ayes = tallyData.ayes;
	const nays = tallyData.nays;
	const [decision, setDecision] = useState<IPeriod>();
	const router = useRouter();
	const ayesNumber = Number(ayes.toString());
	const { resolvedTheme: theme } = useTheme();
	const [remainingTime, setRemainingTime] = useState<string>('');
	const naysNumber = Number(nays.toString());
	const convertRemainingTime = (periodEndsAt: any) => {
		const diffMilliseconds = periodEndsAt.diff();
		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if (!diffDays) {
			return `${diffHours}hrs : ${diffMinutes}mins `;
		}
		return `${diffDays}d  : ${diffHours}hrs : ${diffMinutes}mins `;
	};
	const { ayesPercentage, naysPercentage, isAyeNaN, isNayNaN } = useMemo(() => {
		const totalVotes = ayesNumber + naysNumber;
		const ayesPercentage = totalVotes > 0 ? (ayesNumber / totalVotes) * 100 : 0;
		const naysPercentage = totalVotes > 0 ? (naysNumber / totalVotes) * 100 : 0;
		return { ayesPercentage, isAyeNaN: isNaN(ayesPercentage), isNayNaN: isNaN(naysPercentage), naysPercentage };
	}, [ayesNumber, naysNumber]);
	const confirmedStatusBlock = getStatusBlock(post?.timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Confirmed');
	const decidingStatusBlock = getStatusBlock(post?.timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const isProposalFailed = ['Rejected', 'TimedOut', 'Cancelled', 'Killed'].includes(post?.status || '');
	const decidingBlock = post?.statusHistory?.filter((status: any) => status.status === 'Deciding')?.[0]?.block || 0;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const onAccountChange = (address: string) => setAddress(address);
	const [votesData, setVotesData] = useState(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const fetchData = useCallback(async () => {
		if (network && post?.post_id) {
			const votesResponse = await getReferendumVotes(network, post?.post_id);
			if (votesResponse?.data) {
				setVotesData(votesResponse.data);
			} else {
				console.error('Error fetching votes:', votesResponse.error);
			}
		}
	}, [network, post?.post_id]);

	const [isProposalClosed, setIsProposalClosed] = useState<boolean>(false);
	const [usdValueOnClosed, setUsdValueOnClosed] = useState<string | null>(null);
	const [bnUsdValueOnClosed, setBnUsdValueOnClosed] = useState<BN>(ZERO_BN);
	const { dedTokenUsdPrice = '0' } = useAssetsCurrentPriceSelector();
	const VoteIcon = styled(DarkCastVoteIcon)`
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	`;
	const fetchUSDValue = useCallback(async () => {
		if (!post?.created_at || dayjs(post?.created_at)?.isSame(dayjs())) return;

		setLoading(true);
		try {
			const passedProposalStatuses = ['Executed', 'Confirmed', 'Approved'];
			const proposalClosedStatusDetails = post?.timeline?.[0]?.statuses?.find((status: any) => passedProposalStatuses?.includes(status?.status));
			setIsProposalClosed(!!proposalClosedStatusDetails);

			const { data, error } = await nextApiClientFetch<{ usdValueOnClosed: string | null; usdValueOnCreation: string | null }>('/api/v1/treasuryProposalUSDValues', {
				closedStatus: proposalClosedStatusDetails || null,
				postId: post?.post_id,
				proposalCreatedAt: post?.created_at || null
			});

			if (error) throw new Error(error);

			if (data) {
				const [bnClosed] = inputToBn(data?.usdValueOnClosed ? String(Number(data?.usdValueOnClosed)) : '0', network, false);
				setUsdValueOnClosed(data?.usdValueOnClosed ? String(Number(data?.usdValueOnClosed)) : null);
				setBnUsdValueOnClosed(bnClosed);
			}
		} catch (error) {
			console.error('Error fetching USD value:', error);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post, network, inputToBn]);

	useEffect(() => {
		fetchUSDValue();
	}, [fetchUSDValue]);

	useEffect(() => {
		if (typeof window === 'undefined' || post?.track_no === null) return;
		let trackDetails = getQueryToTrack(router.pathname.split('/')[1], network);
		if (!trackDetails) {
			trackDetails = getTrackData(network, '', post?.track_no);
		}
		if (!post?.created_at || !trackDetails) return;
		const prepare = getPeriodData(network, dayjs(post?.created_at), trackDetails, 'preparePeriod');
		const decisionPeriodStartsAt = decidingStatusBlock?.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		setRemainingTime(convertRemainingTime(decision?.periodEndsAt));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<>
			<div className='flex justify-between'>
				<Link
					href={`/referenda/${post?.post_id}`}
					passHref
				>
					<div>
						<div className='flex items-center gap-1 md:gap-2'>
							{post?.requestedAmount && post?.requestedAmount !== '0' ? (
								<>
									<p className='text-[16px] font-bold text-blue-light-medium dark:text-[#9E9E9E] md:pt-[10px] xl:text-[20px]'>
										{post?.assetId ? (
											getBeneficiaryAmountAndAsset({ amount: post?.requestedAmount?.toString(), assetId: post?.assetId, network })
										) : (
											<>
												{formatedBalance(post?.requestedAmount, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
											</>
										)}
									</p>
									<div>
										<p className='xl:text-md rounded-lg bg-[#F3F4F6] p-2 text-[12px] text-blue-light-medium dark:bg-[#3F3F40] dark:text-[#9E9E9E]'>
											{loading ? (
												<SkeletonInput className='w-5' />
											) : (
												<>
													~{' '}
													{post?.assetId && post?.requestedAmount ? (
														`${getUsdValueFromAsset({
															currentTokenPrice: isProposalClosed ? usdValueOnClosed ?? currentTokenPrice : currentTokenPrice || '0',
															dedTokenUsdPrice: dedTokenUsdPrice || '0',
															generalIndex: post?.assetId,
															inputAmountValue: new BN(post?.requestedAmount)
																?.div(new BN('10').pow(new BN(getAssetDecimalFromAssetId({ assetId: post?.assetId, network }) || '0')))
																?.toString(),
															network
														})} ${chainProperties[network]?.tokenSymbol}`
													) : (
														<span>
															{parseBalance(
																requestedAmountFormatted
																	?.mul(
																		!isProposalClosed
																			? new BN(Number(currentTokenPrice))?.mul(new BN('10')?.pow(new BN(String(chainProperties?.[network]?.tokenDecimals))))
																			: !bnUsdValueOnClosed || bnUsdValueOnClosed?.eq(ZERO_BN)
																			? new BN(Number(currentTokenPrice))?.mul(new BN('10')?.pow(new BN(String(chainProperties?.[network]?.tokenDecimals))))
																			: bnUsdValueOnClosed
																	)
																	?.toString() || '0',
																0,
																false,
																network
															)}{' '}
															USD{' '}
														</span>
													)}
												</>
											)}
										</p>
									</div>
								</>
							) : (
								<div className='mt-6 min-h-[30px]'></div>
							)}

							{post?.status && (
								<StatusTag
									theme={theme}
									className={`mb-3 ${!post?.requestedAmount || post?.requestedAmount === '0' ? '-ml-3' : ''}`}
									status={post?.status}
								/>
							)}
						</div>

						<div className='-mt-3 flex items-center gap-1 md:gap-2 '>
							<NameLabel
								defaultAddress={post?.proposer}
								username={post.proposerProfile?.username}
								usernameClassName='text-xs text-ellipsis overflow-hidden'
							/>
							<span className='xl:text-md text-[12px] text-blue-light-medium dark:text-[#9E9E9E]'>in</span>
							<TopicTag
								topic={post?.topic?.name}
								className={post?.topic?.name}
								theme={theme as any}
							/>
							<p className='pt-[14px] text-blue-light-medium dark:text-[#9E9E9E]'>|</p>
							<div className='flex '>
								<ImageIcon
									src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
									alt='timer'
									className=' h-4 w-4 pt-2 text-blue-light-medium dark:text-[#9E9E9E] xl:h-5 xl:w-5 xl:pt-[10px]'
								/>
								<p className='pt-3 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] xl:text-[12px]'>{getRelativeCreatedAt(post.created_at)}</p>
							</div>
						</div>
					</div>
				</Link>
				<div
					key={post?.post_id}
					className='hidden lg:block'
				>
					{post?.isVoted ? (
						<div className='flex items-center gap-5'>
							<div className='flex flex-col justify-center'>
								<span className='text-[20px] font-semibold leading-6 text-[#2ED47A] dark:text-[#64A057]'>{isAyeNaN ? 50 : ayesPercentage.toFixed(1)}%</span>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] text-blue-light-medium dark:text-blue-dark-medium'>Aye</span>
							</div>
							<div className='h-10 border-l-[0.01px]  border-solid border-[#D2D8E0]'></div>

							<div className=' flex flex-col justify-center'>
								<span className='text-[20px] font-semibold leading-6 text-[#E84865] dark:text-[#BD2020]'>{isNayNaN ? 50 : naysPercentage.toFixed(1)}%</span>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] text-blue-light-medium dark:text-blue-dark-medium'>Nay</span>
							</div>
						</div>
					) : (
						<div className='mt-1 flex flex-col items-end '>
							<div
								onClick={() => {
									if (!userid) {
										setModalOpen(true);
									} else {
										setShowModal(true);
									}
								}}
								className='flex h-9 cursor-pointer items-center gap-1 rounded-lg border-[1px] border-solid border-[#E5007A] p-0 px-3 text-pink_primary'
							>
								<VoteIcon className=' mt-[1px]' />
								<p className='cursor-pointer pt-3 font-medium'>{!lastVote ? 'Cast Vote' : 'Cast Vote Again'}</p>
							</div>

							<div className='flex items-center gap-2'>
								{decision && decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
									<div className='flex items-center gap-2'>
										<div className='mt-2 min-w-[30px]'>
											<Tooltip
												overlayClassName='max-w-none'
												title={
													<div className={`p-1.5 ${dmSans.className} ${dmSans.variable} flex items-center whitespace-nowrap text-xs`}>{`Deciding ends in ${remainingTime} ${
														decidingBlock !== 0 ? `#${decidingBlock}` : ''
													}`}</div>
												}
												color='#575255'
											>
												<div className='mt-2 min-w-[30px] hover:cursor-pointer'>
													<ProgressBar
														strokeWidth={7}
														percent={decision.periodPercent || 0}
														strokeColor='#407AFC'
														trailColor='#D4E0FC'
														showInfo={false}
													/>
												</div>
											</Tooltip>
										</div>
										<Divider
											type='vertical'
											className='border-l-1 border-[#485F7D] dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
										/>
									</div>
								)}
								<Spin
									spinning={isLoading}
									size='small'
								>
									<div className='hover:cursor-pointer'>
										<ActivityFeedProgressinlisting
											index={0}
											proposalType={ProposalType.REFERENDUM_V2}
											votesData={votesData}
											onchainId={post?.post_id}
											status={post?.status}
											tally={tallyData}
										/>
									</div>
								</Spin>
							</div>
						</div>
					)}
				</div>
			</div>
			{showModal && (
				<VoteReferendumModal
					onAccountChange={onAccountChange}
					address={address}
					proposalType={ProposalType.REFERENDUM_V2}
					setLastVote={setLastVote}
					setShowModal={setShowModal}
					showModal={showModal}
					referendumId={post?.post_id}
					trackNumber={post?.track_no}
					setUpdateTally={setUpdateTally}
					updateTally={updateTally}
				/>
			)}

			{/* Added Halloween Login Prompt */}
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				image='/assets/Gifs/login-vote.gif'
				title={'Join Polkassembly to Vote on this proposal.'}
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</>
	);
};
