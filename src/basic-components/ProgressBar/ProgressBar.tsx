// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren } from 'react';
import { Progress as ANTDProgressBar } from 'antd';

interface IProgressBar {
	className?: string;
}
const ProgressBar: FC<PropsWithChildren<IProgressBar>> = (props) => {
	const { className } = props;
	return (
		<ANTDProgressBar
			className={`${className}`}
			{...props}
		/>
	);
};

export default ProgressBar;
