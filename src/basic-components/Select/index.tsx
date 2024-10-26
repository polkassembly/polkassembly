// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Select as AntdSelect, SelectProps } from 'antd';
import { FC, PropsWithChildren } from 'react';

interface Props extends SelectProps {
	className?: string;
}

const Select: FC<PropsWithChildren<Props>> = (props) => {
	const { className } = props;
	return (
		<AntdSelect
			{...props}
			className={`${className}`}
			popupClassName={`${props.popupClassName} dark:border-0 dark:border-none dark:bg-section-dark-background`}
		>
			{props.children}
		</AntdSelect>
	);
};

export default Select;
