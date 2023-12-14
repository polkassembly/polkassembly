// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input as AntdInput } from 'antd';
import { useTheme } from 'next-themes';
import { ChangeEvent } from 'react';

type SemanticDOM = 'input' | 'button' | 'label' | 'textarea';

interface Props {
	name?: string;
	showCount?: boolean;
	rows?: number;
	maxLength?: number;
	className?: string;
	classNames?: Partial<Record<SemanticDOM, string>>;
	placeholder?: string;
	id?: string;
	value?: string | number;
	onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	disabled?: boolean;
}

export default function InputTextarea({ name, showCount, rows, maxLength, className, classNames, placeholder, id, value, onChange, disabled }: Props) {
	const { resolvedTheme: theme } = useTheme();
	return (
		<AntdInput.TextArea
			name={name}
			showCount={showCount}
			rows={rows}
			maxLength={maxLength}
			className={`${className} shadow-none  ${theme === 'light' ? 'hover:border-grey_border hover:bg-[#f6f7f9]  focus:border-[#e5007a] focus:bg-white disabled:bg-[#f6f7f9]' : ''}`}
			classNames={classNames}
			placeholder={placeholder}
			id={id}
			value={value}
			onChange={onChange}
			disabled={disabled}
		/>
	);
}
