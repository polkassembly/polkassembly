// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { Button, Form, Tooltip } from 'antd';
import { IAddPostCommentResponse } from 'pages/api/v1/auth/actions/addPostComment';
import React, { FC, useEffect, useState } from 'react';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import UserAvatar from 'src/ui-components/UserAvatar';
import styled from 'styled-components';

import { ChangeResponseType } from '~src/auth/types';
import { usePostDataContext, useUserDetailsContext } from '~src/context';
import CommentSentimentModal from '~src/ui-components/CommentSentimentModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ContentForm from '../ContentForm';
import queueNotification from '~src/ui-components/QueueNotification';
import { EVoteDecisionType, NotificationStatus } from '~src/types';
import { IComment } from './Comment/Comment';
import { getSubsquidLikeProposalType } from '~src/global/proposalType';
import SadDizzyIcon from '~assets/overall-sentiment/pink-against.svg';
import SadIcon from '~assets/overall-sentiment/pink-slightly-against.svg';
import NeutralIcon from '~assets/overall-sentiment/pink-neutral.svg';
import SmileIcon from '~assets/overall-sentiment/pink-slightly-for.svg';
import SmileDizzyIcon from '~assets/overall-sentiment/pink-for.svg';
import { ESentiment } from '~src/types';

interface IPostCommentFormProps {
	className?: string;
	isUsedInSuccessModal?: boolean;
	voteDecision?: EVoteDecisionType;
	setSuccessModalOpen?: (pre: boolean) => void;
	setCurrentState?: (postId: string, type: string, comment: IComment) => void;
	posted?: boolean;
}

interface IEmojiOption {
	icon: any;
	currentSentiment: number;
	clickable?: boolean;
	disabled?: boolean;
	className?: string;
	emojiButton?: boolean;
	title?: string;
}

const commentKey = () => `comment:${global.window.location.href}`;

