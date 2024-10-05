// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState } from 'react';
import { Modal, Button, Select, Form } from 'antd';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import Input from '~src/basic-components/Input';
import BalanceInput from '~src/ui-components/BalanceInput';
import TextEditor from '~src/ui-components/TextEditor';

const { Option } = Select;

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
}

const Submision: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;
	const [isModalVisible, setIsModalVisible] = useState(false);
	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const handleOk = (values: any) => {
		console.log('Submitted Values:', values);
		setIsModalVisible(false);
	};

	console.log('bountyId', bountyId);

	return (
		<GovSidebarCard>
			<h4 className='dashboard-heading mb-4 dark:text-white'>Submissions (0)</h4>

			<div
				className='flex cursor-pointer items-center justify-center rounded-md border-[0.7px] border-solid border-[#D2D8E0] bg-[#E5007A] px-2 py-1 dark:border-separatorDark'
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
				className='-mt-16'
				destroyOnClose
			>
				<Form
					layout='vertical'
					onFinish={handleOk}
				>
					<Form.Item
						label='Select Account'
						name='account'
						rules={[{ message: 'Please select an account', required: true }]}
					>
						<Select placeholder='Select an account'>
							<Option value='account1'>Account 1</Option>
							<Option value='account2'>Account 2</Option>
						</Select>
					</Form.Item>

					<Form.Item
						label='Propose Curator'
						name='curator'
						className='-mt-3'
					>
						<Input placeholder='Enter curator' />
					</Form.Item>

					<Form.Item
						label='Title'
						name='title'
						className='-mt-3'
						rules={[{ message: 'Please enter a title', required: true }]}
					>
						<Input placeholder='Enter title' />
					</Form.Item>

					<BalanceInput
						label={'Request Amount'}
						helpText={'Enter an amount for your request'}
						placeholder={'Enter an amount for your request '}
						// onChange={onBalanceChange}
						className='-mt-3 border-section-light-container text-sm font-medium dark:border-[#3B444F]'
						// theme={theme}
					/>

					<Form.Item
						label='Links'
						name='links'
						className='-mt-3'
					>
						<Input placeholder='Add relevant links' />
					</Form.Item>

					<Form.Item
						label='Tags'
						name='tags'
						className='-mt-3'
					>
						<Input placeholder='Add tags (comma separated)' />
					</Form.Item>
					<Form.Item
						label='Description'
						name='description'
						className='-mt-3'
					>
						<TextEditor
							name='content'
							value='hello'
							// value={value}
							// theme={theme}
							height={150}
							onChange={() => {}}
							// onChange={onChangeWrapper}
							autofocus={false}
						/>{' '}
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
