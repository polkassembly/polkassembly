// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Form, Input, Modal, QRCode as QRCodeAntD, Spin, message } from 'antd';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import { LoadingOutlined } from '@ant-design/icons';
import { I2FAGenerateResponse, TokenType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import { poppins } from 'pages/_app';
import { handleTokenChange } from '~src/services/auth.service';
import KeyboardDownIcon from '~assets/icons/keyboard-arrow-down.svg';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { CopyIcon } from '~src/ui-components/CustomIcons';

const Title = (
	<>
		<div className='text-lg font-bold tracking-wide text-sidebarBlue dark:bg-section-dark-overlay dark:text-white'>Two Factor Authentication</div>
		<Divider className='mb-0 mt-0 dark:border-separatorDark' />
	</>
);

const init2FARes: I2FAGenerateResponse = {
	base32_secret: '',
	url: ''
};

const Enable2FA: FC<{ className?: string }> = ({ className }) => {
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tfaResponse, setTfaResponse] = useState<I2FAGenerateResponse>(init2FARes);
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();

	const [form] = Form.useForm();

	const handleSubmit = async (formData: any) => {
		// don't submit if loading or if user is already 2FA enabled
		if (loading || !currentUser?.username || currentUser.is2FAEnabled) return;

		setLoading(true);
		try {
			await form.validateFields();
			const authCode = formData.authCode || null;
			if (!authCode || isNaN(authCode)) throw new Error('Please input a valid auth code');

			// send as string just in case it starts with 0
			const { data, error } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/2fa/verify', { authCode: String(authCode) });

			if (error || !data || !data.token) {
				setError(error || 'Error verifying 2FA. Please try again.');
				setLoading(false);
				return;
			}

			handleTokenChange(data.token, currentUser, dispatch);

			queueNotification({
				header: 'Success',
				message: 'Two factor authentication enabled successfully!',
				status: NotificationStatus.SUCCESS
			});

			setShowModal(false);

			// don't set loading to false because this modal should not be visible if 2FA is enabled
		} catch (error) {
			//await form.validateFields(); will automatically highlight the error ridden fields
			setError('Please input a valid auth code');
			setLoading(false);
			return;
		}
	};

	const dismissModal = () => {
		form.resetFields();
		setError('');
		setShowModal(false);
	};

	const fetch2FASecret = async () => {
		// don't submit if loading or if user is already 2FA enabled
		if (loading || !currentUser?.username || currentUser.is2FAEnabled) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<I2FAGenerateResponse>('api/v1/auth/actions/2fa/generate');
		if (error || !data || !data.base32_secret || !data.url) {
			setError(error || 'Error generating 2FA secret');
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
			console.error('2FA error : ', error);
			return;
		}

		setTfaResponse(data);
		setLoading(false);
	};

	const handleModalOpen = async () => {
		setShowModal(true);
		await fetch2FASecret();
	};

	const handleCopyClicked = (text: string) => {
		navigator.clipboard.writeText(text);
		message.success('Secret Copied');
	};

	return (
		<Form
			className={className}
			form={form}
			disabled={loading || currentUser.is2FAEnabled}
			onFinish={handleSubmit}
		>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={`${className} ${poppins.variable} ${poppins.className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				closable={false}
				title={Title}
				open={showModal}
				footer={[
					<Button
						key='cancel'
						onClick={dismissModal}
						className='text-md inline-flex items-center justify-center rounded-lg border-solid border-pink_primary bg-white px-7 py-5 font-semibold leading-7 text-pink_primary outline-none dark:bg-section-dark-overlay'
						disabled={loading}
					>
						Cancel
					</Button>,
					<Button
						htmlType='submit'
						key='enable'
						onClick={() => {
							form.submit();
						}}
						disabled={loading}
						className='text-md inline-flex items-center justify-center rounded-lg border-none bg-pink_primary px-7 py-5 font-semibold leading-7 text-white outline-none'
					>
						Enable
					</Button>
				]}
			>
				{!currentUser.is2FAEnabled ? (
					<Spin
						spinning={loading}
						indicator={
							<LoadingOutlined
								style={{ fontSize: 24 }}
								spin
							/>
						}
					>
						{(error || !tfaResponse.base32_secret || !tfaResponse.url) && !loading && (
							<div className='mb-4'>
								<FilteredError text={error || 'Error in generating two factor auth QR Code. Please reload and try again.'} />
							</div>
						)}

						<section className='flex flex-col'>
							{/* Instructions for Google Auth */}
							<article>
								<h2 className='text-base text-sidebarBlue dark:text-white'>Configuring Google Authenticator</h2>

								<ol className='ml-4'>
									<li className='mb-1 dark:text-white'>Install Google Authenticator (iOS/Android).</li>
									<li className='mb-1 dark:text-white'>In the authenticator app, select the &quot;+&quot; icon.</li>
									<li className='mb-1 dark:text-white'>Select &quot;Scan a QR code&quot; and use the phone&apos;s camera to scan this QR code.</li>
								</ol>
							</article>

							{/* QR Code */}
							<div className='mt-2'>
								<h2 className='text-base text-sidebarBlue dark:text-white'>Scan the QR Code</h2>

								{tfaResponse.url && (
									<QRCodeAntD
										size={200}
										className='mx-auto'
										errorLevel='H'
										value={tfaResponse.url}
									/>
								)}
							</div>

							{/* Secret Key code */}
							<article className='mt-4'>
								<h2 className='text-base text-sidebarBlue dark:text-white'>Or Enter the Code to Your App (base32 encoded) :</h2>
								{tfaResponse.base32_secret && (
									<span
										onClick={() => handleCopyClicked(tfaResponse.base32_secret)}
										className='border-text_secondary cursor-pointer rounded-md border border-solid p-1 px-2 text-sm text-pink_primary'
									>
										<CopyIcon className='relative text-lightBlue dark:text-icon-dark-inactive' />
										{tfaResponse.base32_secret}
									</span>
								)}
							</article>

							{/* Code Input */}
							<div className='mb-4 mt-6 dark:text-white'>
								<h2 className='text-base text-sidebarBlue dark:text-white'>Verify Code</h2>
								<p>Please input the authentication code :</p>

								<Form.Item
									name='authCode'
									validateTrigger={['onSubmit']}
									rules={[
										{
											message: 'Invalid authentication code',
											validator(rule, value = '', callback) {
												// 7 is just in case the user inputs with a space in between (Google auth formats it with a space)
												if (callback && (!value || value.length !== 6 || isNaN(Number(value)))) {
													callback(rule?.message?.toString());
												} else {
													callback();
												}
											}
										}
									]}
								>
									<Input
										placeholder='Auth Code'
										name='authCode'
										className='w-[60%] text-black dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									/>
								</Form.Item>
							</div>
						</section>
					</Spin>
				) : (
					<div className='my-10 text-center'>Two factor authentication enabled successfully.</div>
				)}
			</Modal>

			<Button
				onClick={handleModalOpen}
				htmlType='submit'
				className='h-full w-full border-[#D2D8E0] bg-[#F6F7F9] p-[16px] text-left text-blue-light-high dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-container dark:text-blue-dark-high dark:text-blue-dark-high'
			>
				<span className='align-center flex text-[16px] font-medium '>
					Enable Two Factor Authentication <KeyboardDownIcon />
				</span>
				<span className='block text-[14px]'>Enhance account security with two factor authentication. Verify your identity with an extra step for added protection. </span>
			</Button>
		</Form>
	);
};

export default Enable2FA;
