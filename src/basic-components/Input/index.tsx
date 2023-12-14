// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input as AntdInput, InputRef } from 'antd';
import { useTheme } from 'next-themes';
import { CSSProperties, ChangeEvent, ReactNode, RefObject } from 'react';

type SemanticDOM = 'input' | 'button' | 'label' | 'textarea';

interface Props {
	autoFocus?: boolean;
	id?: string;
	disabled?: boolean;
	name?: string;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	value?: string | number;
	className?: string;
	classNames?: Partial<Record<SemanticDOM, string>>;
	size?: 'large' | 'middle' | 'small';
	type?: string;
	onKeyPress?: (e: any) => void;
	prefix?: ReactNode;
	allowClear?: boolean | { clearIcon: ReactNode };
	addonAfter?: ReactNode;
	suffix?: ReactNode;
	defaultValue?: string;
	onPressEnter?: () => void;
	onBlur?: () => void;
	ref?: RefObject<InputRef>;
	style?: CSSProperties;
}

export default function Input({
	autoFocus = false,
	id,
	disabled = false,
	name,
	type,
	value,
	placeholder,
	className,
	onChange,
	classNames,
	prefix,
	allowClear,
	addonAfter,
	suffix,
	defaultValue,
	onPressEnter,
	onBlur,
	ref,
	style
}: Props) {
	const { resolvedTheme: theme } = useTheme();
	return (
		<AntdInput
			autoFocus={autoFocus}
			type={type}
			id={id}
			disabled={disabled}
			name={name}
			placeholder={placeholder}
			onChange={onChange}
			value={value}
			className={`${className} shadow-none ${theme === 'light' ? 'hover:bg-[#f6f7f9] focus:border-[#e5007a] focus:bg-white disabled:bg-[#f6f7f9]' : ''}`}
			classNames={classNames}
			prefix={prefix}
			allowClear={allowClear}
			addonAfter={addonAfter}
			suffix={suffix}
			defaultValue={defaultValue}
			onPressEnter={onPressEnter}
			onBlur={onBlur}
			ref={ref}
			style={style}
		/>
	);
}
