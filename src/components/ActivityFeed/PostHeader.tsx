// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { chainProperties } from '~src/global/networkConstants';
import { useAssetsCurrentPriceSelectior, useCurrentTokenDataSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
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
import { Divider, Tooltip } from 'antd';
import { poppins } from 'pages/_app';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import ActivityProgressinlisting from './ActivityProgressinlisting';
import { ProposalType } from '~src/global/proposalType';
import VoteReferendumModal from '../Post/GovernanceSideBar/Referenda/VoteReferendumModal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
const ZERO_BN = new BN(0);

export const PostHeader: React.FC<{ post: any }> = ({ post }: { post: any }) => {
	const currentUserdata = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const userid = currentUserdata?.id;
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const requestedAmountFormatted = post?.requestedAmount ? new BN(post?.requestedAmount).div(new BN(10).pow(new BN(chainProperties?.[network]?.tokenDecimals))) : ZERO_BN;
	const ayes = String(post?.tally?.ayes).startsWith('0x') ? new BN(post?.tally?.ayes.slice(2), 'hex') : new BN(post?.tally?.ayes || 0);
	const nays = String(post?.tally?.nays).startsWith('0x') ? new BN(post?.tally?.nays.slice(2), 'hex') : new BN(post?.tally?.nays || 0);
	const [decision, setDecision] = useState<IPeriod>();
	const router = useRouter();
	const ayesNumber = Number(ayes.toString());
	const naysNumber = Number(nays.toString());
	const convertRemainingTime = (preiodEndsAt: any) => {
		const diffMilliseconds = preiodEndsAt.diff();

		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if (!diffDays) {
			return `${diffHours}hrs : ${diffMinutes}mins `;
		}
		return `${diffDays}d  : ${diffHours}hrs : ${diffMinutes}mins `;
	};
	const { resolvedTheme: theme } = useTheme();

	const [remainingTime, setRemainingTime] = useState<string>('');

	useEffect(() => {
		if (!window || post?.track_no === null) return;
		let trackDetails = getQueryToTrack(router.pathname.split('/')[1], network);
		if (!trackDetails) {
			trackDetails = getTrackData(network, '', post?.track_no);
		}
		if (!post?.created_at || !trackDetails) return;

		const prepare = getPeriodData(network, dayjs(post?.created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		setRemainingTime(convertRemainingTime(decision.periodEndsAt));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const totalVotes = ayesNumber + naysNumber;
	const ayesPercentage = totalVotes > 0 ? (ayesNumber / totalVotes) * 100 : 0;
	const naysPercentage = totalVotes > 0 ? (naysNumber / totalVotes) * 100 : 0;
	const isAyeNaN = isNaN(ayesPercentage);
	const isNayNaN = isNaN(naysPercentage);
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
	useEffect(() => {
		const fetchData = async () => {
			if (network && post.post_id) {
				const votesResponse = await getReferendumVotes(network, post.post_id);
				if (votesResponse.data) {
					setVotesData(votesResponse.data);
				} else {
					console.error(votesResponse.error);
				}
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post.post_id, network]);
	const [isProposalClosed, setIsProposalClosed] = useState<boolean>(false);
	const [usdValueOnClosed, setUsdValueOnClosed] = useState<string | null>(null);
	const [bnUsdValueOnClosed, setBnUsdValueOnClosed] = useState<BN>(ZERO_BN);
	const { dedTokenUsdPrice = '0' } = useAssetsCurrentPriceSelectior();

	const fetchUSDValue = async () => {
		setLoading(true);
		if (!post?.created_at || dayjs(post?.created_at).isSame(dayjs())) return;
		const passedProposalStatuses = ['Executed', 'Confirmed', 'Approved'];
		let proposalClosedStatusDetails: any = null;
		post?.timeline?.[0]?.statuses.map((status: any) => {
			if (passedProposalStatuses.includes(status.status)) {
				proposalClosedStatusDetails = status;
			}
			setIsProposalClosed(!!proposalClosedStatusDetails);
		});

		const { data, error } = await nextApiClientFetch<{ usdValueOnClosed: string | null; usdValueOnCreation: string | null }>('/api/v1/treasuryProposalUSDValues', {
			closedStatus: proposalClosedStatusDetails || null,
			postId: post?.post_id,
			proposalCreatedAt: post?.created_at || null
		});

		if (data) {
			const [bnClosed] = inputToBn(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed)) : '0', network, false);
			setUsdValueOnClosed(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed)) : null);
			setBnUsdValueOnClosed(bnClosed);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchUSDValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className='flex justify-between'>
				<Link
					href={`/referenda/${post?.post_id}`}
					passHref
				>
					<div>
						<div className='flex items-center gap-1 md:gap-4'>
							<p className='text-[16px] font-bold text-[#485F7D] dark:text-[#9E9E9E] md:pt-[10px] xl:text-[20px]'>
								{post?.requestedAmount ? (
									post?.assetId ? (
										getBeneficiaryAmountAndAsset(post?.assetId, post?.requestedAmount.toString(), network)
									) : (
										<>
											{formatedBalance(post?.requestedAmount, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
										</>
									)
								) : (
									'$0'
								)}
							</p>
							<div>
								<p className='xl:text-md rounded-lg bg-[#F3F4F6] p-2 text-[12px] text-[#485F7D] dark:bg-[#3F3F40] dark:text-[#9E9E9E]'>
									{loading ? (
										<SkeletonInput className='w-5' />
									) : (
										<>
											~{' '}
											{post?.assetId ? (
												`${getUsdValueFromAsset({
													currentTokenPrice: isProposalClosed ? usdValueOnClosed ?? currentTokenPrice : currentTokenPrice || '0',
													dedTokenUsdPrice: dedTokenUsdPrice || '0',
													generalIndex: post?.assetId,
													inputAmountValue: new BN(post?.requestedAmount)
														.div(new BN('10').pow(new BN(getAssetDecimalFromAssetId({ assetId: post?.assetId, network }) || '0')))
														.toString(),
													network
												})} ${chainProperties[network]?.tokenSymbol}`
											) : (
												<span>
													{parseBalance(
														requestedAmountFormatted
															?.mul(
																!isProposalClosed
																	? new BN(Number(currentTokenPrice)).mul(new BN('10').pow(new BN(String(chainProperties?.[network]?.tokenDecimals))))
																	: !bnUsdValueOnClosed || bnUsdValueOnClosed?.eq(ZERO_BN)
																	? new BN(Number(currentTokenPrice)).mul(new BN('10').pow(new BN(String(chainProperties?.[network]?.tokenDecimals))))
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
							{post?.status && (
								<StatusTag
									theme={theme}
									className='mb-3'
									status={post?.status}
								/>
							)}{' '}
						</div>
						<div className='-mt-3 flex items-center gap-1 md:gap-2 '>
							<NameLabel
								defaultAddress={post?.proposer}
								username={post.proposerProfile?.username}
								truncateUsername={true}
								usernameClassName='text-xs text-ellipsis overflow-hidden'
							/>
							<span className='xl:text-md text-[12px] text-[#485F7D] dark:text-[#9E9E9E]'>in</span>
							<TopicTag
								topic={post?.topic?.name}
								className={post?.topic?.name}
								theme={theme as any}
							/>
							<p className='pt-[14px] text-[#485F7D]'>|</p>
							<div className='flex '>
								<ImageIcon
									src='/assets/icons/timer.svg'
									alt='timer'
									className=' h-4 w-4 pt-2 text-[#485F7D] dark:text-[#9E9E9E] xl:h-5 xl:w-5 xl:pt-[10px]'
								/>
								<p className='pt-3 text-[10px] text-[#485F7D] dark:text-[#9E9E9E] xl:text-[12px]'>{getRelativeCreatedAt(post.created_at)}</p>
							</div>
						</div>
					</div>
				</Link>
				<div className='hidden lg:block'>
					{post?.isVoted ? (
						<div className='flex items-center gap-5'>
							<div className='flex flex-col justify-center'>
								<span className='text-[20px] font-semibold leading-6 text-[#2ED47A] dark:text-[#64A057]'>{isAyeNaN ? 50 : ayesPercentage.toFixed(1)}%</span>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] text-[#485F7D] dark:text-blue-dark-medium'>Aye</span>
							</div>
							<div className='h-10 border-l-[0.01px]  border-solid border-[#D2D8E0]'></div>

							<div className=' flex flex-col justify-center'>
								<span className='text-[20px] font-semibold leading-6 text-[#E84865] dark:text-[#BD2020]'>{isNayNaN ? 50 : naysPercentage.toFixed(1)}%</span>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em] text-[#485F7D] dark:text-blue-dark-medium'>Nay</span>
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
								className='m-0 flex h-9 cursor-pointer items-center gap-1 rounded-lg border-solid border-[#E5007A] p-0 px-3 text-[#E5007A]'
							>
								<ImageIcon
									src='/assets/Vote.svg'
									alt=''
									className='m-0 h-6 w-6 p-0'
								/>
								<p className='cursor-pointer pt-3 font-medium'>{!lastVote ? 'Cast Vote' : 'Cast Vote Again'}</p>
							</div>

							<div className='flex items-center gap-2'>
								{decision && decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
									<div className='flex items-center gap-2'>
										<div className='mt-2 min-w-[30px]'>
											<Tooltip
												overlayClassName='max-w-none'
												title={
													<div className={`p-1.5 ${poppins.className} ${poppins.variable} flex items-center whitespace-nowrap text-xs`}>{`Deciding ends in ${remainingTime} ${
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
								<div className='hover:cursor-pointer'>
									<ActivityProgressinlisting
										index={0}
										proposalType={ProposalType.REFERENDUM_V2}
										votesData={votesData}
										onchainId={post?.post_id}
										status={post?.status}
										tally={post?.tally}
									/>
								</div>
							</div>
						</div>
					)}
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
					/>
				)}

				{modalOpen && (
					<ReferendaLoginPrompts
						theme={theme}
						modalOpen={modalOpen}
						setModalOpen={setModalOpen}
						image='/assets/Gifs/login-vote.gif'
						title={'Join Polkassembly to Vote on this proposal.'}
						subtitle='Discuss, contribute and get regular updates from Polkassembly.'
					/>
				)}
			</div>
		</>
	);
};
