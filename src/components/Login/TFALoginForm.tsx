// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Form } from 'antd';
import React from 'react';
import styled from 'styled-components';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import AuthForm from '~src/ui-components/AuthForm';
import FilteredError from '~src/ui-components/FilteredError';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	error?: string;
	loading?: boolean;
	onSubmit: (data: any) => void;
	onBack: () => void;
}

const TFALoginForm = ({ className, error, loading, onSubmit, onBack }: Props) => {
	const { t } = useTranslation();

	return (
		<AuthForm
			onSubmit={onSubmit}
			className={`${className} flex flex-col gap-y-3`}
		>
			<div className='flex flex-col gap-y-1 px-5'>
				<h1 className='text-sidebarBlue'>{t('two_factor_authentication')}</h1>
				<p className='text-sidebarBlue'>{t('two_factor_auth_instruction')}</p>

				{error && (
					<FilteredError
						className='mb-6 mt-2'
						text={error}
					/>
				)}

				<label
					className='text-sm text-[#485F7D] dark:text-blue-dark-medium '
					htmlFor='authCode'
				>
					{t('authentication_code')}
				</label>
				<Form.Item
					name='authCode'
					validateTrigger={['onSubmit']}
					rules={[
						{
							message: t('valid_auth_code_message'),
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
						className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>
				</Form.Item>

				<div className='flex flex-col items-center justify-center gap-y-4'>
					<CustomButton
						text={t('login')}
						htmlType='submit'
						loading={loading}
						width={224}
						height={40}
						variant='primary'
					/>

					<div className='w-[260px]'>
						<Divider className='border-[0.5px] border-[#90A0B7]'>
							<CustomButton
								onClick={onBack}
								text={t('go_back')}
								htmlType='button'
								disabled={loading}
								variant='default'
								height={40}
							/>
						</Divider>
					</div>
				</div>
			</div>
		</AuthForm>
	);
};

export default styled(TFALoginForm)`
	.ant-divider-inner-text {
		padding: 0 0 !important;
	}
`;
