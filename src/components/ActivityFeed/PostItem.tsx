// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useRef, useState } from 'react';
import Markdown from '~src/ui-components/Markdown';
import ImageIcon from '~src/ui-components/ImageIcon';
import Link from 'next/link';
import Image from 'next/image';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ChangeResponseType, MessageType } from '~src/auth/types';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useAssetsCurrentPriceSelectior, useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import BN from 'bn.js';
import getBeneficiaryAmountAndAsset from '../OpenGovTreasuryProposal/utils/getBeneficiaryAmountAndAsset';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useTheme } from 'next-themes';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { Button, Divider, Form, Modal, Skeleton, Tooltip } from 'antd';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import { ILastVote, IPeriod, NotificationStatus } from '~src/types';
import getQueryToTrack from '~src/util/getQueryToTrack';
import { useRouter } from 'next/router';
import { getTrackData } from '../Listing/Tracks/AboutTrackCard';
import { getPeriodData } from '~src/util/getPeriodData';
import dayjs from 'dayjs';
import { poppins } from 'pages/_app';
import DarkSentiment1 from '~assets/overall-sentiment/dark/dizzy(1).svg';
import DarkSentiment2 from '~assets/overall-sentiment/dark/dizzy(2).svg';
import DarkSentiment3 from '~assets/overall-sentiment/dark/dizzy(3).svg';
import DarkSentiment4 from '~assets/overall-sentiment/dark/dizzy(4).svg';
import DarkSentiment5 from '~assets/overall-sentiment/dark/dizzy(5).svg';
import SadDizzyIcon from '~assets/overall-sentiment/pink-against.svg';
import SadIcon from '~assets/overall-sentiment/pink-slightly-against.svg';
import NeutralIcon from '~assets/overall-sentiment/pink-neutral.svg';
import SmileIcon from '~assets/overall-sentiment/pink-slightly-for.svg';
import SmileDizzyIcon from '~assets/overall-sentiment/pink-for.svg';
import queueNotification from '~src/ui-components/QueueNotification';
import ContentForm from '../ContentForm';
import { IAddPostCommentResponse } from 'pages/api/v1/auth/actions/addPostComment';
import { ProposalType } from '~src/global/proposalType';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import Popover from '~src/basic-components/Popover';
import TooltipContent from '../Post/ActionsBar/Reactionbar/TooltipContent';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import dynamic from 'next/dynamic';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import TopicTag from '~src/ui-components/TopicTag';
import getReferendumVotes from '~src/util/getReferendumVotes';
import ActivityProgressinlisting from './ActivityProgressinlisting';
import { inputToBn } from '~src/util/inputToBn';
import { getUsdValueFromAsset } from '../OpenGovTreasuryProposal/utils/getUSDValueFromAsset';
import getAssetDecimalFromAssetId from '../OpenGovTreasuryProposal/utils/getAssetDecimalFromAssetId';
import SkeletonInput from '~src/basic-components/Skeleton/SkeletonInput';

