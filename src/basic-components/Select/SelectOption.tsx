// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Select as AntdSelect } from 'antd';
import { OptionProps } from 'antd/es/select';
import { FC, PropsWithChildren } from 'react';

interface Props extends OptionProps {
	className?: string;
}

const SelectOption: FC<PropsWithChildren<Props>> = (props) => {
	const { className } = props;
	return (
		<AntdSelect.Option
			{...props}
			className={`${className} dark:bg-section-dark-overlay dark:text-blue-dark-high `}
		>
			{props.children}
		</AntdSelect.Option>
	);
};

export default SelectOption;
