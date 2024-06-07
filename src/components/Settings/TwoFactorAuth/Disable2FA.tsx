// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal, Spin } from 'antd';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import { LoadingOutlined } from '@ant-design/icons';
import { TokenType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import { poppins } from 'pages/_app';
import { handleTokenChange } from '~src/services/auth.service';
import KeyboardDownIcon from '~assets/icons/keyboard-arrow-down.svg';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const Title = (
	<>
		<span className='text-lg font-bold tracking-wide text-sidebarBlue'>Disable Two Factor Authentication</span>
		<Divider className='mb-0 mt-2' />
	</>
);

const Disable2FA: FC<{ className?: string }> = ({ className }) => {
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();

	const handleSubmit = async () => {
		// don't submit if loading or if user is already 2FA enabled
		if (loading || !currentUser?.username || !currentUser.is2FAEnabled) return;
		setLoading(true);

		try {
			const { data, error } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/2fa/disable');

			if (error || !data || !data.token) {
				setError(error || 'Error disabling 2FA. Please try again.');
				setLoading(false);
				return;
			}

			handleTokenChange(data.token, currentUser, dispatch);

			queueNotification({
				header: 'Success',
				message: 'Two factor authentication disabled successfully!',
				status: NotificationStatus.SUCCESS
			});

			setShowModal(false);
		} catch (error) {
			//await form.validateFields(); will automatically highlight the error ridden fields
			setError('Please input a valid auth code');
			setLoading(false);
			return;
		}
	};

	const dismissModal = () => {
		setError('');
		setShowModal(false);
	};

	return (
		<>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={`${className} ${poppins.variable} ${poppins.className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				closable={false}
				title={Title}
				open={showModal}
				footer={[
					<div
						key='footer'
						className='flex items-center justify-end gap-x-1'
					>
						<CustomButton
							htmlType='submit'
							key='disable'
							className='px-7 py-5 font-semibold leading-7'
							onClick={handleSubmit}
							disabled={loading}
							variant='default'
							text='Disable'
							fontSize='md'
						/>
						<CustomButton
							key='cancel'
							onClick={dismissModal}
							className='px-7 py-5 font-semibold leading-7'
							disabled={loading}
							variant='primary'
							text='Cancel'
							fontSize='md'
						/>
					</div>
				]}
			>
				{currentUser.is2FAEnabled ? (
					<Spin
						spinning={loading}
						indicator={
							<LoadingOutlined
								style={{ fontSize: 24 }}
								spin
							/>
						}
					>
						{error && !loading && (
							<div className='mb-4'>
								<FilteredError text={error || 'Error in disabling two factor auth. Please reload and try again.'} />
							</div>
						)}

						<section className='my-10 text-center'>
							<p className='mb-3'>Are you sure you want to disable two factor authentication ?</p>
							<small>
								<em>Note: Please remember to remove the auth account from your authenticator app too</em>
							</small>
						</section>
					</Spin>
				) : (
					<section className='my-10 text-center'>Two factor authentication disabled successfully.</section>
				)}
			</Modal>

			<CustomButton
				onClick={() => setShowModal(true)}
				htmlType='submit'
				variant='default'
				className='h-full w-full border-none p-4 text-left text-blue-light-high dark:border-[#3B444F] dark:text-blue-dark-high'
			>
				<span className='align-center flex text-[16px] font-medium'>
					Disable Two Factor Authentication <KeyboardDownIcon />
				</span>
				<span className='block text-sm'>Disabling two-factor authentication may compromise the security of your account.</span>
			</CustomButton>
		</>
	);
};

export default Disable2FA;