const PostCommentForm: FC<IPostCommentFormProps> = (props) => {
	const { className, isUsedInSuccessModal = false, voteDecision = null, setCurrentState, posted } = props;
	const { id, username, picture } = useUserDetailsContext();
	const {
		postData: { postIndex, postType, track_number }
	} = usePostDataContext();
	const [content, setContent] = useState(global.window.localStorage.getItem(commentKey()) || '');
	const [form] = Form.useForm();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [openModal, setModalOpen] = useState(false);
	const [isComment, setIsComment] = useState(false);
	const [sentiment, setSentiment] = useState<number>(3);
	const [isSentimentPost, setIsSentimentPost] = useState(false);
	const [showEmojiMenu, setShowEmojiMenu] = useState(false);
	const [selectedIcon, setSelectedIcon] = useState(null);
	// TODO: fix isPosted state
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isPosted, setIsPosted] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [formContent, setFormContent] = useState('');

	useEffect(() => {
		switch (voteDecision) {
			case EVoteDecisionType.AYE:
				setSentiment(5);
				setIsSentimentPost(true);
				break;
			case EVoteDecisionType.NAY:
				setSentiment(1);
				setIsSentimentPost(true);
				break;
			default:
				setSentiment(3);
				setIsSentimentPost(true);
				break;
		}
	}, [voteDecision]);

	useEffect(() => {
		if (posted == true) {
			setIsPosted(true);
		} else {
			setIsPosted(false);
		}
	}, [posted]);

	const handleEmojiClick = (icon: any, currentSentiment: any) => {
		setContent((prevContent) => prevContent);
		setSelectedIcon(icon);
		setShowEmojiMenu(!showEmojiMenu);
		setSentiment(currentSentiment);
		setIsSentimentPost(true);
	};

	const EmojiOption = ({ icon, currentSentiment = 3, clickable = true, disabled, emojiButton, title }: IEmojiOption) => {
		if (emojiButton) {
			return (
				<Button
					disabled={disabled}
					className={`${disabled && 'opacity-50'} emoji-button hover:bg-baby_pink mb-[4px] h-10 w-10 border-solid p-0 pt-1 text-2xl`}
					onClick={() => {
						clickable && handleEmojiClick(icon, currentSentiment);
					}}
				>
					{icon}
				</Button>
			);
		}
		return (
			<Tooltip
				color='#363636'
				title={title}
			>
				<Button
					disabled={disabled}
					className={`${disabled && 'opacity-50'} emoji-button hover:bg-baby_pink mb-[4px] h-10 w-10 rounded-full border-none p-0 pt-1 text-2xl`}
					onClick={() => {
						clickable && handleEmojiClick(icon, currentSentiment);
					}}
				>
					{icon}
				</Button>
			</Tooltip>
		);
	};

	const sentimentsIcons: any = {
		[ESentiment.Against]: <SadDizzyIcon style={{ border: 'none' }} />,
		[ESentiment.SlightlyAgainst]: <SadIcon style={{ border: 'none' }} />,
		[ESentiment.Neutral]: <NeutralIcon style={{ border: 'none' }} />,
		[ESentiment.SlightlyFor]: <SmileIcon style={{ border: 'none' }} />,
		[ESentiment.For]: <SmileDizzyIcon style={{ border: 'none' }} />
	};

	const onContentChange = (content: string) => {
		setContent(content);
		global.window.localStorage.setItem(commentKey(), content);
		return content.length ? content : null;
	};

	const createSubscription = async (postId: number | string) => {
		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType: postType });
		if (error) console.error('Error subscribing to post', error);
		if (data) console.log(data.message);
	};

	const handleModalOpen = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if (!content) return;

		// To directly post the comment without openning the slider modal
		if (isUsedInSuccessModal) {
			setIsSentimentPost(true);
			handleSave();
			return;
		}
		setModalOpen(true);
	};

	const handleSave = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		setFormContent(content);
		if (!content) return;

		setLoading(true);

		const { data, error } = await nextApiClientFetch<IAddPostCommentResponse>('api/v1/auth/actions/addPostComment', {
			content,
			postId: postIndex,
			postType: postType,
			sentiment: isSentimentPost ? sentiment : 0,
			trackNumber: track_number,
			userId: id
		});

		if (error || !data) {
			setError(error || 'No data returned from the saving comment query');
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
		if (data) {
			setContent('');
			setIsPosted(true);
			form.resetFields();
			form.setFieldValue('content', '');
			global.window.localStorage.removeItem(commentKey());
			postIndex && createSubscription(postIndex);
			queueNotification({
				header: 'Success!',
				message: 'Comment created successfully.',
				status: NotificationStatus.SUCCESS
			});
			const comment = {
				comment_reactions: {
					'👍': {
						count: 0,
						usernames: []
					},
					'👎': {
						count: 0,
						usernames: []
					}
				},
				content,
				created_at: new Date(),
				history: [],
				id: data?.id || '',
				profile: picture || '',
				replies: [],
				sentiment: isSentimentPost ? sentiment : 0,
				updated_at: new Date(),
				user_id: id as any,
				username: username || '',
				vote: voteDecision
			};
			setCurrentState && setCurrentState(postIndex.toString(), getSubsquidLikeProposalType(postType as any), comment);
		}
		setLoading(false);
		setIsComment(false);
		setIsSentimentPost(false);
	};

	useEffect(() => {
		isComment && handleSave();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isComment]);

	if (!id) return <div>You must log in to comment.</div>;

	return (
		<div className={className}>
			<UserAvatar
				className='mt-4 hidden md:inline-block'
				username={username || ''}
				size={'large'}
				id={id}
			/>
			{/* {isPosted ? (
				<div className='comment-message -mt-[4px]'>
					<div className='h-30 mt-[35px] w-[500px] overflow-hidden text-center'>
						<p className='truncate text-lightBlue'>&apos;{formContent}&apos;</p>
					</div>
					<div className='-mt-[4px] mb-5 ml-[140px] text-green-600'>Comment posted successfully.</div>
				</div>
			) : ( */}
			<div className={isUsedInSuccessModal ? 'w-[95%] p-[1rem]' : 'comment-box bg-white p-[1rem]'}>
				{error && (
					<ErrorAlert
						errorMsg={error}
						className='mb-2'
					/>
				)}
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
					<div className={isUsedInSuccessModal ? '-ml-[30px] flex w-[522px] items-center justify-between' : ''}>
						{isUsedInSuccessModal && (
							<Form.Item
								name='content'
								className='w-full'
							>
								<textarea
									name='content'
									className={
										'suffixColor input-container mt-2 max-h-10 w-full flex-1 resize-none rounded-[4px] border-[1px] text-sm hover:border-pink_primary focus:border-pink_primary'
									}
									onChange={(e) => {
										onContentChange(e.target.value);
									}}
									placeholder={'Type your comment here'}
									style={{ border: '1px solid #D2D8E0', padding: '8px 8px' }}
								/>
							</Form.Item>
						)}
						{!isUsedInSuccessModal && (
							<ContentForm
								onChange={(content: any) => onContentChange(content)}
								height={200}
							/>
						)}
						<Form.Item>
							<div className={isUsedInSuccessModal ? 'ml-2' : 'mt-[-40px] flex items-center justify-end'}>
								{isUsedInSuccessModal ? (
									<div className='relative'>
										<div className='flex'>
											{showEmojiMenu && (
												<div
													className='absolute right-[77px] top-[-55px] -mt-1 flex h-[50px] w-[234px] space-x-1 p-2 pb-12 pt-[7px]'
													style={{ background: '#FFF', border: '0.5px solid #D2D8E0', borderRadius: '6px', boxShadow: '0px 2px 14px 0px rgba(0, 0, 0, 0.06)' }}
												>
													<EmojiOption
														icon={<SadDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
														currentSentiment={1}
														title={'Completely Against'}
													/>
													<EmojiOption
														icon={<SadIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
														currentSentiment={2}
														title={'Slightly Against'}
													/>
													<EmojiOption
														icon={<NeutralIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
														currentSentiment={3}
														title={'Neutral'}
													/>
													<EmojiOption
														icon={<SmileIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
														currentSentiment={4}
														title={'Slightly For'}
													/>
													<EmojiOption
														icon={<SmileDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />}
														currentSentiment={5}
														title={'Completely For'}
													/>
												</div>
											)}
											{!selectedIcon && (
												<div
													className='mr-[7px] h-10 w-10'
													onClick={() => setShowEmojiMenu(!showEmojiMenu)}
												>
													<EmojiOption
														disabled={!content}
														emojiButton={true}
														icon={sentimentsIcons[sentiment]}
														currentSentiment={3}
														clickable={false}
													/>
												</div>
											)}
											{selectedIcon && (
												<Button
													className='mr-[7px] h-10 w-10 border-solid p-0 pt-1'
													onClick={() => setShowEmojiMenu(!showEmojiMenu)}
												>
													{selectedIcon}
												</Button>
											)}
											<Button
												disabled={!content}
												loading={loading}
												htmlType='submit'
												className={`my-0 flex h-[40px] w-[67px] items-center justify-center border-none bg-pink_primary text-white hover:bg-pink_secondary ${
													!content ? 'opacity-50' : ''
												}`}
											>
												Post
											</Button>
										</div>
									</div>
								) : (
									<Button
										disabled={!content}
										loading={loading}
										htmlType='submit'
										className={`my-0 flex items-center border-white bg-pink_primary text-white hover:bg-pink_secondary ${!content ? 'bg-gray-500 hover:bg-gray-500' : ''}`}
									>
										<CheckOutlined /> Comment
									</Button>
								)}
							</div>
						</Form.Item>
					</div>
				</Form>
			</div>
			{/* )} */}
			{openModal && (
				<CommentSentimentModal
					setSentiment={setSentiment}
					openModal={openModal}
					setModalOpen={setModalOpen}
					setIsComment={setIsComment}
					setIsSentimentPost={setIsSentimentPost}
					sentiment={sentiment}
				/>
			)}
		</div>
	);
};

export default styled(PostCommentForm)`
	display: flex;
	margin: 2rem 0;

	.comment-box {
		width: calc(100% - 60px);

		@media only screen and (max-width: 768px) {
			width: calc(100%);
			padding: 0.5rem;
		}
	}

	.button-container {
		width: 100%;
		display: flex;
		justify-content: flex-end;
	}

	.emoji-button:hover {
		background-color: #fbdbec;
	}

	.ant-tooltip {
		font-size: 16px;
	}
	.ant-tooltip .ant-tooltip-placement-leftTop {
		height: 10px;
		padding: 0px;
	}
	.ant-tooltip .ant-tooltip-inner {
		min-height: 0;
	}
	.ant-tooltip-arrow {
		display: none;
	}
	.ant-tooltip-inner {
		color: black;
		font-size: 10px;
		padding: 6px 8px;
	}
`;
