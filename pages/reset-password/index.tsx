// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { WarningOutlined } from '@ant-design/icons';
import { Button, Form, Input, Row } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AuthForm from 'src/ui-components/AuthForm';
import messages from 'src/util/messages';
import * as validation from 'src/util/validation';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import { NotificationStatus } from '~src/types';
import FilteredError from '~src/ui-components/FilteredError';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	token: string;
	userId: string;
	network: string;
}

export const getServerSideProps:GetServerSideProps = async (context) => {
	const props: Props = {
		network: getNetworkFromReqHeaders(context.req.headers),
		token: `${context.query.token}`,
		userId: `${context.query.userId}`
	};

	return { props };
};

const ResetPassword = ({ network, token, userId } : Props): JSX.Element => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [newPassword, setNewPassword ] = useState('');

	const handleSubmitForm = async (value: any) => {
		setLoading(true);
		if (value.password){
			const { data , error } = await nextApiClientFetch<MessageType>( 'api/v1/auth/actions/resetPassword', { newPassword, userId });
			if(error) {
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
			<SEOHead title="Reset Password" />
			<Row justify='center' align='middle' className='h-full -mt-16'>
				{ <article className="bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6 md:min-w-[500px]">
					{
						token && userId ? <>
							<h3 className='text-2xl font-semibold text-[#1E232C]'>Set new password</h3>
							<AuthForm
								onSubmit={handleSubmitForm}
								className="flex flex-col gap-y-6"
							>
								<div className="flex flex-col gap-y-1">
									<label
										htmlFor="password"
										className="text-base text-sidebarBlue font-medium"
									>
															New Password
									</label>
									<Form.Item
										name="password"
										rules={
											[
												{
													message: messages.VALIDATION_PASSWORD_ERROR,
													min: validation.password.minLength
												},
												{
													message: messages.VALIDATION_PASSWORD_ERROR,
													required: validation.password.required
												}
											]
										}
									>
										<Input.Password
											onChange={(e) => setNewPassword(e.target.value)}
											placeholder="eg. password123"
											className="rounded-md py-3 px-4"
											id="password"
										/>
									</Form.Item>
								</div>
								<div className="flex justify-center items-center">
									<Button
										disabled={loading}
										htmlType="submit"
										size='large'
										className='bg-pink_primary w-56 rounded-md outline-none border-none text-white'
									>
							Set new password
									</Button>
								</div>
								{error && <FilteredError text={error}/>}
							</AuthForm>
						</>: <h2 className='flex flex-col gap-y-2 items-center text-xl font-medium'>
							<WarningOutlined />
							<span> Password reset token and/or userId missing </span>
						</h2>
					}
				</article>}
			</Row>
		</>
	);
};

export default ResetPassword;