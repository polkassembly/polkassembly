// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from '~src/ui-components/Markdown';
import ImageIcon from '~src/ui-components/ImageIcon';
import Link from 'next/link';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Divider, Modal } from 'antd';
import { EAllowedCommentor, ILastVote } from '~src/types';
import { ProposalType } from '~src/global/proposalType';
import dynamic from 'next/dynamic';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { PostHeader } from './PostHeader';
import { CommentModal } from './CommentModal';
import { PostReactions } from './PostReactions';
import { PostActions } from './PostActions';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useApiContext } from '~src/context';
import { BN } from 'bn.js';
import _ from 'lodash';
import Skeleton from '~src/basic-components/Skeleton';
import Alert from '~src/basic-components/Alert';
import getCommentDisabledMessage from '../Post/Comment/utils/getCommentDisabledMessage';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';

const ZERO = new BN(0);

const VoteReferendumModal = dynamic(() => import('../Post/GovernanceSideBar/Referenda/VoteReferendumModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const NO_CONTENT_FALLBACK = 'No content available for this post.';
const FIRST_VOTER_PROFILE_IMG_FALLBACK = '/assets/rankcard3.svg';
const COMMENT_PLACEHOLDER = 'Type your comment here';
const POST_LABEL = 'Post';

const PostItem: React.FC<any> = ({ post }: { post: any }) => {
	const currentUserdata = useUserDetailsSelector();
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const fullContent = post?.summary || NO_CONTENT_FALLBACK;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [updateTally, setUpdateTally] = useState<boolean>(false);
	const onAccountChange = (address: string) => setAddress(address);
	const { api, apiReady } = useApiContext();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [identity, setIdentity] = useState<boolean>(true);
	const { network } = useNetworkSelector();
	const { post_reactions } = post;
	const { resolvedTheme: theme } = useTheme();
	const handleIdentityInfo = async () => {
		if (!api || !currentUserdata?.addresses || !apiReady) return;

		const verifiedInfoPromises = currentUserdata.addresses.map(async (address) => {
			const info = await getIdentityInformation({
				address,
				api,
				network
			});
			return info;
		});

		const identities = await Promise.all(verifiedInfoPromises);

		const verifiedIdentity = identities.some((info) => info?.isVerified);
		setIdentity(verifiedIdentity);
	};

	useEffect(() => {
		if (currentUserdata?.addresses) {
			handleIdentityInfo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUserdata, apiReady, api, network]);

	const allowedCommentorsFromPost = post?.allowedCommentors || EAllowedCommentor.ALL;
	const isUserNotAllowedToComment = allowedCommentorsFromPost === EAllowedCommentor.NONE || (allowedCommentorsFromPost === EAllowedCommentor.ONCHAIN_VERIFIED && !identity);
	const reasonForNoComment = getCommentDisabledMessage(allowedCommentorsFromPost, identity);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [reactionState, setReactionState] = useState({
		dislikesCount: post_reactions?.['👎']?.count || 0,
		dislikesImages: [],
		dislikesUserIds: post_reactions?.['👎']?.userIds || [],
		dislikesUsernames: post_reactions?.['👎']?.usernames || [],
		likesCount: post_reactions?.['👍']?.count || 0,
		likesImages: [],
		likesUserIds: post_reactions?.['👍']?.userIds || [],
		likesUsernames: post_reactions?.['👍']?.usernames || [],
		userDisliked: post_reactions?.['👎']?.usernames?.includes(currentUserdata?.username) || false,
		userLiked: post_reactions?.['👍']?.usernames?.includes(currentUserdata?.username) || false
	});

	const [tallyData, setTallyData] = useState({
		ayes: post?.tally?.ayes ? (String(post?.tally?.ayes).startsWith('0x') ? new BN(post?.tally?.ayes.slice(2), 'hex') : new BN(post?.tally?.ayes)) : ZERO,
		nays: post?.tally?.nays ? (String(post?.tally?.nays).startsWith('0x') ? new BN(post?.tally?.nays.slice(2), 'hex') : new BN(post?.tally?.nays)) : ZERO,
		support: post?.tally?.support ? (String(post?.tally?.support).startsWith('0x') ? new BN(post?.tally?.support.slice(2), 'hex') : new BN(post?.tally?.support)) : ZERO
	});

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

		try {
			const referendumInfoOf = await api?.query?.referenda?.referendumInfoFor(post?.post_id);
			const parsedReferendumInfo: any = referendumInfoOf?.toJSON();
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
				setIsLoading(false);
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex'),
					support: new BN(tally?.support || 0, 'hex')
				});
				setIsLoading(false);
			}
		} catch (err) {
			setTallyData({
				ayes: new BN(tally?.ayes || 0, 'hex'),
				nays: new BN(tally?.nays || 0, 'hex'),
				support: new BN(tally?.support || 0, 'hex')
			});
			setIsLoading(false);
		}
	};
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
			postId: post?.post_id,
			proposalType: ProposalType.REFERENDUM_V2
		});

		if (data) {
			handleTallyData(data?.tally);
		} else if (error) {
			console.log(error);
		}
		setIsLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceTallyData = useCallback(_.debounce(handleSummaryReload, 10000), [updateTally]);
	// eslint-disable-next-line react-hooks/exhaustive-deps

	useEffect(() => {
		setIsLoading(true);
		handleDebounceTallyData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateTally]);

	return (
		<div className='hover:scale-30 rounded-2xl border-[0.6px] border-solid border-[#D2D8E0] bg-white  px-5 pb-6 pt-5 font-poppins  hover:shadow-md dark:border-solid dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:px-7'>
			{isLoading ? (
				<>
					<Skeleton active />
				</>
			) : (
				<>
					<PostHeader
						post={post}
						tallyData={tallyData}
						updateTally={updateTally}
						setUpdateTally={setUpdateTally}
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
						{(reactionState.likesCount > 0 || reactionState.dislikesCount > 0 || post?.commentsCount > 0) && (
							<PostReactions
								reactionState={reactionState}
								post={post}
							/>
						)}
					</Link>
					<Divider
						className={`m-0 rounded-lg border-[0.6px] border-solid border-[#D2D8E0] p-0 dark:border-[#4B4B4B] ${
							reactionState.likesCount === 0 && reactionState.dislikesCount === 0 && post?.commentsCount === 0 ? 'mt-3' : ''
						}`}
					/>
					<PostActions
						post={post}
						reactionState={reactionState}
						setReactionState={setReactionState}
						isUserNotAllowedToComment={isUserNotAllowedToComment}
					/>
					<PostCommentSection
						post={post}
						reasonForNoComment={reasonForNoComment}
						isUserNotAllowedToComment={isUserNotAllowedToComment}
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
							<ImageIcon
								src='/assets/Vote.svg'
								alt=''
								className='m-0 h-6 w-6 p-0'
							/>
							<p className='cursor-pointer pt-3 font-medium'> {!lastVote ? 'Cast Vote' : 'Cast Vote Again'}</p>
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
							setUpdateTally={setUpdateTally}
							updateTally={updateTally}
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
			)}
		</div>
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
			<p className='xl:text-md pt-2 text-[15px] font-semibold text-[#243A57] dark:text-white'>
				#{post?.post_id} {post?.title || 'Untitled Post'}
			</p>
			<Markdown
				className='xl:text-md text-[14px] text-[#243A57]'
				md={trimmedContentForComment}
			/>
			<Link
				className='flex cursor-pointer gap-1 text-[12px] font-medium text-[#E5007A] hover:underline'
				href={`/referenda/${post?.post_id}`}
			>
				Read More{' '}
				<ImageIcon
					src='/assets/more.svg'
					alt=''
					className='-mt-0.5 h-4 w-4'
				/>
			</Link>
		</>
	);
};

