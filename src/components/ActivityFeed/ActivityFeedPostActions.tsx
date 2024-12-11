// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import { useEffect, useRef, useState } from 'react';
import { MessageType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import { EmojiOption } from './ActivityFeedPostReactions';
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
import ActivityFeedShare from './ActivityFeedShare';
import { Modal } from 'antd';
import { ActivityFeedCommentModal } from './ActivityFeedCommentModal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import Popover from '~src/basic-components/Popover';
import _ from 'lodash';
import Link from 'next/link';
import ImageComponent from '../ImageComponent';
import { dmSans } from 'pages/_app';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';

export const ActivityFeedPostActions: React.FC<{
	post: any;
	reactionState: any;
	isUserNotAllowedToComment: boolean;
	setReactionState: React.Dispatch<React.SetStateAction<any>>;
}> = ({
	post,
	reactionState,
	setReactionState,
	isUserNotAllowedToComment
}: {
	post: any;
	reactionState: any;
	isUserNotAllowedToComment: boolean;
	setReactionState: React.Dispatch<React.SetStateAction<any>>;
}) => {
	const { t } = useTranslation('common');
	const currentUserdata = useUserDetailsSelector();
	const { post_id, track_no } = post;
	const userid = currentUserdata?.id;
	const username = currentUserdata?.username;
	const { post_reactions } = post;
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openLikeModal, setLikeModalOpen] = useState<boolean>(false);
	const [openDislikeModal, setDislikeModalOpen] = useState<boolean>(false);
	const [showGif, setShowGif] = useState<{ reaction: '👍' | '👎' | null }>({ reaction: null });
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();

	const renderUsernames = (reaction: '👍' | '👎') => {
		const usernames = reaction === '👍' ? reactionState?.likesUsernames : reactionState?.dislikesUsernames;
		const userImages = reaction === '👍' ? reactionState?.likesImages : reactionState?.dislikesImages;

		return usernames?.length ? (
			<div className={classNames('max-h-24 w-min overflow-y-auto pt-1', dmSans.className, dmSans.variable)}>
				{usernames?.map((name: string, index: number) => (
					<Link
						href={`https://${network}.polkassembly.io/user/${name}`}
						key={index}
						target='_blank'
						className='mb-[6px] flex items-center gap-[6px]'
					>
						<ImageComponent
							src={userImages && userImages[index] && userImages[index]}
							alt='User Picture'
							className='flex h-[20px] w-[20px] items-center justify-center bg-transparent'
							iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
						/>
						<span className='text-sm text-gray-600 dark:text-gray-300'>{name}</span>
					</Link>
				))}
			</div>
		) : (
			<p className='pt-2 text-sm text-gray-400 dark:text-gray-500'>{t('no_reactions_yet')}</p>
		);
	};

	const handleReactionClick = async (reaction: '👍' | '👎') => {
		if (!currentUserdata || !userid || !username) {
			if (reaction === '👍') setLikeModalOpen(true);
			if (reaction === '👎') setDislikeModalOpen(true);
			return;
		}

		const isLiked = reaction === '👍' && reactionState?.userLiked;
		const isDisliked = reaction === '👎' && reactionState?.userDisliked;

		const fetchAndUpdateImage = async (userId: number) => {
			const { data } = await nextApiClientFetch<UserProfileImage[]>('api/v1/auth/data/getUsersProfileImages', { userIds: [userId] });
			return data?.[0]?.image;
		};

		setReactionState((prevState: any) => {
			const newState = { ...prevState };
			if (reaction === '👍') {
				if (!post_reactions['👍']?.images) {
					post_reactions['👍'].images = [];
				}
				if (prevState.userDisliked) {
					newState.dislikesCount -= 1;
					newState.userDisliked = false;
					post_reactions['👎'].count -= 1;
					post_reactions['👎'].userIds = post_reactions['👎'].userIds?.filter((id: number) => id !== userid);
					post_reactions['👎'].usernames = post_reactions['👎'].usernames?.filter((name: string) => name !== username);
					post_reactions['👎'].images = post_reactions['👎'].images?.filter((img: string, idx: number) => post_reactions['👎'].usernames[idx] !== username);
				}
				newState.likesCount = isLiked ? prevState.likesCount - 1 : prevState.likesCount + 1;
				newState.userLiked = !isLiked;

				if (!isLiked) {
					if (username && !post_reactions['👍']?.usernames?.includes(username)) {
						fetchAndUpdateImage(userid).then((image) => {
							post_reactions['👍'].usernames.push(username);
							post_reactions['👍'].userIds.push(userid);
							post_reactions['👍'].images.push(image);
							post_reactions['👍'].count += 1;

							setReactionState({
								...newState,
								dislikesImages: post_reactions['👎'].images,
								dislikesUsernames: post_reactions['👎'].usernames,
								likesImages: post_reactions['👍'].images,
								likesUsernames: post_reactions['👍'].usernames
							});
						});
					}
				} else {
					post_reactions['👍'].usernames = post_reactions['👍']?.usernames?.filter((name: string) => name !== username);
					post_reactions['👍'].userIds = post_reactions['👍']?.userIds?.filter((id: number) => id !== userid);
					post_reactions['👍'].images = post_reactions['👍']?.images?.filter((img: string, idx: number) => post_reactions['👍'].usernames[idx] !== username);
					post_reactions['👍'].count -= 1;

					setReactionState({
						...newState,
						dislikesImages: post_reactions['👎']?.images,
						dislikesUsernames: post_reactions['👎']?.usernames,
						likesImages: post_reactions['👍']?.images,
						likesUsernames: post_reactions['👍']?.usernames
					});
				}
			} else if (reaction === '👎') {
				if (!post_reactions['👎'].images) {
					post_reactions['👎'].images = [];
				}
				if (prevState.userLiked) {
					newState.likesCount -= 1;
					newState.userLiked = false;
					post_reactions['👍'].count -= 1;
					post_reactions['👍'].userIds = post_reactions['👍']?.userIds?.filter((id: number) => id !== userid);
					post_reactions['👍'].usernames = post_reactions['👍']?.usernames?.filter((name: string) => name !== username);
					post_reactions['👍'].images = post_reactions['👍']?.images?.filter((img: string, idx: number) => post_reactions['👍'].usernames[idx] !== username);
				}
				newState.dislikesCount = isDisliked ? prevState.dislikesCount - 1 : prevState.dislikesCount + 1;
				newState.userDisliked = !isDisliked;
				if (!isDisliked) {
					if (username && !post_reactions['👎'].usernames.includes(username)) {
						fetchAndUpdateImage(userid).then((image) => {
							post_reactions['👎'].usernames.push(username);
							post_reactions['👎'].userIds.push(userid);
							post_reactions['👎'].images.push(image);
							post_reactions['👎'].count += 1;

							setReactionState({
								...newState,
								dislikesImages: post_reactions['👎']?.images,
								dislikesUsernames: post_reactions['👎']?.usernames,
								likesImages: post_reactions['👍']?.images,
								likesUsernames: post_reactions['👍']?.usernames
							});
						});
					}
				} else {
					post_reactions['👎'].usernames = post_reactions['👎']?.usernames?.filter((name: string) => name !== username);
					post_reactions['👎'].userIds = post_reactions['👎']?.userIds?.filter((id: number) => id !== userid);
					post_reactions['👎'].images = post_reactions['👎']?.images?.filter((img: string, idx: number) => post_reactions['👎'].usernames[idx] !== username);
					post_reactions['👎'].count -= 1;

					setReactionState({
						...newState,
						dislikesImages: post_reactions['👎']?.images,
						dislikesUsernames: post_reactions['👎']?.usernames,
						likesImages: post_reactions['👍']?.images,
						likesUsernames: post_reactions['👍']?.usernames
					});
				}
			}

			return {
				...newState,
				dislikesUsernames: post_reactions['👎']?.usernames,
				likesUsernames: post_reactions['👍']?.usernames
			};
		});

		if ((reaction === '👍' && !isLiked) || (reaction === '👎' && !isDisliked)) {
			setShowGif({ reaction });
			setTimeout(() => setShowGif({ reaction: null }), 1000);
		}

		_.debounce(async () => {
			const actionName = `${isLiked || isDisliked ? 'remove' : 'add'}PostReaction`;
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
		}, 200)();
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const modalWrapperRef = useRef<HTMLDivElement>(null);

	const openModal = () => {
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
	};

	const renderSentimentIcon = (sentiment: number) => {
		const sentimentIcons: Record<number, React.ReactNode> = {
			0: theme === 'dark' ? <DarkSentiment1 /> : <SadDizzyIcon />,
			1: theme === 'dark' ? <DarkSentiment1 /> : <SadDizzyIcon />,
			2: theme === 'dark' ? <DarkSentiment2 /> : <SadIcon />,
			3: theme === 'dark' ? <DarkSentiment3 /> : <NeutralIcon />,
			4: theme === 'dark' ? <DarkSentiment4 /> : <SmileIcon />,
			5: theme === 'dark' ? <DarkSentiment5 /> : <SmileDizzyIcon />
		};

		return sentimentIcons[sentiment] || null;
	};
	const percentage = Math.min(post.highestSentiment?.percentage || 0, 100);
	const sentimentLevels = [
		{ threshold: 20, title: 'Completely Against' },
		{ threshold: 40, title: 'Slightly Against' },
		{ threshold: 60, title: 'Neutral' },
		{ threshold: 80, title: 'Slightly For' },
		{ threshold: 100, title: 'Completely For' }
	];

	const sentimentTitle = sentimentLevels.find((level) => percentage <= level.threshold)?.title || 'Completely For';
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
	return (
		<>
			<div className='flex justify-between'>
				<div className='-mt-1 flex items-center space-x-5 md:space-x-2'>
					<div
						onClick={() => handleReactionClick('👍')}
						className='flex w-[60px] cursor-pointer items-center justify-center transition-transform hover:scale-105'
					>
						<Popover
							placement='bottom'
							trigger='hover'
							content={<> {renderUsernames('👍')}</>}
							arrow={true}
						>
							<div className='flex items-center gap-2'>
								<span style={{ height: '12px', width: '15px' }}>
									{' '}
									{showGif.reaction === '👍' ? (
										<Image
											src={theme === 'dark' ? '/assets/icons/reactions/Liked-Colored-Dark.gif' : '/assets/icons/reactions/Liked-Colored.gif'}
											alt='liked gif'
											className='-ml-2 -mt-2 h-9 w-9'
											width={36}
											height={36}
										/>
									) : (
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
											className='h-9 w-9 cursor-pointer'
										/>
									)}
								</span>
								<p className='cursor-pointer pt-3 text-[10px] text-pink_primary dark:text-[#FF4098] md:pt-4 md:text-[12px]'>{reactionState.userLiked ? t('liked') : t('like')}</p>
							</div>
						</Popover>
					</div>

					<div
						className='flex w-[60px] cursor-pointer items-center justify-center transition-transform hover:scale-105 md:w-[80px]'
						onClick={() => handleReactionClick('👎')}
					>
						<Popover
							placement='bottom'
							trigger='hover'
							content={<> {renderUsernames('👎')}</>}
							arrow={true}
						>
							<div className='flex items-center gap-2'>
								<span style={{ height: '20px', width: '15px' }}>
									{showGif.reaction === '👎' ? (
										<div>
											<Image
												src={theme === 'dark' ? '/assets/icons/reactions/Liked-Colored-Dark.gif' : '/assets/icons/reactions/Liked-Colored.gif'}
												alt='disliked gif'
												className='-ml-2 -mt-2 h-9 w-9'
												width={4}
												style={{ height: '24px', transform: 'scaleX(-1) rotate(180deg)', width: '24px' }}
												height={4}
											/>
										</div>
									) : (
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
											className='mt-1 h-4 w-4'
										/>
									)}
								</span>
								<p className='cursor-pointer pt-3 text-[10px] text-pink_primary dark:text-[#FF4098] md:pt-4 md:text-[12px]'>
									{reactionState.userDisliked ? t('disliked') : t('dislike')}
								</p>
							</div>
						</Popover>
					</div>

					<div
						onClick={() => {
							if (!isUserNotAllowedToComment) {
								if (userid) {
									openModal();
								} else {
									setOpenLoginModal(true);
								}
							}
						}}
						className={`flex w-[60px] items-center justify-center pl-1 transition-transform ${
							!isUserNotAllowedToComment ? 'hover:scale-105' : 'cursor-not-allowed opacity-80'
						} md:w-[80px]`}
					>
						<div className='flex cursor-pointer items-center gap-2'>
							<span>
								<ImageIcon
									src={`${theme === 'dark' ? '/assets/activityfeed/commentdark.svg' : '/assets/icons/comment-pink.svg'}`}
									alt='comment icon'
									className='-mt-1 mr-1 h-4 w-4 dark:mr-0 dark:mt-1'
								/>
							</span>
							<p className='pt-3 text-[10px] text-pink_primary dark:text-[#FF4098] md:pt-4 md:text-[12px]'>{t('comment_placeholder')}</p>
						</div>
					</div>

					<div className='transition-transform hover:scale-105 md:pl-2'>
						<ActivityFeedShare
							title={post?.title}
							postId={post?.post_id}
							proposalType={ProposalType.REFERENDUM_V2}
						/>
					</div>
				</div>

				<div className='hidden  lg:block'>
					<div className='mt-5 flex items-center space-x-1'>
						{post.highestSentiment?.sentiment >= 0 && (
							<EmojiOption
								icon={renderSentimentIcon(post.highestSentiment.sentiment)}
								title={sentimentTitle}
								percentage={percentage}
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
							<ActivityFeedCommentModal
								post={post}
								onclose={closeModal}
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
