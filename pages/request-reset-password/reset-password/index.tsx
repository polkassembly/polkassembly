// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { WarningOutlined } from '@ant-design/icons';
import { Form, Row } from 'antd';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
	token: string;
	userId: string;
	network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const translations = await serverSideTranslations(context.locale || '', ['common']);

	const props: Props = {
		network,
		token: `${context.query.token}`,
		userId: `${context.query.userId}`,
		...translations
	};

	return { props };
};

const ResetPassword = ({ network, token, userId }: Props): JSX.Element => {
	const dispatch = useDispatch();
	const { t } = useTranslation('common');

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [newPassword, setNewPassword] = useState('');

	const handleSubmitForm = async (value: any) => {
		setLoading(true);
		if (value.password) {
			const { data, error } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/resetPassword', { newPassword, userId });
			if (error) {
				console.log('error resetting passoword : ', error);
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
				title='Reset Password'
				network={network}
			/>
			<Row
				justify='center'
				align='middle'
				className='-mt-16 h-full'
			>
				{
					<article className='flex flex-col gap-y-6 rounded-md bg-white p-8 shadow-md dark:bg-section-dark-overlay md:min-w-[500px]'>
						{token && userId ? (
							<>
								<h3 className='text-2xl font-semibold text-[#1E232C] dark:text-blue-dark-medium'>{t('set_new_password')}</h3>
								<AuthForm
									onSubmit={handleSubmitForm}
									className='flex flex-col gap-y-6'
								>
									<div className='flex flex-col gap-y-1'>
										<label
											htmlFor='password'
											className='text-base font-medium text-sidebarBlue'
										>
											{t('new_password')}
										</label>
										<Form.Item
											name='password'
											rules={[
												{
													message: messages.VALIDATION_PASSWORD_ERROR,
													min: validation.password.minLength
												},
												{
													message: messages.VALIDATION_PASSWORD_ERROR,
													required: validation.password.required
												}
											]}
										>
											<Input
												type='password'
												onChange={(e) => setNewPassword(e.target.value)}
												placeholder='eg. password123'
												className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
												id='password'
											/>
										</Form.Item>
									</div>
									<div className='flex items-center justify-center'>
										<CustomButton
											disabled={loading}
											htmlType='submit'
											width={224}
											height={40}
											variant='primary'
											text='Set new password'
										/>
									</div>
									{error && <FilteredError text={error} />}
								</AuthForm>
							</>
						) : (
							<h2 className='flex flex-col items-center gap-y-2 text-xl font-medium'>
								<WarningOutlined />
								<span> {t('password_reset_token_and_or_userId_missing')} </span>
							</h2>
						)}
					</article>
				}
			</Row>
		</>
	);
};

export default ResetPassword;
