// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input as AntdInput, InputProps, InputRef } from 'antd';
import { useTheme } from 'next-themes';
import { FC, PropsWithChildren, RefObject } from 'react';

interface Props extends InputProps {
	className?: string;
	ref?: RefObject<InputRef>;
}

const Input: FC<PropsWithChildren<Props>> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const { className } = props;
	return (
		<AntdInput
			{...props}
			className={`${className} shadow-none ${theme === 'light' ? 'hover:bg-[#f6f7f9] focus:border-[#e5007a] focus:bg-white disabled:bg-[#f6f7f9]' : ''}`}
		/>
	);
};

export default Input;
