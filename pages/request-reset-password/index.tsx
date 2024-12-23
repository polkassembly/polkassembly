// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Row } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AuthForm from 'src/ui-components/AuthForm';
import messages from 'src/util/messages';
import * as validation from 'src/util/validation';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { NotificationStatus } from '~src/types';
import FilteredError from '~src/ui-components/FilteredError';
import queueNotification from '~src/ui-components/QueueNotification';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	network: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const RequestResetPassword: FC<Props> = (props) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmitForm = async (data: any) => {
		setLoading(true);
		const { email } = data;
		if (email) {
			const { data, error } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/requestResetPassword', { email });
			if (error) {
				console.log('error requesting reset passoword : ', error);
				setError(error);
				setLoading(false);
			}
			if (data) {
				queueNotification({
					header: 'Success!',
					message: data.message,
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				router.push('/login');
			}
		}
	};

	return (
		<>
			<SEOHead
				title='Request Reset Password'
				network={props.network}
			/>
			<Row
				justify='center'
				align='middle'
				className='-mt-16 h-full'
			>
				<article className='flex flex-col gap-y-6 rounded-md bg-white p-8 shadow-md dark:bg-section-dark-overlay md:min-w-[500px]'>
					<h3 className='text-2xl font-semibold text-[#1E232C] dark:text-blue-dark-medium'>Request Password Reset</h3>
					<AuthForm
						onSubmit={handleSubmitForm}
						className='flex flex-col gap-y-6'
					>
						<div className='flex flex-col gap-y-1'>
							<label
								htmlFor='email'
								className='text-base font-medium text-sidebarBlue'
							>
								Email
							</label>
							<Form.Item
								name='email'
								rules={[
									{
										message: messages.VALIDATION_EMAIL_ERROR,
										pattern: validation.email.pattern
									}
								]}
							>
								<Input
									placeholder='email@example.com'
									className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									id='email'
								/>
							</Form.Item>
						</div>

						<div className='flex items-center justify-center'>
							<CustomButton
								text='Request reset'
								disabled={loading}
								htmlType='submit'
								width={224}
								height={40}
								variant='primary'
							/>
						</div>
						{error && <FilteredError text={error} />}
					</AuthForm>
				</article>
			</Row>
		</>
	);
};

export default RequestResetPassword;
