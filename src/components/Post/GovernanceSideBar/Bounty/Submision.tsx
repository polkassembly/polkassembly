// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState } from 'react';
import { Modal, Button, Select, Form } from 'antd';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import Input from '~src/basic-components/Input';
import InputTextarea from '~src/basic-components/Input/InputTextarea';

const { Option } = Select;

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
}

const Submision: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;

	// State to control modal visibility
	const [isModalVisible, setIsModalVisible] = useState(false);

	// Open Modal
	const showModal = () => {
		setIsModalVisible(true);
	};

	// Close Modal
	const handleCancel = () => {
		setIsModalVisible(false);
	};

	// Handle form submission
	const handleOk = (values: any) => {
		console.log('Submitted Values:', values);
		setIsModalVisible(false);
	};

	console.log('bountyId', bountyId);

	return (
		<GovSidebarCard>
			<h4 className='dashboard-heading mb-4 dark:text-white'>Submissions (0)</h4>

			<div
				className='flex cursor-pointer items-center justify-center gap-2 rounded-md border-[0.7px] border-solid border-[#D2D8E0] bg-[#E5007A] px-2 py-1 dark:border-separatorDark'
				onClick={showModal}
			>
				<ImageIcon
					src='/assets/icons/Document.svg'
					alt='submit'
				/>
				<h5 className='pt-2 text-sm text-white'>Make Submission</h5>
			</div>

			{/* Modal for making a submission */}
			<Modal
				title='Make Submission'
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
				destroyOnClose
			>
				<Form
					layout='vertical'
					onFinish={handleOk}
				>
					<Form.Item
						label='Select Account'
						name='account'
						rules={[{ required: true, message: 'Please select an account' }]}
					>
						<Select placeholder='Select an account'>
							<Option value='account1'>Account 1</Option>
							<Option value='account2'>Account 2</Option>
						</Select>
					</Form.Item>

					<Form.Item
						label='Propose Curator'
						name='curator'
					>
						<Input placeholder='Enter curator' />
					</Form.Item>

					<Form.Item
						label='Title'
						name='title'
						rules={[{ required: true, message: 'Please enter a title' }]}
					>
						<Input placeholder='Enter title' />
					</Form.Item>

					<Form.Item
						label='Request Amount'
						name='amount'
						rules={[{ required: true, message: 'Please enter the amount requested' }]}
					>
						<Input
							placeholder='Enter requested amount'
							type='number'
						/>
					</Form.Item>

					<Form.Item
						label='Links'
						name='links'
					>
						<Input placeholder='Add relevant links' />
					</Form.Item>

					<Form.Item
						label='Tags'
						name='tags'
					>
						<Input placeholder='Add tags (comma separated)' />
					</Form.Item>

					<Form.Item
						label='Description'
						name='description'
						rules={[{ required: true, message: 'Please provide a description' }]}
					>
						<InputTextarea
							rows={4}
							placeholder='Enter a detailed description'
						/>
					</Form.Item>

					<Form.Item>
						<div className='flex justify-end gap-2'>
							<Button onClick={handleCancel}>Cancel</Button>
							<Button
								type='primary'
								htmlType='submit'
							>
								Send
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</GovSidebarCard>
	);
};

export default Submision;