const VoteReferendumModal = dynamic(() => import('../Post/GovernanceSideBar/Referenda/VoteReferendumModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const ZERO_BN = new BN(0);

const ANONYMOUS_FALLBACK = 'Anonymous';
const NO_CONTENT_FALLBACK = 'No content available for this post.';
const FIRST_VOTER_PROFILE_IMG_FALLBACK = '/assets/rankcard3.svg';
const COMMENT_LABEL = 'Comment';
const COMMENT_PLACEHOLDER = 'Type your comment here';
const POST_LABEL = 'Post';

const EmojiOption = ({ icon, title }: { icon: React.ReactNode; title: string }) => {
	return (
		<Tooltip
			color='#363636'
			title={title}
			placement='top'
		>
			<div className={'  h-10 w-10 rounded-full border-none bg-transparent pl-3   text-2xl '}>{icon}</div>
		</Tooltip>
	);
};

const getStatusStyle = (status: string) => {
	const statusStyles: Record<string, { bgColor: string; label: string }> = {
		Deciding: { bgColor: 'bg-[#D05704]', label: 'Deciding' },
		Executed: { bgColor: 'bg-[#2ED47A]', label: 'Executed' },
		Rejected: { bgColor: 'bg-[#BD2020]', label: 'Rejected' },
		Submitted: { bgColor: 'bg-[#3866CE]', label: 'Submitted' }
	};

	return statusStyles[status] || { bgColor: 'bg-[#2ED47A]', label: 'Active' };
};

const PostItem: React.FC<any> = ({ post, currentUserdata }) => {
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;

	const { bgColor, label: statusLabel } = getStatusStyle(post.status || 'Active');

	const { '👍': likes = { count: 0, userIds: [], usernames: [] }, '👎': dislikes = { count: 0, userIds: [], usernames: [] } } = post?.post_reactions || {};

	const fullContent = post?.content || NO_CONTENT_FALLBACK;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');

	const onAccountChange = (address: string) => setAddress(address);

	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	return (
		<div className=' rounded-2xl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-8 font-poppins hover:shadow-md  dark:border-solid dark:border-[#4B4B4B] dark:bg-[#0D0D0D]'>
			<PostHeader
				post={post}
				bgColor={bgColor}
				statusLabel={statusLabel}
				currentUserdata={currentUserdata}
			/>
			<Link
				href={`/referenda/${post?.post_id}`}
				passHref
			>
				<PostContent
					post={post}
					content={fullContent}
					isCommentPost={false}
				/>

				<PostReactions
					likes={likes}
					dislikes={dislikes}
					post={post}
				/>
			</Link>
			<div className='border-t-[0.01px]  border-solid border-[#D2D8E0]'></div>
			<PostActions
				post={post}
				currentUserdata={currentUserdata}
			/>
			<PostCommentSection
				post={post}
				currentUserdata={currentUserdata}
			/>
			{isMobile && (
				<div
					onClick={() => {
						if (currentUserdata && currentUserdata?.id) {
							setShowModal(true);
						} else {
							setModalOpen(true);
						}
					}}
					className='m-0 mt-3 flex cursor-pointer items-center justify-center gap-1 rounded-lg border-[1px] border-solid  border-[#E5007A] p-0 px-3 text-[#E5007A]'
				>
					{/* <ImageIcon
						src='/assets/Vote.svg'
						alt=''
						className='m-0 h-6 w-6 p-0'
					/> */}
					<p className='cursor-pointer pt-3 font-medium'> {!lastVote ? 'Cast Your Vote' : 'Cast Vote Again'}</p>
				</div>
			)}
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
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				image='/assets/Gifs/login-vote.gif'
				title={'Join Polkassembly to Vote on this proposal.'}
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

const PostHeader: React.FC<{ bgColor: string; statusLabel: string; post: any; currentUserdata: any }> = ({ bgColor, statusLabel, post, currentUserdata }) => {
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
						<div className='flex items-center gap-4'>
							<p className='pt-[10px] text-[16px] font-bold text-[#485F7D] dark:text-[#9E9E9E] xl:text-2xl'>
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

							<div>
								<p className={`rounded-full px-3 py-2 text-white dark:text-black ${bgColor}`}>{statusLabel}</p>
							</div>
						</div>
						<div className='flex items-center gap-2 '>
							<Image
								src={post.proposerProfile?.profileimg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
								alt='profile'
								className='h-4 w-4 rounded-full xl:h-6 xl:w-6'
								width={24}
								height={24}
							/>
							<p className='pt-3 text-[12px] font-medium text-[#243A57] dark:text-white xl:text-sm'>
								{post.proposerProfile?.username
									? post.proposerProfile.username.length > 10
										? `${post.proposerProfile.username.substring(0, 10)}...`
										: post.proposerProfile.username
									: ANONYMOUS_FALLBACK}
							</p>
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
									className=' h-4 w-4 text-[#485F7D] dark:text-[#9E9E9E] md:pt-[14px] xl:h-5 xl:w-5'
								/>
								<p className='pt-3 text-[10px] text-gray-500 dark:text-[#9E9E9E] xl:text-sm'>{getRelativeCreatedAt(post.created_at)}</p>
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
						<div className='flex flex-col items-end '>
							<div
								onClick={() => {
									if (!currentUserdata && !userid) {
										setModalOpen(true);
										return;
									} else {
										setShowModal(true);
									}
								}}
								className='m-0 mt-3 flex h-9 cursor-pointer items-center gap-1 rounded-lg border-solid border-[#E5007A] p-0 px-3 text-[#E5007A]'
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

const PostContent: React.FC<{
	post: any;
	content: string;
	isCommentPost?: boolean;
}> = ({ post, content }) => {
	const trimmedContentForComment = content?.length > 200 ? content?.slice(0, 150) + '...' : content;

	return (
		<>
			<p className='xl:text-md pt-2 text-[15px] font-medium text-[#243A57] dark:text-white'>
				#{post?.post_id} {post?.title || 'Untitled Post'}
			</p>
			<Markdown
				className='xl:text-md text-[12px] text-[#243A57]'
				md={trimmedContentForComment}
			/>
			<Link
				className='flex cursor-pointer gap-1 font-medium text-[#E5007A] underline'
				href={`/referenda/${post?.post_id}`}
			>
				Read More{' '}
				<ImageIcon
					src='/assets/more.svg'
					alt=''
					className='h-4 w-4'
				/>
			</Link>
		</>
	);
};

const PostReactions: React.FC<{
	likes: { count: number; usernames: string[] };
	dislikes: { count: number; usernames: string[] };
	post: any;
}> = ({ likes, dislikes, post }) => {
	const { firstVoterProfileImg, comments_count } = post;
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const username = likes?.usernames?.[0] || '';
	const displayUsername = !isMobile ? username : username.length > 5 ? `${username.slice(0, 5)}...` : username;
	const { resolvedTheme: theme } = useTheme();
	return (
		<div className='flex items-center justify-between text-sm text-gray-500 dark:text-[#9E9E9E]'>
			<div>
				{likes.count > 0 && likes?.usernames?.length > 0 && (
					<div className='flex items-center'>
						<Image
							src={firstVoterProfileImg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
							alt='Voter Profile'
							className='h-5 w-5 rounded-full'
							width={20}
							height={20}
						/>
						<p className='md: ml-2 text-[10px] md:pt-3 md:text-[12px]'>
							{likes?.count === 1 ? `${displayUsername} has liked this post` : `${displayUsername} & ${likes?.count - 1} others liked this post`}
						</p>
					</div>
				)}
			</div>

			<div className='flex items-center gap-1 md:gap-3'>
				<p className='text-[10px] text-gray-600 dark:text-[#9E9E9E] md:text-[12px] '>{dislikes.count} dislikes</p>
				<p className='text-[#485F7D] dark:text-[#9E9E9E]'>|</p>
				<p className='text-[10px] text-gray-600 dark:text-[#9E9E9E] md:text-[12px] '>{comments_count || 0} Comments</p>
				{post?.highestSentiment?.sentiment > 0 && <p className='block text-[#485F7D] dark:text-[#9E9E9E]  lg:hidden'>|</p>}
				<div className='block lg:hidden'>
					<div className='flex items-center'>
						<div>
							{post?.highestSentiment?.sentiment == 0 && (
								<EmojiOption
									icon={
										theme === 'dark' ? <DarkSentiment1 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <SadDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
									}
									title={'Completely Against'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 2 && (
								<EmojiOption
									icon={theme === 'dark' ? <DarkSentiment2 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <SadIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
									title={'Slightly Against'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 3 && (
								<EmojiOption
									icon={
										theme === 'dark' ? <DarkSentiment3 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <NeutralIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
									}
									title={'Neutral'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 4 && (
								<EmojiOption
									icon={
										theme === 'dark' ? <DarkSentiment4 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <SmileIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
									}
									title={'Slightly For'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 5 && (
								<EmojiOption
									icon={
										theme === 'dark' ? (
											<DarkSentiment5 style={{ border: 'none', transform: 'scale(1.2)' }} />
										) : (
											<SmileDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
										)
									}
									title={'Completely For'}
								/>
							)}
						</div>
						<p className='text-[10px] text-[#485F7D] md:text-[12px] '>{post?.highestSentiment?.percentage && `${post?.highestSentiment?.percentage}%`}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const PostActions: React.FC<{
	post: any;
	currentUserdata: any;
}> = ({ post, currentUserdata }) => {
	const { post_id, track_no } = post;
	const userid = currentUserdata?.id;
	const username = currentUserdata?.username;
	const { post_reactions } = post;

	const [reactionState, setReactionState] = useState({
		dislikesCount: post_reactions?.['👎']?.count || 0,
		likesCount: post_reactions?.['👍']?.count || 0,
		userDisliked: post_reactions?.['👎']?.usernames?.includes(username) || false,
		userLiked: post_reactions?.['👍']?.usernames?.includes(username) || false
	});

	const [openLikeModal, setLikeModalOpen] = useState<boolean>(false);
	const [openDislikeModal, setDislikeModalOpen] = useState<boolean>(false);
	const [showGif, setShowGif] = useState<{ reaction: '👍' | '👎' | null }>({ reaction: null });
	const { resolvedTheme: theme } = useTheme();

	const handleReactionClick = (reaction: '👍' | '👎') => {
		if (!currentUserdata && !userid) {
			if (reaction === '👍') setLikeModalOpen(true);
			if (reaction === '👎') setDislikeModalOpen(true);
			return;
		}

		const isLiked = reaction === '👍' && reactionState.userLiked;
		const isDisliked = reaction === '👎' && reactionState.userDisliked;

		setReactionState((prevState) => {
			const newState = { ...prevState };

			if (reaction === '👍') {
				if (prevState.userDisliked) {
					newState.dislikesCount -= 1;
					newState.userDisliked = false;
					post_reactions['👎'].count -= 1;
					const index = post_reactions['👎'].usernames.indexOf(username);
					if (index > -1) post_reactions['👎'].usernames.splice(index, 1);
				}
				newState.likesCount = isLiked ? prevState.likesCount - 1 : prevState.likesCount + 1;
				newState.userLiked = !isLiked;
				if (!isLiked) {
					post_reactions['👍'].usernames.push(username);
					post_reactions['👍'].count += 1;
				} else {
					const index = post_reactions['👍'].usernames.indexOf(username);
					if (index > -1) post_reactions['👍'].usernames.splice(index, 1);
					post_reactions['👍'].count -= 1;
				}
			} else if (reaction === '👎') {
				if (prevState.userLiked) {
					newState.likesCount -= 1;
					newState.userLiked = false;
					post_reactions['👍'].count -= 1;
					const index = post_reactions['👍'].usernames.indexOf(username);
					if (index > -1) post_reactions['👍'].usernames.splice(index, 1);
				}
				newState.dislikesCount = isDisliked ? prevState.dislikesCount - 1 : prevState.dislikesCount + 1;
				newState.userDisliked = !isDisliked;
				if (!isDisliked) {
					post_reactions['👎'].usernames.push(username);
					post_reactions['👎'].count += 1;
				} else {
					const index = post_reactions['👎'].usernames.indexOf(username);
					if (index > -1) post_reactions['👎'].usernames.splice(index, 1);
					post_reactions['👎'].count -= 1;
				}
			}

			return newState;
		});

		if (showGif.reaction !== reaction) {
			setShowGif({ reaction });
			setTimeout(() => {
				setShowGif({ reaction: null });
			}, 600);
		}

		const actionName = `${isLiked || isDisliked ? 'remove' : 'add'}PostReaction`;
		setTimeout(async () => {
			const { data, error } = await nextApiClientFetch<MessageType>(`api/v1/auth/actions/${actionName}`, {
				postId: post_id,
				postType: ProposalType.REFERENDUM_V2,
				reaction,
				replyId: null,
				setReplyReaction: false,
				trackNumber: track_no,
				userId: userid
			});

			if (error || !data) {
				console.error('Error updating reaction', error);
			}
		}, 100);
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const modalWrapperRef = useRef<HTMLDivElement>(null);

	const openModal = () => {
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
	};
	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (modalWrapperRef.current && !modalWrapperRef.current.contains(event.target as Node)) {
				closeModal();
			}
		};
		if (isModalOpen) {
			document.addEventListener('mousedown', handleOutsideClick);
		} else {
			document.removeEventListener('mousedown', handleOutsideClick);
		}

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isModalOpen]);
	const likedusernames = post_reactions?.['👍']?.usernames;
	const dislikedusernames = post_reactions?.['👎']?.usernames;
	const [likedUserImageData, setLikedUserImageData] = useState<UserProfileImage[]>([]);
	const [dislikedUserImageData, setDislikedUserImageData] = useState<UserProfileImage[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { network } = useNetworkSelector();

	const likeduserIds = post_reactions?.['👍']?.userIds;
	const dislikeduserIds = post_reactions?.['👎']?.userIds;

	const getUserProfile = async (userIds: string[], setImageData: React.Dispatch<React.SetStateAction<UserProfileImage[]>>) => {
		if (userIds?.length) {
			setIsLoading(true);
			const { data } = await nextApiClientFetch<UserProfileImage[]>('api/v1/auth/data/getUsersProfileImages', { userIds });
			if (data) {
				setImageData(data);
				setIsLoading(false);
			} else {
				setIsLoading(false);
			}
		} else {
			setImageData([]);
		}
	};
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	useEffect(() => {
		if (likeduserIds && likeduserIds.length > 0) {
			getUserProfile([...likeduserIds].map(String), setLikedUserImageData);
		}
	}, [network, likeduserIds]);

	useEffect(() => {
		if (dislikeduserIds && dislikeduserIds.length > 0) {
			getUserProfile([...dislikeduserIds].map(String), setDislikedUserImageData);
		}
	}, [network, dislikeduserIds]);

	return (
		<>
			<div className='flex justify-between'>
				<div className='mt-1 flex items-center md:space-x-4'>
					<div onClick={() => handleReactionClick('👍')}>
						<PostAction
							icon={
								showGif.reaction === '👍' ? (
									<Image
										src={theme === 'dark' ? '/assets/icons/reactions/Liked-Colored-Dark.gif' : '/assets/icons/reactions/Liked-Colored.gif'}
										alt='liked gif'
										className='h-4 w-4'
										width={5}
										height={5}
									/>
								) : (
									<Popover
										placement='bottomLeft'
										content={
											likedusernames && likedusernames.length > 0 ? (
												<TooltipContent
													usernames={likedusernames}
													users={likedUserImageData}
													isLoading={isLoading}
												/>
											) : (
												<div>No reactions yet</div>
											)
										}
									>
										<Image
											src={
												reactionState.userLiked
													? theme === 'dark'
														? '/assets/activityfeed/darkliked.svg'
														: '/assets/activityfeed/liked.svg'
													: theme === 'dark'
													? '/assets/activityfeed/likedark.svg'
													: '/assets/activityfeed/like.svg'
											}
											alt='like icon'
											className='h-4 w-4'
											width={5}
											height={5}
										/>
									</Popover>
								)
							}
							label={reactionState.userLiked ? 'Liked' : 'Like'}
							isMobile={typeof window !== 'undefined' && window?.screen.width < 1024}
						/>
					</div>

					<div onClick={() => handleReactionClick('👎')}>
						<PostAction
							icon={
								showGif?.reaction === '👎' ? (
									<div className='rotate-180'>
										<Image
											src={theme === 'dark' ? '/assets/icons/reactions/Liked-Colored-Dark.gif' : '/assets/icons/reactions/Liked-Colored.gif'}
											alt='disliked gif'
											className='h-4 w-4'
											width={5}
											height={5}
										/>
									</div>
								) : (
									<Popover
										placement='bottomLeft'
										content={
											dislikedusernames && dislikedusernames.length > 0 ? (
												<TooltipContent
													usernames={dislikedusernames}
													users={dislikedUserImageData}
													isLoading={isLoading}
												/>
											) : (
												<div>No reactions yet</div>
											)
										}
									>
										<Image
											src={
												reactionState.userDisliked
													? theme === 'dark'
														? '/assets/activityfeed/darkdisliked.svg'
														: '/assets/activityfeed/disliked.svg'
													: theme === 'dark'
													? '/assets/activityfeed/dislikedark.svg'
													: '/assets/activityfeed/dislike.svg'
											}
											alt='dislike icon'
											className='h-4 w-4'
											width={5}
											height={5}
										/>
									</Popover>
								)
							}
							label={reactionState.userDisliked ? 'Disliked' : 'Dislike'}
							isMobile={typeof window !== 'undefined' && window?.screen.width < 1024}
						/>
					</div>

					<div
						onClick={() => {
							if (!currentUserdata && !userid) {
								setOpenLoginModal(true);
								return;
							} else {
								openModal();
							}
						}}
					>
						<PostAction
							icon={
								<ImageIcon
									src='/assets/icons/comment-pink.svg'
									alt='comment icon'
									className='h-5 w-5'
								/>
							}
							label={COMMENT_LABEL}
							isMobile={isMobile}
						/>
					</div>
					<Link
						target='_blank'
						href={'https://twitter.com/'}
					>
						<PostAction
							icon={
								<ImageIcon
									src='/assets/icons/share-pink.svg'
									alt='share icon'
									className='h-5 w-5'
								/>
							}
							label={!isMobile ? 'Share' : ''}
							isMobile={isMobile}
						/>
					</Link>
				</div>

				<div className='hidden lg:block'>
					<div className='flex items-center'>
						<div>
							{post?.highestSentiment?.sentiment == 0 && (
								<EmojiOption
									icon={
										theme === 'dark' ? <DarkSentiment1 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <SadDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
									}
									title={'Completely Against'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 2 && (
								<EmojiOption
									icon={theme === 'dark' ? <DarkSentiment2 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <SadIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
									title={'Slightly Against'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 3 && (
								<EmojiOption
									icon={
										theme === 'dark' ? <DarkSentiment3 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <NeutralIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
									}
									title={'Neutral'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 4 && (
								<EmojiOption
									icon={
										theme === 'dark' ? <DarkSentiment4 style={{ border: 'none', transform: 'scale(1.2)' }} /> : <SmileIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
									}
									title={'Slightly For'}
								/>
							)}
							{post?.highestSentiment?.sentiment == 5 && (
								<EmojiOption
									icon={
										theme === 'dark' ? (
											<DarkSentiment5 style={{ border: 'none', transform: 'scale(1.2)' }} />
										) : (
											<SmileDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />
										)
									}
									title={'Completely For'}
								/>
							)}
						</div>
						<p className='text-[10px] text-[#485F7D] md:text-[12px] '>{post?.highestSentiment?.percentage && `${post?.highestSentiment?.percentage}%`}</p>
					</div>
				</div>
			</div>
			{isModalOpen && (
				<>
					<div
						className='fixed inset-0 z-40 bg-black bg-opacity-30'
						onClick={closeModal}
					/>
					<Modal
						visible={isModalOpen}
						onCancel={closeModal}
						footer={null}
						centered
						className='z-50 w-[80%] lg:w-auto'
					>
						<div
							className='lg:w-full'
							ref={modalWrapperRef}
						>
							<CommentModal
								post={post}
								isModalOpen={isModalOpen}
								onclose={closeModal}
								currentUserdata={currentUserdata}
							/>
						</div>
					</Modal>
				</>
			)}
			<ReferendaLoginPrompts
				modalOpen={openLikeModal}
				setModalOpen={setLikeModalOpen}
				image='/assets/Gifs/login-like.gif'
				title='Join Polkassembly to Like this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>

			<ReferendaLoginPrompts
				modalOpen={openDislikeModal}
				setModalOpen={setDislikeModalOpen}
				image='/assets/Gifs/login-dislike.gif'
				title='Join Polkassembly to Dislike this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={openLoginModal}
				setModalOpen={setOpenLoginModal}
				image='/assets/Gifs/login-discussion.gif'
				title='Join Polkassembly to Comment on this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</>
	);
};

const PostAction: React.FC<{ icon: JSX.Element; label: string; isMobile: boolean }> = ({ icon, label, isMobile }) => (
	<div className='flex items-center gap-2'>
		<span>{icon}</span>
		{isMobile && <p className='cursor-pointer pt-4 text-[#E5007A]'>{label}</p>}
		{!isMobile && <p className='hidden cursor-pointer pt-4 text-[#E5007A] xl:block'>{label}</p>}
	</div>
);

const PostCommentSection: React.FC<{ post: any; currentUserdata: any }> = ({ post, currentUserdata }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const userid = currentUserdata?.id;
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [loginTriggered, setLoginTriggered] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const modalWrapperRef = useRef<HTMLDivElement>(null);
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const openModal = () => {
		if (userid) {
			setIsModalOpen(true);
		} else if (!loginTriggered) {
			setOpenLoginModal(true);
			setLoginTriggered(true);

			if (inputRef.current) {
				inputRef.current.blur();
			}
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (modalWrapperRef.current && !modalWrapperRef.current.contains(event.target as Node)) {
				closeModal();
			}
		};
		if (isModalOpen) {
			document.addEventListener('mousedown', handleOutsideClick);
		} else {
			document.removeEventListener('mousedown', handleOutsideClick);
		}

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isModalOpen]);
	const { resolvedTheme: theme } = useTheme();

	return (
		<div className='mt-3 flex items-center'>
			{!isMobile && (
				<Image
					src={`${currentUserdata?.image ? currentUserdata?.image : FIRST_VOTER_PROFILE_IMG_FALLBACK}`}
					alt=''
					className='h-6 w-6 rounded-full xl:h-10 xl:w-10'
					width={40}
					height={40}
				/>
			)}

			<input
				ref={inputRef}
				type='text'
				value={''}
				placeholder={COMMENT_PLACEHOLDER}
				className={` h-9 w-full rounded-l-lg border border-solid border-[#D2D8E0] p-2 outline-none dark:border dark:border-solid dark:border-[#4B4B4B] md:p-2 ${
					!isMobile ? 'ml-7' : ''
				}`}
				onClick={openModal}
			/>
			<button
				onClick={openModal}
				className='w-28 cursor-pointer rounded-r-lg border border-solid border-[#D2D8E0] bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57] dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#262627] dark:text-white'
			>
				{POST_LABEL}
			</button>

			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={openLoginModal}
				setModalOpen={setOpenLoginModal}
				image='/assets/Gifs/login-discussion.gif'
				title='Join Polkassembly to Comment on this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>

			{isModalOpen && (
				<>
					<div
						className='fixed inset-0 z-40 bg-black bg-opacity-30'
						onClick={closeModal}
					/>
					<Modal
						visible={isModalOpen}
						onCancel={closeModal}
						footer={null}
						centered
						className='z-50 w-[80%] lg:w-auto'
					>
						<div
							className='lg:w-full'
							ref={modalWrapperRef}
						>
							<CommentModal
								post={post}
								isModalOpen={isModalOpen}
								onclose={closeModal}
								currentUserdata={currentUserdata}
							/>
						</div>
					</Modal>
				</>
			)}
		</div>
	);
};

const CommentModal: React.FC<{ post: any; currentUserdata: any; isModalOpen: boolean; onclose: () => void }> = ({ post, currentUserdata, isModalOpen, onclose }) => {
	const [form] = Form.useForm();
	const commentKey = () => `comment:${typeof window !== 'undefined' ? window.location.href : ''}`;
	const [content, setContent] = useState(typeof window !== 'undefined' ? window.localStorage.getItem(commentKey()) || '' : '');
	const onContentChange = (content: string) => {
		setContent(content);
		global.window.localStorage.setItem(commentKey(), content);
		return content.length ? content : null;
	};
	const handleModalOpen = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if (!content) return;
		handleSave();
	};
	const [loading, setLoading] = useState(false);

	const createSubscription = async (postId: number | string) => {
		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType: ProposalType.REFERENDUM_V2 });
		if (error) console.error('Error subscribing to post', error);
		if (data) console.log(data.message);
	};

	useEffect(() => {
		if (!isModalOpen) {
			form.resetFields();
			setContent('');
			global.window.localStorage.removeItem(commentKey());
		}
	}, [isModalOpen, form]);

	const handleSave = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if (!content) return;
		setContent('');

		form.resetFields();
		form.setFieldValue('content', '');
		global.window.localStorage.removeItem(commentKey());
		post.post_id && createSubscription(post.post_id);

		try {
			const { data, error } = await nextApiClientFetch<IAddPostCommentResponse>('api/v1/auth/actions/addPostComment', {
				content,
				postId: post.post_id,
				postType: ProposalType.REFERENDUM_V2,
				sentiment: 0,
				trackNumber: post.track_no,
				userId: currentUserdata?.id
			});
			if (error || !data) {
				queueNotification({
					header: 'Failed!',
					message: error,
					status: NotificationStatus.ERROR
				});
			} else if (data) {
				queueNotification({
					header: 'Success!',
					message: 'Comment created successfully.',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.error('Error while saving comment:', error);
		} finally {
			onclose();
			setLoading(false);
		}
	};

	const { resolvedTheme: theme } = useTheme();
	return (
		<>
			<Form
				form={form}
				name='comment-content-form'
				layout='vertical'
				onFinish={handleModalOpen}
				initialValues={{
					content
				}}
				disabled={loading}
				validateMessages={{ required: "Please add the  '${name}'" }}
			>
				<div className='flex gap-4 font-poppins'>
					<div className='flex flex-col items-center gap-2   '>
						<Image
							src={post.proposerProfile?.profileimg || FIRST_VOTER_PROFILE_IMG_FALLBACK}
							alt='profile'
							className='mt-2 h-6 w-6 rounded-full xl:h-10 xl:w-10'
							width={40}
							height={40}
						/>
						<Divider
							type='vertical'
							className='h-10 rounded-sm border-l-2 border-l-[#D2D8E0] dark:border-[#4B4B4B]'
						/>
						<div>
							<Image
								src={`${currentUserdata?.image ? currentUserdata?.image : FIRST_VOTER_PROFILE_IMG_FALLBACK}`}
								alt=''
								className='mt-2 h-6 w-6 rounded-full xl:h-10 xl:w-10'
								width={40}
								height={40}
							/>
						</div>
					</div>
					<div>
						<div className='flex items-center gap-[4px]  md:gap-2 md:pt-0 '>
							<p className='pt-3 text-[12px] font-medium text-[#243A57] dark:text-white xl:text-sm'>
								{post.proposerProfile?.username ? post.proposerProfile.username : ANONYMOUS_FALLBACK}
							</p>
							<span className='xl:text-md text-[12px] text-[#485F7D] dark:text-[#9E9E9E]'>in</span>
							<TopicTag
								topic={post?.topic?.name}
								className={post?.topic?.name}
								theme={theme as any}
							/>
							<p className='pt-3 text-[#485F7D]'>|</p>
							<div className='flex '>
								<ImageIcon
									src='/assets/icons/timer.svg'
									alt='timer'
									className='mt-2 h-4 w-4 text-[#485F7D] dark:text-[#9E9E9E] md:mt-3 xl:h-5 xl:w-5'
								/>
								<p className='pt-3 text-[10px] text-gray-500 dark:text-[#9E9E9E] xl:text-sm'>{getRelativeCreatedAt(post.created_at)}</p>
							</div>
						</div>
						<span className='text-[16px] font-medium text-[#243A57] dark:text-white'>
							#{post?.post_id} {post?.title || 'Untitled Post'}
						</span>
						<p className='font-poppins text-[12px] font-light text-[#E5007A]'>Commenting on proposal</p>
						<div className='w-[90%] lg:flex-1'>
							<ContentForm
								onChange={(content: any) => onContentChange(content)}
								height={200}
							/>
						</div>
					</div>
				</div>

				<Form.Item>
					<div className=' flex items-center justify-end '>
						<div className='relative'>
							<div className='flex'>
								<Button
									disabled={!content || (typeof content === 'string' && content.trim() === '')}
									loading={loading}
									htmlType='submit'
									className={`my-0 flex h-[40px] w-[100px] items-center justify-center border-none bg-pink_primary text-white hover:bg-pink_secondary ${
										!content ? 'opacity-50' : ''
									}`}
								>
									Post
								</Button>
							</div>
						</div>
					</div>
				</Form.Item>
			</Form>
		</>
	);
};

export default PostItem;
