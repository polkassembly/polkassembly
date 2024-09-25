// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import { useEffect, useRef, useState } from 'react';
import { MessageType } from '~src/auth/types';
import Popover from '~src/basic-components/Popover';
import { ProposalType } from '~src/global/proposalType';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TooltipContent from '../Post/ActionsBar/Reactionbar/TooltipContent';
import ImageIcon from '~src/ui-components/ImageIcon';
import { EmojiOption } from './PostReactions';
const COMMENT_LABEL = 'Comment';
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
import ActivityShare from './ActivityShare';
import { Modal } from 'antd';
import { CommentModal } from './CommentModal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

const PostAction: React.FC<{ icon: JSX.Element; label: string; isMobile: boolean }> = ({ icon, label, isMobile }) => (
	<div className='flex items-center gap-2'>
		<span>{icon}</span>
		{isMobile && <p className='cursor-pointer pt-4 text-[10px] text-[#E5007A] dark:text-[#FF4098]'>{label}</p>}
		{!isMobile && <p className='hidden cursor-pointer pt-4 text-[12px] text-[#E5007A] dark:text-[#FF4098] xl:block'>{label}</p>}
	</div>
);

export const PostActions: React.FC<{
	post: any;
	reactionState: any;
	setReactionState: React.Dispatch<React.SetStateAction<any>>;
}> = ({ post, reactionState, setReactionState }) => {
	const currentUserdata = useUserDetailsSelector();
	const { post_id, track_no } = post;
	const userid = currentUserdata?.id;
	const username = currentUserdata?.username;
	const { post_reactions } = post;

	const [openLikeModal, setLikeModalOpen] = useState<boolean>(false);
	const [openDislikeModal, setDislikeModalOpen] = useState<boolean>(false);
	const [showGif, setShowGif] = useState<{ reaction: '👍' | '👎' | null }>({ reaction: null });
	const { resolvedTheme: theme } = useTheme();

	const handleReactionClick = (reaction: '👍' | '👎') => {
		if (!currentUserdata || !userid || !username) {
			if (reaction === '👍') setLikeModalOpen(true);
			if (reaction === '👎') setDislikeModalOpen(true);
			return;
		}

		const isLiked = reaction === '👍' && reactionState.userLiked;
		const isDisliked = reaction === '👎' && reactionState.userDisliked;

		setReactionState((prevState: typeof reactionState) => {
			const newState = { ...prevState };

			if (reaction === '👍') {
				if (prevState.userDisliked) {
					newState.dislikesCount -= 1;
					newState.userDisliked = false;
					post_reactions['👎'].count -= 1;
					post_reactions['👎'].usernames = post_reactions['👎'].usernames.filter((name: string) => name !== username); // Instantaneous removal of the username
				}
				newState.likesCount = isLiked ? prevState.likesCount - 1 : prevState.likesCount + 1;
				newState.userLiked = !isLiked;
				if (!isLiked) {
					if (username && !post_reactions['👍'].usernames.includes(username)) {
						post_reactions['👍'].usernames.push(username);
						post_reactions['👍'].count += 1;
					}
				} else {
					post_reactions['👍'].usernames = post_reactions['👍'].usernames.filter((name: string) => name !== username); // Instantaneous removal of the username
					post_reactions['👍'].count -= 1;
				}
			} else if (reaction === '👎') {
				if (prevState.userLiked) {
					newState.likesCount -= 1;
					newState.userLiked = false;
					post_reactions['👍'].count -= 1;
					post_reactions['👍'].usernames = post_reactions['👍'].usernames.filter((name: string) => name !== username);
				}
				newState.dislikesCount = isDisliked ? prevState.dislikesCount - 1 : prevState.dislikesCount + 1;
				newState.userDisliked = !isDisliked;
				if (!isDisliked) {
					if (username && !post_reactions['👎'].usernames.includes(username)) {
						post_reactions['👎'].usernames.push(username);
						post_reactions['👎'].count += 1;
					}
				} else {
					post_reactions['👎'].usernames = post_reactions['👎'].usernames.filter((name: string) => name !== username);
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
				<div className='mt-1 flex items-center space-x-5 md:space-x-2'>
					<div
						className='flex w-[60px] items-center justify-center'
						onClick={() => handleReactionClick('👍')}
					>
						<PostAction
							icon={
								showGif.reaction === '👍' ? (
									<Image
										src={theme === 'dark' ? '/assets/icons/reactions/Liked-Colored-Dark.gif' : '/assets/icons/reactions/Liked-Colored.gif'}
										alt='liked gif'
										className='h-4 w-4'
										width={4}
										height={4}
									/>
								) : (
									<Popover
										placement='bottomLeft'
										trigger='hover'
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
										<ImageIcon
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
										/>
									</Popover>
								)
							}
							label={reactionState.userLiked ? 'Liked' : 'Like'}
							isMobile={typeof window !== 'undefined' && window?.screen.width < 1024}
						/>
					</div>

					<div
						className='flex w-[60px] items-center justify-center md:w-[80px]' // Fixed width and centered content
						onClick={() => handleReactionClick('👎')}
					>
						<PostAction
							icon={
								showGif?.reaction === '👎' ? (
									<div className='rotate-180'>
										<Image
											src={theme === 'dark' ? '/assets/icons/reactions/Liked-Colored-Dark.gif' : '/assets/icons/reactions/Liked-Colored.gif'}
											alt='disliked gif'
											className='h-4 w-4'
											width={4}
											height={4}
										/>
									</div>
								) : (
									<Popover
										placement='bottomLeft'
										trigger='hover'
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
										<ImageIcon
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
							if (userid) {
								openModal();
							} else {
								setOpenLoginModal(true);
							}
						}}
						className='flex w-[60px] items-center justify-center pl-1 md:w-[80px]'
					>
						<PostAction
							icon={
								<ImageIcon
									src={`${theme === 'dark' ? '/assets/activityfeed/commentdark.svg' : '/assets/icons/comment-pink.svg'}`}
									alt='comment icon'
									className='h-4 w-4'
								/>
							}
							label={COMMENT_LABEL}
							isMobile={isMobile}
						/>
					</div>

					<div className='md:pl-2'>
						<ActivityShare
							title={post?.title}
							postId={post?.post_id}
							proposalType={ProposalType.REFERENDUM_V2}
						/>
					</div>
				</div>

				<div className='hidden  lg:block'>
					<div className='mt-5 flex items-center space-x-1'>
						{(post?.highestSentiment?.sentiment == 0 || post?.highestSentiment?.sentiment == 1) && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment1 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SadDizzyIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Completely Against'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 2 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment2 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SadIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Slightly Against'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 3 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment3 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<NeutralIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Neutral'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 4 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment4 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SmileIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Slightly For'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
						{post?.highestSentiment?.sentiment == 5 && (
							<EmojiOption
								icon={
									theme === 'dark' ? (
										<DarkSentiment5 style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									) : (
										<SmileDizzyIcon style={{ border: 'none', color: '#667589', transform: 'scale(1.2)' }} />
									)
								}
								title={'Completely For'}
								percentage={post?.highestSentiment?.percentage || null}
							/>
						)}
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
