// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
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
import { NotificationStatus } from '~src/types';

function ExpertBodyCard() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [review, setReview] = useState('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [reviewsCount, setReviewsCount] = useState(0);
	const [isExpert, setIsExpert] = useState(false);
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const { id, username, picture, loginAddress } = useUserDetailsSelector();
	const {
		postData: { postIndex, postType, track_number }
	} = usePostDataContext();
	const { comments, setComments } = useCommentDataContext();
	console.log('comments', comments);

	const checkExpert = async () => {
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			const { data } = await nextApiClientFetch<any>('api/v1/expertBody/getExpertAddressCheck', {
				userAddress: substrateAddress
			});

			setIsExpert(data.isExpert);
		}
	};
	useEffect(() => {
		checkExpert();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setReview('');
	};

	const handleDone = async () => {
		const commentId = v4();
		const comment = {
			comment_reactions: {
				'👍': {
					count: 0,
					userIds: [],
					usernames: []
				},
				'👎': {
					count: 0,
					userIds: [],
					usernames: []
				}
			},
			content: review,
			created_at: new Date(),
			expertComment: true,
			history: [],
			id: commentId || '',
			isError: false,
			profile: picture || '',
			proposer: loginAddress,
			replies: [],
			sentiment: 0,
			updated_at: new Date(),
			user_id: id as any,
			username: username || ''
		};

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
			console.error('API call failed:', error);
			setComments((prev) => {
				const comments: any = Object.assign({}, prev);
				for (const key of Object.keys(comments)) {
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev?.[key]?.map((comment: IComment) => {
							const newComment = comment;
							if (comment.id === commentId) {
								newComment.isError = true;
								flag = true;
							}
							return {
								...newComment
							};
						});
					}
					if (flag) {
						break;
					}
				}
				return comments;
			});
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

			setComments((prev) => {
				const comments: any = Object.assign({}, prev);
				for (const key of Object.keys(comments)) {
					let flag = false;
					if (prev?.[key]) {
						comments[key] = prev?.[key]?.map((comment: IComment) => {
							const newComment = comment;
							if (comment.id === commentId) {
								newComment.id = data.id;
								flag = true;
							}
							return {
								...newComment
							};
						});
					}
					if (flag) {
						break;
					}
				}
				return comments;
			});
			comment.id = data.id || '';
		}

		setIsModalVisible(false);
		setReview('');
	};

	const title = reviewsCount > 0 ? `Expert Review Available! (${reviewsCount})` : 'No Expert Review Available!';

	const contentText = reviewsCount > 0 ? 'Read what experts have to say about this proposal!' : 'An Expert adds their valuable review for this post!';
	return (
		<StyledCard className='mb-5 flex gap-5 p-2'>
			<div className='relative'>
				<Image
					src='/assets/badges/expert-badge.svg'
					alt={'Expert Image'}
					width={24}
					height={24}
					className='h-20 w-20'
				/>
			</div>
			<div className='flex flex-col text-[#243A57]'>
				<span className='text-base font-semibold'>{title}</span>
				<span className='w-56 text-sm'>{contentText}</span>
				<span className='text-sm'>
					An expert?{' '}
					<span
						className='cursor-pointer text-pink_primary underline'
						onClick={showModal}
					>
						Add your Review!
					</span>
				</span>
			</div>
			<div className='absolute right-2 top-8 z-50'>
				<ArrowRightOutlined
					onClick={showModal}
					className=' rounded-full bg-black p-2 text-lg text-white'
				/>
			</div>

			{isModalVisible &&
				(isExpert ? (
					<ExpertPostModal
						isModalVisible={isModalVisible}
						handleCancel={handleCancel}
						handleDone={handleDone}
						review={review}
						setReview={setReview}
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
