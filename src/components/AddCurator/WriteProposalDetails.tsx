// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import ContentForm from '../ContentForm';
import { useDispatch } from 'react-redux';
import AddTags from '~src/ui-components/AddTags';
import { useAddCuratorSelector } from '~src/redux/selectors';
import Input from '~src/basic-components/Input';
import { addCuratorActions } from '~src/redux/AddCurator';
import { usePostDataContext } from '~src/context';
import { useEffect } from 'react';
import AllowedCommentorsRadioButtons from '../AllowedCommentorsRadioButtons';
import { EAllowedCommentor, NotificationStatus } from '~src/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import queueNotification from '~src/ui-components/QueueNotification';

const handleErrorMsg = ({ title, content }: { title: string; content: string }) => {
	if (!title?.length) {
		return 'Proposal title is required!';
	}
	if (!content) {
		return 'Proposal content is required!';
	}
	return '';
};

const WriteProposalDetails = ({ onchangeNextStep }: { onchangeNextStep: () => void }) => {
	const dispatch = useDispatch();
	const {
		proposal: { title, content, tags },
		allowedCommentors
	} = useAddCuratorSelector();
	const {
		postData: { title: postTitle, postIndex }
	} = usePostDataContext();

	const [form] = Form.useForm();

	useEffect(() => {
		if (!postIndex) return;
		dispatch(addCuratorActions.updateBountyIndex(postIndex as number));

		if (!postTitle) return;
		dispatch(addCuratorActions.updateProposalTitle(`Propose Curator - ${postTitle}`));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postTitle, postIndex]);

	const handleSubmit = () => {
		const errorMsg = handleErrorMsg({ content, title });

		if (errorMsg) {
			queueNotification({
				header: 'Error!',
				message: errorMsg,
				status: NotificationStatus.ERROR
			});
		} else {
			onchangeNextStep();
		}
	};

	return (
		<div>
			<Form
				form={form}
				onFinish={handleSubmit}
				initialValues={{ bountyId: postIndex, content, tags, title }}
				validateMessages={{ required: "Please add the '${name}'" }}
			>
				<div className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'>
					<div>
						<label className='font-medium'>
							Bounty ID <span className='text-nay_red'>*</span>
						</label>
						<Input
							name='bountyId'
							className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							value={postIndex}
							disabled
						/>
					</div>

					<div className='mt-6 font-medium'>Write a proposal :</div>

					<div className='mt-4'>
						<label className='mb-0.5'>
							Title <span className='text-nay_red'>*</span>
						</label>
						<Form.Item
							name='title'
							rules={[
								{
									message: 'Title should not exceed 150 characters.',
									validator(rule, value, callback) {
										if (callback && value?.length > 150) {
											callback(rule?.message?.toString());
										} else {
											callback();
										}
									}
								}
							]}
						>
							<Input
								name='title'
								className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								onChange={(e) => {
									dispatch(addCuratorActions.updateProposalTitle(e.target.value));
								}}
								value={title}
							/>
						</Form.Item>
					</div>

					<div className='mt-6'>
						<label className='mb-0.5'>Add Tags</label>
						<Form.Item name='tags'>
							<AddTags
								tags={tags || []}
								setTags={(tags: string[]) => dispatch(addCuratorActions.updateProposalTags(tags))}
							/>
						</Form.Item>
					</div>

					<div className='mt-6'>
						<label className='mb-0.5'>
							Description <span className='text-nay_red'>*</span>
						</label>
						<Form.Item name='content'>
							<ContentForm
								value={content}
								height={250}
								onChange={(content: string) => dispatch(addCuratorActions.updateProposalContent(content))}
							/>
						</Form.Item>
					</div>

					{/* who can comment */}
					<AllowedCommentorsRadioButtons
						className={'-mt-2'}
						onChange={(value) => dispatch(addCuratorActions.updateAllowedCommentors(value as EAllowedCommentor))}
						allowedCommentors={allowedCommentors}
					/>
				</div>
				<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<CustomButton
						htmlType='submit'
						text='Next'
						variant='primary'
						height={40}
						width={155}
					/>
				</div>
			</Form>
		</div>
	);
};

export default WriteProposalDetails;
