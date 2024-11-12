// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { ArrowRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import ExpertPostModal from './ExpertPostModal';
import NotAExpertModal from './NotAExpertModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { v4 } from 'uuid';
import { useCommentDataContext, usePostDataContext } from '~src/context';
import { IAddPostCommentResponse } from 'pages/api/v1/auth/actions/addPostComment';
import { IComment } from '../Post/Comment/Comment';
import queueNotification from '~src/ui-components/QueueNotification';
import { EExpertReqStatus, NotificationStatus } from '~src/types';
import { getSortedComments } from '../Post/Comment/CommentsContainer';
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import RejectedExpertModal from './RejectedExpertModal';
import PendingExpertModal from './PendingExpertModal';

interface ExpertStatusResponse {
	status: EExpertReqStatus;
}

function ExpertBodyCard() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [review, setReview] = useState('');
	const [reviewsCount, setReviewsCount] = useState(0);
	const [expertStatus, setIsExpert] = useState('');
	const { id, username, picture, loginAddress } = useUserDetailsSelector();
	const {
		postData: { postIndex, postType, track_number }
	} = usePostDataContext();
	const { setComments, timelines, setTimelines, comments } = useCommentDataContext();

	const address = loginAddress;

	const checkExpertStatus = useCallback(async () => {
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			try {
				const { data } = await nextApiClientFetch<ExpertStatusResponse>('api/v1/expertBody/getExpertStatus', { userAddress: substrateAddress });
				if (data?.status !== undefined) {
					setIsExpert(data.status);
				} else {
					console.error('Failed to fetch expert status:', data);
					setIsExpert('');
				}
			} catch (error) {
				console.error('Error checking expert status:', error);
				setIsExpert('');
			}
		}
	}, [address]);

	useEffect(() => {
		checkExpertStatus();
	}, [checkExpertStatus]);

	const handleCommentAndTimelineUpdate = (postId: string, type: string, comment: IComment) => {
		const key = `${postId}_${type}`;
		const updatedComments = {
			...comments,
			[key]: [...(comments[key] || []), comment]
		};
		setComments(getSortedComments(updatedComments));

		const updatedTimelines = timelines.map((timeline) => (timeline.index === postId ? { ...timeline, commentsCount: timeline.commentsCount + 1 } : timeline));
		setTimelines(updatedTimelines);
	};

	useEffect(() => {
		if (comments) {
			const validProposalType = postType as Exclude<ProposalType, ProposalType.DISCUSSIONS | ProposalType.GRANTS>;
			const subsquidProposalType = getSubsquidProposalType(validProposalType);
			const key = postIndex && postType ? `${postIndex.toString()}_${subsquidProposalType}` : null;
			const expertComments = key && comments[key] ? comments[key].filter((comment) => comment.isExpertComment) : [];
			setReviewsCount(expertComments.length);
		}
	}, [comments, postIndex, postType]);

	const handleCancel = () => {
		setIsModalVisible(false);
		setReview('');
	};

	const handleDone = async () => {
		const commentId = v4();
		const newComment: IComment = {
			comment_reactions: { '👍': { count: 0, userIds: [], usernames: [] }, '👎': { count: 0, userIds: [], usernames: [] } },
			content: review,
			created_at: new Date(),
			history: [],
			id: commentId,
			isError: false,
			isExpertComment: true,
			profile: picture || '',
			proposer: loginAddress,
			replies: [],
			sentiment: 0,
			updated_at: new Date(),
			user_id: id as any,
			username: username || ''
		};

		try {
			const { data, error } = await nextApiClientFetch<IAddPostCommentResponse>('api/v1/auth/actions/addPostComment', {
				content: review,
				isExpertComment: true,
				postId: postIndex,
				postType: postType,
				sentiment: 0,
				trackNumber: track_number,
				userId: id
			});

			if (error || !data) {
				throw new Error(error || 'Unknown error');
			}

			setComments((prev) => {
				const updatedComments = { ...prev };
				Object.keys(updatedComments).forEach((key) => {
					updatedComments[key] = updatedComments[key].map((comment: IComment) => (comment.id === commentId ? { ...comment, id: data.id } : comment));
				});
				return updatedComments;
			});

			handleCommentAndTimelineUpdate(postIndex.toString(), postType, newComment);

			queueNotification({
				header: 'Success!',
				message: 'Comment created successfully.',
				status: NotificationStatus.SUCCESS
			});
		} catch (error) {
			setComments((prev) => {
				const updatedComments = { ...prev };
				Object.keys(updatedComments).forEach((key) => {
					updatedComments[key] = updatedComments[key].map((comment: IComment) => (comment.id === commentId ? { ...comment, isError: true } : comment));
				});
				return updatedComments;
			});

			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}

		setIsModalVisible(false);
		setReview('');
	};

	const title = reviewsCount > 0 ? `Expert Review Available! (${reviewsCount})` : 'No Expert Review Available!';
	const contentText = reviewsCount > 0 ? 'Read what experts have to say about this proposal!' : 'An Expert adds their valuable review for this post!';

	return (
		<StyledCard className='mb-5 flex gap-2 p-2 dark:bg-black'>
			<div className='relative'>
				<Image
					src='/assets/badges/expert-badge.svg'
					alt={'Expert Image'}
					width={24}
					height={24}
					className='h-20 w-20'
				/>
			</div>
			<div className='flex flex-col text-[#243A57] dark:text-white'>
				<span className='text-base font-semibold'>{title}</span>
				<span className='w-52 text-sm'>{contentText}</span>
				<span className='text-sm'>
					An expert?{' '}
					<span
						className='cursor-pointer text-pink_primary underline'
						onClick={() => setIsModalVisible(true)}
					>
						Add your Review!
					</span>
				</span>
			</div>
			<div className='absolute right-2 top-8 z-50'>
				<ArrowRightOutlined
					onClick={() => setIsModalVisible(true)}
					className='rounded-full bg-black p-2 text-lg text-white dark:border dark:border-solid dark:border-white'
				/>
			</div>

			{isModalVisible &&
				(expertStatus === EExpertReqStatus.APPROVED ? (
					<ExpertPostModal
						isModalVisible={isModalVisible}
						handleCancel={handleCancel}
						handleDone={handleDone}
						review={review}
						setReview={setReview}
					/>
				) : expertStatus === EExpertReqStatus.REJECTED ? (
					<RejectedExpertModal
						isModalVisible={isModalVisible}
						handleCancel={handleCancel}
					/>
				) : expertStatus === EExpertReqStatus.PENDING ? (
					<PendingExpertModal
						isModalVisible={isModalVisible}
						handleCancel={handleCancel}
					/>
				) : (
					<NotAExpertModal
						isModalVisible={isModalVisible}
						handleCancel={handleCancel}
					/>
				))}
		</StyledCard>
	);
}

const StyledCard = styled.div`
	position: relative;
	border-radius: 10px;
	overflow: hidden;
	background: white;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 10px;
		padding: 1px;
		padding-right: 0.5px;
		background: linear-gradient(90deg, rgba(22, 119, 254, 0.6), rgba(255, 73, 170, 0.6), rgba(13, 71, 152, 0.6));
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}
`;

export default ExpertBodyCard;
