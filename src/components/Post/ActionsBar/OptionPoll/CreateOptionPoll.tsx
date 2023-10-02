// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuditOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select } from 'antd';
import { ICreatePollResponse } from 'pages/api/v1/auth/actions/createPoll';
import React, { FC, useState } from 'react';
import { IOptionPoll, NotificationStatus } from 'src/types';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';

import { usePostDataContext } from '~src/context';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface ICreatePollProps {
	postId: number | string;
	proposalType: ProposalType;
}

const daysOptions: React.ReactElement[] = [];
const hoursOptions: React.ReactElement[] = [];
const minutesOptions: React.ReactElement[] = [];

for (let i = 0; i < 59; i++) {
	if (i < 10) {
		daysOptions.push(
			<Select.Option
				key={i + 1}
				value={i + 1}
			>
				{i + 1}
			</Select.Option>
		);
	}

	if (i < 23) {
		hoursOptions.push(
			<Select.Option
				key={i + 1}
				value={i + 1}
			>
				{i + 1}
			</Select.Option>
		);
	}

	minutesOptions.push(
		<Select.Option
			key={i + 1}
			value={i + 1}
		>
			{i + 1}
		</Select.Option>
	);
}

const CreatePoll: FC<ICreatePollProps> = (props) => {
	const { postId, proposalType } = props;
	const [showModal, setShowModal] = useState(false);
	const [formDisabled, setFormDisabled] = useState(false);
	const [form] = Form.useForm();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { setPostData } = usePostDataContext();

	const handleCreate = async () => {
		try {
			await form.validateFields();
			// Validation is successful
			const question = form.getFieldValue('question');
			const options = form.getFieldValue('options');
			const days = form.getFieldValue('days') || 1;
			const hours = form.getFieldValue('hours') || 0;
			const minutes = form.getFieldValue('minutes') || 0;

			const endAt = Math.round(Date.now() / 1000) + days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;

			setLoading(true);
			const { data, error: apiError } = await nextApiClientFetch<ICreatePollResponse>('api/v1/auth/actions/createPoll', {
				endAt,
				options: JSON.stringify(options),
				pollType: POLL_TYPE.OPTION,
				postId,
				proposalType,
				question
			});

			if (apiError || !data) {
				queueNotification({
					header: 'Error!',
					message: 'There was an error in creating the poll :(',
					status: NotificationStatus.ERROR
				});
				console.error('Error creating poll', apiError);
				setError(apiError || 'Error in creating poll');
			}

			if (data) {
				setError('');
				setShowModal(false);
				form.resetFields();
				queueNotification({
					header: 'Success!',
					message: 'Poll Created',
					status: NotificationStatus.SUCCESS
				});
				setPostData((prev) => {
					const newOptionPolls: IOptionPoll[] = [];
					const date = new Date();
					const optionPoll: IOptionPoll = {
						created_at: date,
						end_at: endAt,
						id: data.id,
						option_poll_votes: [],
						options: options,
						question: question || '',
						updated_at: date
					};
					if (prev.optionPolls && Array.isArray(prev.optionPolls)) {
						newOptionPolls.push(...prev.optionPolls, optionPoll);
					} else {
						newOptionPolls.push(optionPoll);
					}
					return {
						...prev,
						optionPolls: newOptionPolls
					};
				});
			}
		} catch (errors) {
			//do nothing, await form.validateFields(); will automatically highlight the error ridden fields
		} finally {
			setFormDisabled(false);
			setLoading(false);
		}
	};

	return (
		<>
			<Button
				className={'flex items-center border-none px-1.5 text-pink_primary shadow-none'}
				onClick={() => setShowModal(true)}
			>
				<AuditOutlined />
				<span className='ml-1'>Create Poll</span>
			</Button>

			<Modal
				zIndex={999}
				title='Create Poll'
				open={showModal}
				onOk={handleCreate}
				onCancel={() => {
					form.resetFields();
					setShowModal(false);
				}}
				confirmLoading={loading}
				footer={[
					<Button
						key='back'
						disabled={loading}
						onClick={() => {
							form.resetFields();
							setShowModal(false);
						}}
					>
						Cancel
					</Button>,
					<Button
						htmlType='submit'
						key='submit'
						className='bg-pink_primary text-white hover:bg-pink_secondary'
						disabled={loading}
						onClick={handleCreate}
					>
						Create Poll
					</Button>
				]}
			>
				<Form
					form={form}
					name='report-post-form'
					onFinish={handleCreate}
					layout='vertical'
					disabled={loading || formDisabled}
					validateMessages={{ required: "Please add the '${name}'" }}
					initialValues={{ options: [undefined, undefined] }}
				>
					{error && (
						<ErrorAlert
							errorMsg={error}
							className='mb-4'
						/>
					)}

					<Form.Item
						name='question'
						label='Question'
						rules={[{ required: true }]}
					>
						<Input
							name='question'
							autoFocus
							placeholder='Ask a question...'
							className='text-black'
						/>
					</Form.Item>

					<Form.List
						name='options'
						rules={[
							{
								validator: async (_, options) => {
									if (!options || options.length < 2) {
										return Promise.reject(new Error('Please add atleast 2 options'));
									}
								}
							}
						]}
					>
						{(fields, { add, remove }, { errors }) => (
							<>
								{fields.map((field, index) => (
									<Form.Item
										label={index === 0 && 'Options'}
										required={false}
										key={field.key}
									>
										<Form.Item
											{...field}
											validateTrigger={['onChange', 'onBlur']}
											rules={[
												{
													message: 'Please input an option text or remove this field.',
													required: true,
													whitespace: true
												}
											]}
											noStyle
										>
											<Input
												placeholder={`Option ${index + 1}`}
												name='linkPostId'
												className='w-[90%] text-black'
											/>
										</Form.Item>
										{fields.length > 2 ? (
											<MinusCircleOutlined
												className='ml-3'
												onClick={() => remove(field.name)}
											/>
										) : null}
									</Form.Item>
								))}

								<Form.Item>
									<Button
										type='dashed'
										onClick={() => add()}
										icon={<PlusOutlined />}
										className='flex items-center'
									>
										Add Option
									</Button>
									<Form.ErrorList errors={errors} />
								</Form.Item>
							</>
						)}
					</Form.List>

					<div className='flex items-center justify-between'>
						<Form.Item
							name='days'
							label='Days'
							className='mx-2 w-full'
						>
							<Select>{daysOptions}</Select>
						</Form.Item>

						<Form.Item
							name='hours'
							label='Hours'
							className='mx-2 w-full'
						>
							<Select>{hoursOptions}</Select>
						</Form.Item>

						<Form.Item
							name='minutes'
							label='Minutes'
							className='mx-2 w-full'
						>
							<Select>{minutesOptions}</Select>
						</Form.Item>
					</div>
				</Form>
			</Modal>
		</>
	);
};

export default CreatePoll;
