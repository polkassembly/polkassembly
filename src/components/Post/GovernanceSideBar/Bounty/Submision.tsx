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
import { useTheme } from 'next-themes';

const { Option } = Select;

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
}

const Submision: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;
	const { resolvedTheme: theme } = useTheme();
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
					>
						<Select placeholder='Select an account'>
							<Option value='account1'>Account 1</Option>
							<Option value='account2'>Account 2</Option>
						</Select>
					</Form.Item>
					<Form.Item
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Title <span className='text-red-500'>*</span>
							</div>
						}
						name='title'
						className='-mt-3'
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
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Categories <span className='text-red-500'>*</span>
							</div>
						}
						name='categories'
						className='-mt-3'
					>
						<Input placeholder='Add more context for your request' />
					</Form.Item>
					<Form.Item
						label={
							<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
								Description <span className='text-red-500'>*</span>
							</div>
						}
						name='description'
						className='-mt-3'
					>
						<TextEditor
							name='content'
							theme={theme}
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
