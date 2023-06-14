// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import MailFilled from '~assets/icons/email-notification.svg';
import { Button, Form, Input } from 'antd';
import { Rule } from 'antd/es/form';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
type Props = {
	verifiedEmail: string;
};

const Container = styled.div`
	// #email_help {
    //     position: absolute;
    // }
`;

const validationRules: Rule[] = [
	{ message: 'Email is required, Please enter an email', required: true }
];

export default function EmailNotificationCard({ verifiedEmail }: Props) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const validateEmailFormat = (
		_: Rule,
		value: string,
		callback: (error?: string) => void
	) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value || emailRegex.test(value)) {
			callback();
			return;
		} else if (verifiedEmail === value) {
			callback('This email is already verified.');
			return;
		} else {
			callback('Please enter a valid email address.'); // Validation failed
			return;
		}
	};

	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { email } = values;
			setLoading(true);
			const { data, error } = await nextApiClientFetch<any>(
				'api/v1/auth/actions/sendVerificationEmail',
				{
					email
				}
			);
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: error,
					status: NotificationStatus.ERROR
				});
			}
			if (data) {
				queueNotification({
					header: 'Success!',
					message: 'Verification Email Sent.',
					status: NotificationStatus.SUCCESS
				});
			}
			setLoading(false);
		} catch (error) {
			console.log('Validation error:', error);
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<div className='flex flex-col mb-2'>
			<h3 className='text-base font-medium m-0 gap-1'>
				<MailFilled /> Email Notifications{' '}
				{verifiedEmail && (
					<span className='text-[10px] px-[4px] py-[2px] bg-[#407BFF] border-[#5A46FF] border-2 text-[#FFFFFF] rounded-tr-lg rounded-bl-lg'>
						Verified
					</span>
				)}
			</h3>
			<Container>
				<Form
					onFinish={handleClick}
					form={form}
					className='flex gap-2 w-2/3 flex-wrap lg:flex-nowrap'
				>
					<Form.Item
						name={'email'}
						className='m-0 w-full min-w-[250px]'
						rules={[
							...validationRules,
							{ validator: validateEmailFormat }
						]}
						initialValue={verifiedEmail}
					>
						<Input
							className='p-2 text-sm leading-[21px]'
							placeholder='Account Address'
							disabled={loading}
						/>
					</Form.Item>
					<Button
						htmlType='submit'
						loading={loading}
						className='h-10 rounded-[6px] bg-[#E5007A] flex items-center justify-center border border-solid border-pink_primary px-[22px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
					>
						Verify
					</Button>
				</Form>
			</Container>
		</div>
	);
}
