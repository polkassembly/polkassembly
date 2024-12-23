// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren } from 'react';
import { Progress as ANTDProgressBar, ProgressProps } from 'antd';
import styled from 'styled-components';

interface IProgressBar extends ProgressProps {
	className?: string;
}
const ProgressBar: FC<PropsWithChildren<IProgressBar>> = (props) => {
	const { className } = props;
	return (
		<ANTDProgressBar
			{...props}
			className={`${className}`}
		/>
	);
};

export default styled(ProgressBar)`
	@media (max-width: 420px) and (min-width: 319px) {
		width: 96% !important;
	}
`;
