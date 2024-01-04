// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { Button as ANTDButton, ButtonProps } from 'antd';

interface ICustomButton extends ButtonProps {
	text?: string | ReactNode;
	fontSize?: string;
	className?: string;
	variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
	width?: number;
	height?: number;
	style?: any;
	buttonSize?: string;
	customColor?: string;
	customBorderColor?: string;
	customTextColor?: string;
}
const CustomButton: FC<PropsWithChildren<ICustomButton>> = (props) => {
	const { buttonSize, style, text, className, variant, fontSize, customColor, customTextColor, customBorderColor } = props;
	let { height, width } = props;
	if (buttonSize && buttonSize === 'xs') {
		width = 134;
		height = 40;
	} else if (buttonSize && buttonSize === 'sm') {
		width = 144;
		height = 40;
	}
	return (
		<ANTDButton
			{...props}
			className={`${`h-[${height ? height : '40'}px]`} flex items-center justify-center gap-0 rounded-md ${fontSize ? `text-${fontSize}` : 'text-sm'} font-medium  ${
				!customColor
					? `${
							variant === 'primary'
								? 'border-pink_primary bg-pink_primary text-white hover:bg-pink_secondary dark:text-white'
								: 'border border-pink_primary bg-transparent text-pink_primary'
					  }`
					: `border-${customBorderColor} text-${customTextColor} bg-${customColor}`
			} ${className} `}
			style={{ height: `${height}px`, width: `${width}px`, ...style }}
		>
			{props.children || text}
		</ANTDButton>
	);
};

export default CustomButton;
