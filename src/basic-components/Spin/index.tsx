// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin as AntdSpin, SpinProps } from 'antd';
import React, { FC, PropsWithChildren } from 'react';

interface IProps extends SpinProps {
	className?: string;
}

const Spin: FC<PropsWithChildren<IProps>> = (props) => {
	const { className } = props;
	return (
		<AntdSpin
			{...props}
			className={className}
		>
			{props.children}
		</AntdSpin>
	);
};

export default Spin;
