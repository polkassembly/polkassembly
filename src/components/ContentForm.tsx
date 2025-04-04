// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form } from 'antd';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import TextEditor from '~src/ui-components/TextEditor';
import dynamic from 'next/dynamic';

const BlockEditor = dynamic(() => import('./BlockEditor'), { ssr: false });

interface Props {
	className?: string;
	height?: number;
	onChange?: (content: string) => void | string | null;
	value?: string;
	autofocus?: boolean;
}

type ValidationStatus = Parameters<typeof Form.Item>[0]['validateStatus'];

type ValidationResult = {
	errorMsg: string | null;
	validateStatus: ValidationStatus;
};

const validateContent = (content: string): ValidationResult => {
	if (content) {
		return {
			errorMsg: null,
			validateStatus: 'success'
		};
	}
	return {
		errorMsg: 'Please add the content.',
		validateStatus: 'error'
	};
};

const ContentForm = ({ className, height, onChange, value, autofocus = false }: Props): JSX.Element => {
	const { resolvedTheme: theme } = useTheme();
	const [validationStatus, setValidation] = useState<ValidationResult>({
		errorMsg: null,
		validateStatus: 'success'
	});

	const [isBlockEditor, setIsBlockEditor] = useState(false);
	const [content, setContent] = useState('');

	const onChangeWrapper = (content: string) => {
		const validationStatus = validateContent(content);
		setValidation(validationStatus);
		if (onChange) {
			onChange(content);
		}

		setContent(content);
		return content;
	};

	return (
		<div className={className}>
			<Form.Item
				valuePropName='value'
				getValueFromEvent={onChangeWrapper}
				initialValue={value}
				name='content'
				validateStatus={validationStatus.validateStatus}
				help={validationStatus.errorMsg}
			>
				{isBlockEditor ? (
					<BlockEditor
						data={content}
						onChange={onChangeWrapper}
					/>
				) : (
					<TextEditor
						name='content'
						value={value}
						theme={theme}
						height={height}
						onChange={onChangeWrapper}
						autofocus={autofocus}
					/>
				)}
			</Form.Item>

			<div className='flex justify-end'>
				<Button
					size='small'
					className='mb-6 text-xs'
					onClick={() => setIsBlockEditor(!isBlockEditor)}
				>
					<span className='mr-2'>&#8644;</span>
					Switch to {isBlockEditor ? 'Old' : 'New'} Editor
				</Button>
			</div>
		</div>
	);
};

export default ContentForm;
