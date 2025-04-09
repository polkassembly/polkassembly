// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddTags from '~src/ui-components/AddTags';
import { useChildBountyCreationSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import AllowedCommentorsRadioButtons from '../AllowedCommentorsRadioButtons';
import { childBountyCreationActions } from '~src/redux/childBountyCreation';
import { EChildBountySteps } from './types';
import Alert from '~src/basic-components/Alert';
import MarkdownEditor from '../Editor/MarkdownEditor';

interface Props {
	className?: string;
	setStep: (pre: EChildBountySteps) => void;
}
const WriteChildBounty = ({ setStep, className }: Props) => {
	const useChildBountyStore = useChildBountyCreationSelector();
	const dispatch = useDispatch();
	const [form] = Form.useForm();
	const { title, content, categories, allowedCommentors, link } = useChildBountyStore;

	const handleSubmit = async () => {
		dispatch(childBountyCreationActions.updateFirstStepPercentage(100));
		setStep(EChildBountySteps.CREATE_CHILDBOUNTY);
	};

	return (
		<div className={className}>
			<Form
				form={form}
				onFinish={handleSubmit}
				initialValues={{ content, link, tags: categories, title }}
				validateMessages={{ required: "Please add the '${name}'" }}
			>
				<div className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'>
					{!!link?.length && !link?.startsWith('https:') && (
						<Alert
							showIcon
							type='info'
							message={<div>Invalid Link Parameter.</div>}
						/>
					)}
					<section className='mt-4'>
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
									dispatch(childBountyCreationActions.updateFirstStepPercentage(e.target.value?.length === 0 ? 83.33 : 100));
									dispatch(childBountyCreationActions.setTitle(e?.target?.value?.trim()));
								}}
								value={title}
							/>
						</Form.Item>
					</section>
					<section className='mt-6'>
						<label className='mb-0.5'>Link</label>
						<Form.Item name='link'>
							<Input
								name='link'
								className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								onChange={(e) => {
									dispatch(childBountyCreationActions.setLink(e?.target?.value?.trim()));
								}}
								value={link}
								placeholder='eg:https://polkadot.polkassembly.io'
							/>
						</Form.Item>
					</section>
					<section className='mt-6'>
						<label className='mb-0.5'>Categories</label>
						<Form.Item name='tags'>
							<AddTags
								tags={categories}
								setTags={(tags: string[]) => {
									dispatch(childBountyCreationActions.setCategories(tags || []));
								}}
							/>
						</Form.Item>
					</section>
					<section className='mt-6'>
						<label className='mb-0.5'>
							Description <span className='text-nay_red'>*</span>
						</label>

						<Form.Item name='content'>
							<MarkdownEditor
								value={content}
								height={250}
								onChange={(content: string) => {
									dispatch(childBountyCreationActions.setContent(content?.trim()));
									dispatch(childBountyCreationActions.updateFirstStepPercentage(content.length === 0 ? 83.33 : 100));
								}}
							/>
						</Form.Item>
					</section>
				</div>

				{/* who can comment */}
				<AllowedCommentorsRadioButtons
					className={'-mt-8'}
					onChange={(value) => dispatch(childBountyCreationActions.setAllowedCommentors(value))}
					allowedCommentors={allowedCommentors}
				/>
				<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<CustomButton
						htmlType='submit'
						text='Next'
						variant='primary'
						height={40}
						width={155}
						className={`${(!title || !content || (!!link?.length && !link?.startsWith('https:'))) && 'opacity-50'}`}
						disabled={!title || !content || (!!link?.length && !link?.startsWith('https:'))}
					/>
				</div>
			</Form>
		</div>
	);
};

export default WriteChildBounty;
