// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input as AntdInput } from 'antd';
import { TextAreaProps } from 'antd/es/input/TextArea';
import { useTheme } from 'next-themes';
import { FC } from 'react';

interface Props extends TextAreaProps {
	className?: string;
}

const InputTextarea: FC<Props> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const { className } = props;
	return (
		<AntdInput.TextArea
			{...props}
			className={`${className} shadow-none  ${theme === 'light' ? 'hover:border-grey_border hover:bg-[#f6f7f9]  focus:border-[#e5007a] focus:bg-white disabled:bg-[#f6f7f9]' : ''}`}
		/>
	);
};
export default InputTextarea;
