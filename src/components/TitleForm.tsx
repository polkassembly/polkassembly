// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import React, { useState } from 'react';

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

const validateTitle = (content: string): ValidationResult => {
	if (content) {
		return {
			errorMsg: null,
			validateStatus: 'success',
		};
	}
	return {
		errorMsg: 'Please add the title.',
		validateStatus: 'error',
	};
};

const TitleForm = ({ className, onChange, value = '' }: Props): JSX.Element => {
	const [validationStatus, setValidation] = useState<ValidationResult>({
		errorMsg: null,
		validateStatus: 'success',
	});

	const onChangeWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
		const validationStatus = validateTitle(event.currentTarget.value);
		setValidation(validationStatus);
		if (onchange) {
			onChange!(event);
		}

		return event.currentTarget.value;
	};

	return (
		<div className={className}>
			<Form>
				<label className="mb-3 font-bold flex items-center text-sm text-sidebarBlue">
					Title
				</label>
				<Form.Item
					name="title"
					validateStatus={validationStatus.validateStatus}
					help={validationStatus.errorMsg}
				>
					<Input
						className="text-sm text-sidebarBlue"
						name={'title'}
						onChange={onChangeWrapper}
						placeholder="Your title..."
						value={value}
					/>
				</Form.Item>
			</Form>
		</div>
	);
};

export default TitleForm;
