// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { MailFilled } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { Rule } from 'antd/es/form';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
type Props = {
    onClick: any;
};

const Container = styled.div`
    .ant-form-item-explain-error {
        position: absolute;
    }
`;

const validationRules: Rule[] = [
	{ message: 'Email is required, Please enter an email', required: true }
];

export default function EmailNotificationCard({ onClick }: Props) {
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
		} else {
			callback('Please enter a valid email address.'); // Validation failed
		}
	};

	const handleClick = async () => {
		try {
			const values = await form.validateFields();
			const { email } = values;
			onClick(email);
			setLoading(true);

			const { data , error } = await nextApiClientFetch<any>( 'api/v1/auth/actions/sendVerificationEmail', {
				email
			});
			console.log(data, error);

			setLoading(false);
		} catch (error) {
			console.log('Validation error:', error);
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col mb-2'>
			<h3 className='text-base font-semibold m-0'>
				<MailFilled /> Email Notifications
			</h3>
			<Container>
				<Form
					onFinish={handleClick}
					form={form}
					className='flex gap-2 items-center w-2/3'
				>
					<Form.Item
						name={'email'}
						className='m-0 w-full'
						rules={[
							...validationRules,
							{ validator: validateEmailFormat }
						]}
					>
						<Input
							// value={input}
							// onChange={(e) => setInput(e.target.value)}
							className='p-2 text-sm leading-[21px]'
							placeholder='Account Address'
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
