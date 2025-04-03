// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { message } from 'antd';
import React, { useState } from 'react';
import MarkdownEditor from './Editor/MarkdownEditor';

interface Props {
	className?: string;
	height?: number;
	onChange?: (content: string) => void | string | null;
	value?: string;
	autofocus?: boolean;
}

const SummaryContentForm = ({ className, height, onChange, autofocus = false, value: passedContent }: Props): JSX.Element => {
	const [value, setValue] = useState<string | undefined>(passedContent);

	const onChangeWrapper = (content: string) => {
		if (content.length > 400) {
			message.error('Summary cannot exceed 400 characters.');
			return;
		}
		setValue(content);
		if (onChange) {
			onChange(content);
		}

		return content;
	};

	return (
		<div className={className}>
			<MarkdownEditor
				key='content'
				value={value}
				height={height}
				onChange={onChangeWrapper}
				autofocus={autofocus}
			/>
		</div>
	);
};

export default SummaryContentForm;