const PostCommentSection: React.FC<{ post: any; reasonForNoComment: any; isUserNotAllowedToComment: any }> = ({ post, reasonForNoComment, isUserNotAllowedToComment }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const currentUserdata = useUserDetailsSelector();
	const userid = currentUserdata?.id;
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const commentKey = () => `comment:${typeof window !== 'undefined' ? window.location.href : ''}`;
	const modalWrapperRef = useRef<HTMLDivElement>(null);
	const { resolvedTheme: theme } = useTheme();
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const openModal = () => {
		if (userid) {
			setIsModalOpen(true);
		} else {
			setOpenLoginModal(true);
		}
	};

	const closeModal = () => {
		global.window.localStorage.removeItem(commentKey());
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isModalOpen]);

	return (
		<div className='mt-1 flex items-center'>
			{isUserNotAllowedToComment ? (
				<Alert
					message={<span className='mb-10 dark:text-blue-dark-high'>{reasonForNoComment}</span>}
					type='info'
					showIcon
				/>
			) : (
				<>
					{!isMobile && (
						<ImageIcon
							src={`${currentUserdata?.picture ? currentUserdata?.picture : FIRST_VOTER_PROFILE_IMG_FALLBACK}`}
							alt=''
							className='h-6 w-6 rounded-full xl:h-10 xl:w-10'
						/>
					)}

					<input
						ref={inputRef}
						type='text'
						value={''}
						placeholder={COMMENT_PLACEHOLDER}
						className={` h-9 w-full rounded-l-lg border-y border-l border-r-0 border-solid border-[#D2D8E0] p-2 outline-none dark:border dark:border-solid dark:border-[#4B4B4B] md:p-2 ${
							!isMobile ? 'ml-3' : ''
						}`}
						onClick={openModal}
					/>
					<button
						onClick={openModal}
						className='h-9 w-28 cursor-pointer rounded-r-lg  border border-solid border-[#D2D8E0] bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57] dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#262627] dark:text-white'
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
								className='z-50 w-[90%] lg:w-[650px]'
							>
								<div
									className='w-[90%] lg:w-[600px]'
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
				</>
			)}
		</div>
	);
};

export default PostItem;
