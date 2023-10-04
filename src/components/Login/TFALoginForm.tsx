// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Divider, Form, Input } from 'antd';
import React from 'react';
import styled from 'styled-components';
import AuthForm from '~src/ui-components/AuthForm';
import FilteredError from '~src/ui-components/FilteredError';

interface Props {
	className?: string;
	error?: string;
	loading?: boolean;
	onSubmit: (data: any) => void;
	onBack: () => void;
	theme?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TFALoginForm = ({ className, error, loading, onSubmit, onBack, theme }: Props) => {
	console.log('theme', theme);
	return (
		<AuthForm
			onSubmit={onSubmit}
			className={`${className} flex flex-col gap-y-3`}
		>
<<<<<<< HEAD
			<div className="flex flex-col gap-y-1 px-5">
				<h1 className='text-sidebarBlue dark:text-white'>Two Factor Authentication</h1>
				<p className='text-sidebarBlue dark:text-blue-dark-medium'>Please open the two-step verification app or extension and input the authentication code for your Polkassembly account.</p>
=======
			<div className='flex flex-col gap-y-1 px-5'>
				<h1 className='text-sidebarBlue'>Two Factor Authentication</h1>
				<p className='text-sidebarBlue'>Please open the two-step verification app or extension and input the authentication code for your Polkassembly account.</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

				{error && (
					<FilteredError
						className='mb-6 mt-2'
						text={error}
					/>
				)}

				<label
<<<<<<< HEAD
					className="text-sm text-[#485F7D] dark:text-blue-dark-medium"
					htmlFor="authCode"
=======
					className='text-sm text-[#485F7D] '
					htmlFor='authCode'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				>
					Authentication Code
				</label>
				<Form.Item
					name='authCode'
					validateTrigger={['onSubmit']}
					rules={[
						{
							message: 'Please provide a valid authentication code.',
							validator(rule, value = '', callback) {
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
						disabled={loading}
						placeholder='######'
						name='authCode'
						id='authCode'
						className='rounded-md px-4 py-3'
					/>
				</Form.Item>

				<div className='flex flex-col items-center justify-center gap-y-4'>
					<Button
						loading={loading}
						htmlType='submit'
						size='large'
						className='w-56 rounded-md border-none bg-pink_primary text-white outline-none'
					>
						Login
					</Button>

					<div className='w-[260px]'>
						<Divider className='border-[0.5px] border-[#90A0B7]'>
							<Button
								onClick={onBack}
								disabled={loading}
<<<<<<< HEAD
								htmlType="button"
								size="small"
								className="rounded-md outline-none border-none text-pink_primary dark:bg-transparent dark:text-white dark:border-pink_primary"
=======
								htmlType='button'
								size='small'
								className='rounded-md border-none text-pink_primary outline-none'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							>
								Go back
							</Button>
						</Divider>
					</div>
				</div>
			</div>
		</AuthForm>
	);
};

export default styled(TFALoginForm)`
<<<<<<< HEAD
.ant-divider-inner-text{
	padding: 0 0 !important;
}

.ant-input{
	color:  ${props => props.theme=='dark' ? 'white' : ''} !important;
	background-color: ${props => props.theme=='dark' ? 'black' : ''} !important;
 }
 .ant-input::placeholder{
	color:  ${props => props.theme=='dark' ? '#909090' : ''} !important;
 }
`;
=======
	.ant-divider-inner-text {
		padding: 0 0 !important;
	}
`;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
