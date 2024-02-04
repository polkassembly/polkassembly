// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Select as AntdSelect, SelectProps } from 'antd';
import { useTheme } from 'next-themes';
import { FC, PropsWithChildren } from 'react';

interface Props extends SelectProps {
	className?: string;
}

const Select: FC<PropsWithChildren<Props>> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const { className } = props;
	return (
		<AntdSelect
			{...props}
			className={`${className} shadow-none ${theme === 'light' ? 'hover:bg-[#f6f7f9] focus:border-[#e5007a] focus:bg-white disabled:bg-[#f6f7f9]' : ''}`}
		>
			{props.children}
		</AntdSelect>
	);
};

export default Select;
