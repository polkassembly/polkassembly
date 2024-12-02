// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Form } from 'antd';
import { useTheme } from 'next-themes';
import { IAddPostCommentResponse } from 'pages/api/v1/auth/actions/addPostComment';
import { useState } from 'react';
import { ProposalType } from '~src/global/proposalType';
import { NotificationStatus } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import queueNotification from '~src/ui-components/QueueNotification';
import TopicTag from '~src/ui-components/TopicTag';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ContentForm from '../ContentForm';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import NameLabel from '~src/ui-components/NameLabel';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ImageComponent from '../ImageComponent';

export const ActivityFeedCommentModal: React.FC<{ post: any; onclose: () => void }> = ({ post, onclose }: { post: any; onclose: () => void }) => {
	const { resolvedTheme: theme } = useTheme();
	const currentUserdata = useUserDetailsSelector();
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

	// const createSubscription = async (postId: number | string) => {
	// const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType: ProposalType.REFERENDUM_V2 });
	// if (error) console.error('Error subscribing to post', error);
	// if (data) console.log(data.message);
	// };

	const handleSave = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if (!content) return;
		setLoading(true);

		setContent('');
		form.resetFields();
		global.window.localStorage.removeItem(commentKey());

		if (post?.post_id) {
			// await createSubscription(post.post_id);
		}

		try {
			const { data, error } = await nextApiClientFetch<IAddPostCommentResponse>('api/v1/auth/actions/addPostComment', {
				content,
				postId: post?.post_id,
				postType: ProposalType.REFERENDUM_V2,
				sentiment: 0,
				trackNumber: post?.track_no,
				userId: currentUserdata?.id
			});
			if (error || !data) {
				queueNotification({
					header: 'Failed!',
					message: error,
					status: NotificationStatus.ERROR
				});
			} else {
				queueNotification({
					header: 'Success!',
					message: 'Comment created successfully.',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.error('Error while saving comment:', error);
		} finally {
			setLoading(false);
			onCloseHandler();
		}
	};

	const onCloseHandler = () => {
		form.resetFields();
		setContent('');
		global.window.localStorage.removeItem(commentKey());
		onclose();
	};

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
				<div className='flex gap-4 pt-4 font-dmSans md:pt-0'>
					<div className='flex flex-col items-center gap-2   '>
						<ImageComponent
							className='mt-1 hidden flex-none md:inline-block'
							src={''}
							alt='user-avatar'
						/>
						<Divider
							type='vertical'
							className='h-10 rounded-sm border-l-2 border-l-[#D2D8E0] dark:border-[#4B4B4B]'
						/>
						<div>
							<ImageComponent
								className='mt-1 hidden flex-none md:inline-block'
								src={currentUserdata?.picture || ''}
								alt='user-avatar'
							/>
						</div>
					</div>
					<div>
						<div className='flex items-center gap-[4px]  md:gap-2 md:pt-0 '>
							<NameLabel
								defaultAddress={post?.proposer}
								username={post?.proposerProfile?.username}
								truncateUsername={true}
								usernameClassName='text-xs text-ellipsis overflow-hidden'
							/>
							<span className='xl:text-md text-[12px] text-blue-light-medium dark:text-[#9E9E9E]'>in</span>
							<TopicTag
								topic={post?.topic?.name}
								className='m-0 p-0 text-[10px]'
								theme={theme as any}
							/>
							<p className='pt-3 text-blue-light-medium'>|</p>
							<div className='flex gap-[2px]'>
								<ImageIcon
									src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
									alt='timer'
									className=' h-4 w-4 pt-1 text-blue-light-medium dark:text-[#9E9E9E] md:pt-[8px] xl:h-5 xl:w-5'
								/>
								<p className='whitespace-nowrap pt-2 text-[10px] text-blue-light-medium dark:text-[#9E9E9E] md:pt-3 xl:text-[12px]'>{getRelativeCreatedAt(post?.created_at)}</p>
							</div>
						</div>
						<span className='text-[16px] font-medium text-[#243A57] dark:text-white'>
							#{post?.post_id} {post?.title || 'Untitled Post'}
						</span>
						<p className='font-dmSans text-[12px]  font-medium text-pink_primary'>Commenting on proposal</p>
						<div className='w-[250px] md:w-[500px]  md:flex-1'>
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
									className={`my-0 flex h-[40px] w-[100px] items-center justify-center border-none bg-pink_primary font-semibold text-white hover:bg-pink_secondary ${
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
