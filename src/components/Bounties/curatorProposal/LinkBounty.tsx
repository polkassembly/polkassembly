// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { Form, FormInstance, Spin } from 'antd';
import AddTags from '~src/ui-components/AddTags';
import Markdown from '~src/ui-components/Markdown';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import { EAllowedCommentor, NotificationStatus } from '~src/types';
import _ from 'lodash';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import { ISteps } from '~src/components/OpenGovTreasuryProposal';
import AllowedCommentorsRadioButtons from '~src/components/AllowedCommentorsRadioButtons';
import { ProposalType } from '~src/global/proposalType';

interface Props {
	isDiscussionLinked: boolean | null;
	setIsDiscussionLinked: (pre: boolean) => void;
	discussionLink: string;
	setDiscussionLink: (pre: string) => void;
	title: string;
	content: string;
	tags: string[];
	setTitle: (pre: string) => void;
	bountyId: number | null;
	setBountyId: (pre: number | null) => void;
	setContent: (pre: string) => void;
	setTags: (pre: string[]) => void;
	setSteps: (pre: ISteps) => void;
	form: FormInstance;
	allowedCommentors?: EAllowedCommentor;
	setAllowedCommentors?: (pre: EAllowedCommentor) => void;
}

const LinkBounty = ({
	setSteps,
	isDiscussionLinked,
	discussionLink,
	setDiscussionLink,
	title,
	setTitle,
	setBountyId,
	bountyId,
	content,
	setContent,
	tags,
	setTags,
	form,
	allowedCommentors,
	setAllowedCommentors
}: Props) => {
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = async () => {
		await form.validateFields();
		setSteps({ percent: 0, step: 1 });
	};
	// const isDiscussionLinkedValid = (value: string) => {
	// const regex = /^https:\/\/\w+\.polkassembly\.io\/bounty\/\d+$/;
	// return !regex.test(value) || value.split('https://')[1].split('.')[0] !== network;
	// };

	const getDiscussionPostData = async (link: string) => {
		const regex = /^https:\/\/\w+\.polkassembly\.io\/bounty\/\d+$/;
		if (!regex.test(link)) return;

		const linkNetwork = link?.split('https://')[1]?.split('.')?.[0];
		const extractedBountyId = link.split('bounty/')[1];
		if (network !== linkNetwork) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPostResponse>(`/api/v1/posts/on-chain-post?postId=${extractedBountyId}&proposalType=${ProposalType.BOUNTIES}`);
		if (data) {
			setTitle(data.title || '');
			setContent(data.content || '');
			setTags(data?.tags || []);
			form.setFieldValue('title', data?.title || '');
			form.setFieldValue('bounty_id', data?.post_id || '');
			form.setFieldValue('content', data?.content || '');
			form.setFieldValue('tags', data?.tags || []);
			setSteps({ percent: 100, step: 0 });
			setLoading(false);
		} else if (error) {
			queueNotification({
				header: 'Failed!',
				message: 'Unable to fetch data for this discussion number.',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	const getPostDataById = async (id: number) => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPostResponse>(`/api/v1/posts/on-chain-post?postId=${id}&proposalType=${ProposalType.BOUNTIES}`);
		if (data) {
			setDiscussionLink('');
			setTitle(data.title || '');
			setContent(data.content || '');
			setTags(data?.tags || []);
			form.resetFields(['discussion_link']);
			form.setFieldValue('title', data?.title || '');
			form.setFieldValue('bounty_id', data?.post_id || '');
			form.setFieldValue('content', data?.content || '');
			form.setFieldValue('tags', data?.tags || []);
			setSteps({ percent: 100, step: 0 });
			setLoading(false);
		} else if (error) {
			queueNotification({
				header: 'Failed!',
				message: 'Unable to fetch data for this discussion number.',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	const handleChangeIsDiscussion = () => {
		setTitle('');
		setTags([]);
		setContent('');
		form.resetFields(['content', 'tags', 'title']);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const populateDiscussionPostDataFn = useCallback(_.debounce(getDiscussionPostData, 1500), []);
	const handleChangeDiscussionLink = (link: string) => {
		setDiscussionLink(link);
		handleChangeIsDiscussion();
		populateDiscussionPostDataFn(link);
		setSteps({ percent: 66.6, step: 0 });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const populateDiscussionPostByIdFn = useCallback(_.debounce(getPostDataById, 1500), []);
	const handleChangeBoundyId = (id: string) => {
		setBountyId(+id);
		setSteps({ percent: 100, step: 0 });
	};

	useEffect(() => {
		if (bountyId) {
			populateDiscussionPostByIdFn(bountyId);
		}
	}, [bountyId]);

	return (
		<>
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				<Form
					onFinish={handleSubmit}
					form={form}
					className='mt-4'
					disabled={loading}
					initialValues={{ content, discussion_link: discussionLink, tags, title }}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>Link Bounty Proposal</label>
					<Form.Item
						name='discussion_link'
						// rules={[
						// {
						// message: `Please add a valid discussion link for ${network} Network`,
						// validator(rule, value, callback) {
						// if (callback && isDiscussionLinkedValid(value)) {
						// callback(rule?.message?.toString());
						// } else {
						// callback();
						// }
						// }
						// }
						// ]}
					>
						<Input
							name='discussion_link'
							value={discussionLink}
							onChange={(e) => handleChangeDiscussionLink(e.target.value)}
							className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:placeholder-white dark:focus:border-[#91054F]'
							placeholder='https://'
						/>
					</Form.Item>
					<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>
						Bounty Id<span className='ml-1 text-nay_red'>*</span>
					</label>
					<Form.Item name='bounty_id'>
						<Input
							name='bounty_id'
							defaultValue={bountyId || ''}
							className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							onChange={(e) => handleChangeBoundyId(e.target.value)}
						/>
					</Form.Item>

					{/* {isDiscussionLinked !== null && (isDiscussionLinked ? discussionLink && !isDiscussionLinkedValid(discussionLink) && isDiscussionFound : true) && ( */}
					<div className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'>
						<label className='font-medium'>Write a proposal :</label>
						<div className='mt-4'>
							<label className='mb-0.5'>
								Title <span className='text-nay_red'>*</span>
							</label>
							<Form.Item name='title'>
								<Input
									name='title'
									className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									disabled={true}
								/>
							</Form.Item>
						</div>
						<div className='mt-6'>
							<label className='mb-0.5'>Tags</label>
							<Form.Item name='tags'>
								<AddTags
									tags={tags}
									setTags={setTags}
									disabled={true}
								/>
							</Form.Item>
						</div>
						<div className='my-6'>
							<label className='mb-0.5'>
								Description <span className='text-nay_red'>*</span>
							</label>
							{content ? (
								<Markdown
									imgHidden
									className='post-content rounded-[4px] border-[1px] border-solid border-[#dddddd] bg-[#f5f5f5] px-3 py-2 dark:bg-section-dark-overlay dark:text-blue-dark-high'
									md={`${content?.slice(0, 300)}...` || content}
								/>
							) : (
								<Input
									name='description'
									className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									disabled={true}
								/>
							)}
						</div>
					</div>
					{/* )} */}
					<AllowedCommentorsRadioButtons
						className={isDiscussionLinked ? 'mt-6 ' : '-mt-4'}
						onChange={(value: EAllowedCommentor) => setAllowedCommentors?.(value as EAllowedCommentor)}
						isLoading={loading}
						allowedCommentors={allowedCommentors || EAllowedCommentor.ALL}
					/>

					<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							htmlType='submit'
							text='Next'
							variant='primary'
							height={40}
							width={155}
							className={`${!(title && content && bountyId) && 'opacity-50'}`}
							disabled={!(title && content && bountyId)}
						/>
					</div>
				</Form>
			</Spin>
		</>
	);
};
export default styled(LinkBounty)`
	.icon-alert .ant-alert-icon {
		margin-top: -20px !important;
	}
`;
