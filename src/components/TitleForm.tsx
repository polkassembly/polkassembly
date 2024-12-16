// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import Input from '~src/basic-components/Input';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => string | void;
	value?: string;
}

type ValidationStatus = Parameters<typeof Form.Item>[0]['validateStatus'];

type ValidationResult = {
	errorMsg: string | null;
	validateStatus: ValidationStatus;
};

const validateTitle = (content: string, t: (key: string) => string): ValidationResult => {
	if (content) {
		return {
			errorMsg: null,
			validateStatus: 'success'
		};
	}
	return {
		errorMsg: t('please_add_title'),
		validateStatus: 'error'
	};
};

const TitleForm = ({ className, onChange, value = '' }: Props): JSX.Element => {
	const { t } = useTranslation('common');
	const [validationStatus, setValidation] = useState<ValidationResult>({
		errorMsg: null,
		validateStatus: 'success'
	});

	const onChangeWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
		const validationStatus = validateTitle(event.currentTarget.value, t);
		setValidation(validationStatus);
		if (onChange) {
			onChange!(event);
		}

		return event.currentTarget.value;
	};

	return (
		<div className={className}>
			<Form>
				<label className='mb-3 flex items-center text-sm font-bold text-sidebarBlue'>{t('title')}</label>
				<Form.Item
					name='title'
					validateStatus={validationStatus.validateStatus}
					help={validationStatus.errorMsg}
				>
					{/* Input Component */}
					<Input
						className='text-sm text-sidebarBlue dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						name={'title'}
						onChange={onChangeWrapper}
						placeholder={t('your_title')}
						value={value}
					/>
				</Form.Item>
			</Form>
		</div>
	);
};

export default TitleForm;
