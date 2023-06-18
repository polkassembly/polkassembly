// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Form, Input, Modal, QRCode as QRCodeAntD, Spin, message } from 'antd';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import { LoadingOutlined } from '@ant-design/icons';
import { I2FAGenerateResponse, MessageType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import CopyIcon from '~assets/icons/content-copy.svg';

import Header from './Header';
import { poppins } from 'pages/_app';

const Title = <>
	<span className='text-lg tracking-wide text-sidebarBlue font-bold'>Two Factor Authentication</span>
	<Divider className='mt-2 mb-0' />
</>;

const init2FARes: I2FAGenerateResponse = {
	base32_secret: '',
	url: ''
};

const TwoFactorAuth: FC<{className?: string}> = ({ className }) => {
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tfaResponse, setTfaResponse] = useState<I2FAGenerateResponse>(init2FARes);

	const [form] = Form.useForm();

	const handleSubmit = async(formData: any) => {
		if (formData?.password) {
			setLoading(true);

			const { data , error } = await nextApiClientFetch<MessageType>( 'api/v1/auth/actions/deleteAccount', { password: formData?.password });
			if (error) {
				setError(cleanError(error));
				queueNotification({
					header: 'Failed!',
					message: cleanError(error),
					status: NotificationStatus.ERROR
				});
				console.error('Delete account error', error);
			}

			console.log('data ', data);

			setLoading(true);
		}
	};

	const dismissModal = () => {
		form.resetFields();
		setError('');
		setShowModal(false);
	};

	const fetch2FASecret = async () => {
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
		<Form className={className} form={form} disabled={loading} onFinish={handleSubmit}>
			<Header heading='Two Factor Authentication' subHeading='Enhance account security with two factor authentication. Verify your identity with an extra step for added protection.' />

			<Modal
				closable={false}
				title={Title}
				open={showModal}
				footer={[
					<Button
						key="cancel"
						onClick={dismissModal}
						className='rounded-lg font-semibold text-md leading-7 text-white py-5 outline-none border-none px-7 inline-flex items-center justify-center bg-pink_primary'
					>
						Cancel
					</Button>,
					<Button
						htmlType='submit'
						key="delete"
						onClick={() => {
							form.submit();
						}}
						loading={loading}
						className='rounded-lg font-semibold text-md leading-7 text-white py-5 outline-none border-none px-7 inline-flex items-center justify-center bg-pink_primary'
					>
           Enable
					</Button>
				]}
				className={`${className} ${poppins.variable} ${poppins.className} `}
			>
				<Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
					{(error || !tfaResponse.base32_secret || !tfaResponse.url) && !loading && <div className='mb-4'><FilteredError text={error || 'Error in generating two factor auth QR Code. Please reload and try again.'}/></div>}

					<section className='flex flex-col'>
						{/* Instructions for Google Auth */}
						<article>
							<h2 className='text-base text-sidebarBlue'>Configuring Google Authenticator</h2>

							<ol className='ml-4'>
								<li className='mb-1'>Install Google Authenticator (IOS - Android).</li>
								<li className='mb-1'>In the authenticator app, select &quot;+&quot; icon.</li>
								<li className='mb-1'>Select &quot;Scan a barcode (or QR code)&quot; and use the phone&apos;s camera to scan this barcode.</li>
							</ol>
						</article>

						{/* QR Code */}
						<div className='mt-2'>
							<h2 className='text-base text-sidebarBlue'>Scan the QR Code</h2>

							{tfaResponse.url && <QRCodeAntD
								size={200}
								className='mx-auto'
								errorLevel="H"
								value={tfaResponse.url}
							/>}
						</div>

						{/* Secret Key code */}
						<article className='mt-4'>
							<h2 className='text-base text-sidebarBlue'>Or Enter the Code to Your App (Base32 encoded) :</h2>
							<span
								onClick={() => handleCopyClicked(tfaResponse.base32_secret)}
								className='p-1 px-2 cursor-pointer rounded-md text-pink_primary border border-solid border-text_secondary text-sm'
							>
								<CopyIcon className='relative top-[6px]' />{tfaResponse.base32_secret}
							</span>
						</article>

						{/* Code Input */}
						<div className='mt-6 mb-4'>
							<h2 className='text-base text-sidebarBlue'>Verify Code</h2>
							<p>Please input the authentication code :</p>

							<Form.Item
								name='authCode'
								validateTrigger={['onChange', 'onBlur']}
								rules={[
									{
										message: 'Invalid authentication code',
										validator(rule, value = '', callback) {
											if (callback && (!value || value.length < 3 || isNaN(Number(value)))){
												callback(rule?.message?.toString());
											}else {
												callback();
											}
										}
									}
								]}
							>
								<Input placeholder='Auth Code' name='authCode' className='w-[60%] text-black' />
							</Form.Item>
						</div>
					</section>
				</Spin>
			</Modal>

			<Button
				onClick={handleModalOpen}
				htmlType="submit"
				className='mt-5 rounded-lg font-semibold text-md leading-7 text-white py-5 outline-none border-none px-7 flex items-center justify-center bg-pink_primary'
			>
				Enable Two Factor Authentication
			</Button>
		</Form>
	);
};

export default TwoFactorAuth;