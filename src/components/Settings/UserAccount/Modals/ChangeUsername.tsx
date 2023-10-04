// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, Divider, Form, Input, Modal } from 'antd';
import { ChangeUserIcon } from '~src/ui-components/CustomIcons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { NotificationStatus } from '~src/types';
import messages from 'src/util/messages';
import queueNotification from '~src/ui-components/QueueNotification';
import { username as usernameValidation } from 'src/util/validation';
import { useUserDetailsContext } from '~src/context';
import styled from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';

<<<<<<< HEAD
const ChangeUsername = ({
	open,
	onConfirm,
	onCancel,
	username,
	theme
}: {
    open: boolean;
    onConfirm?: () => void;
    onCancel: () => void;
    username: string;
	theme?: string;
}) => {
=======
const ChangeUsername = ({ open, onConfirm, onCancel, username }: { open: boolean; onConfirm?: () => void; onCancel: () => void; username: string }) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();
	const { setUserDetailsContextState } = useUserDetailsContext();
	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { newUsername } = values;
			setLoading(true);

			const { data, error } = await nextApiClientFetch<any>('api/v1/auth/actions/changeUsername', {
				username: newUsername
			});
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: error || 'Not able to change username please try again later',
					status: NotificationStatus.ERROR
				});
			}
			if (data) {
				setUserDetailsContextState((prev) => ({ ...prev, username: newUsername }));
				queueNotification({
					header: 'Success!',
					message: 'Username changed successfully.',
					status: NotificationStatus.SUCCESS
				});
				form.resetFields();
				onCancel();
			}
			setLoading(false);
		} catch (error) {
			console.log('Validation error:', error);
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message: error || 'Not able to change username please try again later',
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<Modal
			title={
<<<<<<< HEAD
				<div className='mr-[-24px] ml-[-24px] text-blue-light-high dark:text-blue-dark-high dark:bg-section-dark-overlay'>
					<h3 className='ml-[24px] mb-0 flex items-center gap-2 text-base md:text-md'>
						<ChangeUserIcon className='text-lightBlue dark:text-white'/> Change your username
=======
				<div className='ml-[-24px] mr-[-24px] text-[#243A57]'>
					<h3 className='md:text-md mb-0 ml-[24px] flex items-center gap-2 text-base'>
						<ChangeUserIcon /> Change your username
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					</h3>
					<Divider className='dark:bg-[#90909060]'/>
				</div>
			}
			open={open}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive'/>}
			className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''} min-w-[350px] md:min-w-[600px]`}
			onCancel={onCancel}
			onOk={onConfirm}
			footer={null}
			wrapClassName='dark:bg-modalOverlayDark'
		>
			<div className='flex flex-wrap items-center gap-[10px]'>
				<Form
					onFinish={handleClick}
					form={form}
					className='flex w-full flex-col gap-6'
				>
					<Form.Item
						name={'oldUsername'}
						className='m-0 w-full min-w-[250px]'
					>
<<<<<<< HEAD
						<label className='dark:text-blue-dark-medium' htmlFor="old-username">Old Username</label>
=======
						<label htmlFor='old-username'>Old Username</label>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						<Input
							className='p-2 text-sm leading-[21px] dark:text-blue-dark-high dark:border-[#3B444F] dark:border-[1px] dark:bg-[#90909060]'
							value={username}
							disabled
						/>
					</Form.Item>
					<div>
<<<<<<< HEAD
						<label className='dark:text-blue-dark-medium' htmlFor="new-username">New Username</label>
=======
						<label htmlFor='new-username'>New Username</label>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						<Form.Item
							name={'newUsername'}
							className='m-0 w-full min-w-[250px]'
							rules={[
								{
									message: messages.VALIDATION_USERNAME_REQUIRED_ERROR,
									required: usernameValidation.required
								},
								{
									max: usernameValidation.maxLength,
									message: messages.VALIDATION_USERNAME_MAXLENGTH_ERROR
								},
								{
									message: messages.VALIDATION_USERNAME_MINLENGTH_ERROR,
									min: usernameValidation.minLength
								}
							]}
						>
							<Input
								disabled={loading}
								className='p-2 text-sm leading-[21px] dark:bg-section-dark-overlay dark:text-white dark:text-blue-dark-high dark:border-[#3B444F] dark:placeholder-white dark:border-[1px] dark:focus:border-[#91054F] dark:hover:border-[#91054F]'
								placeholder='Enter your username'
							/>
						</Form.Item>
					</div>
					<div>
						<div className='ml-[-24px] mr-[-24px]'>
							<Divider className='my-4 mt-0' />
						</div>
						<div className='flex justify-end gap-4'>
							<Button
								key='1'
								onClick={onCancel}
<<<<<<< HEAD
								className='h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize dark:bg-transparent'
=======
								className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#FFFFFF] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							>
								Cancel
							</Button>
							<Button
								loading={loading}
								htmlType='submit'
								className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#E5007A] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
							>
								Save
							</Button>
						</div>
					</div>
				</Form>
			</div>
		</Modal>
	);
};

export default styled(ChangeUsername)`
	input::placeholder{
		color: ${props => props.theme=='dark' ? '#909090' : '#576D8BCC'} !important;
	}
`;
