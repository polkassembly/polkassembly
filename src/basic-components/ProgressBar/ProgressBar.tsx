// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren } from 'react';
import { Progress as ANTDProgressBar } from 'antd';

interface IProgressBar {
	className?: string;
	showInfo?: boolean;
	percent?: any;
	success?: any;
	strokeColor?: string;
	size?: any;
	trailColor?: string;
	strokeWidth?: number;
	gapPosition?: 'top' | 'bottom' | 'left' | 'right' | undefined;
	format?: any;
	type?: any;
}
const ProgressBar: FC<PropsWithChildren<IProgressBar>> = (props) => {
	const { gapPosition, success, strokeWidth, type, format, showInfo, percent, strokeColor, size, trailColor, className } = props;
	return (
		<ANTDProgressBar
			className={`${className}`}
			{...props}
			type={type}
			format={format}
			showInfo={showInfo}
			percent={percent}
			strokeColor={strokeColor}
			size={size}
			success={success}
			gapPosition={gapPosition}
			strokeWidth={strokeWidth}
			trailColor={trailColor}
		/>
	);
};

export default ProgressBar;
