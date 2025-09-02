// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { Button as ANTDButton, ButtonProps } from 'antd';

interface ICustomButton extends ButtonProps {
	text?: string | ReactNode;
	fontSize?: string;
	className?: string;
	variant?: 'link' | 'text' | 'dashed' | 'outlined' | 'solid' | 'filled';
	width?: number;
	height?: number;
	style?: any;
	buttonsize?: string;
	customColor?: string;
	customBorderColor?: string;
	customTextColor?: string;
	shape?: 'default' | 'circle' | 'round';
}
const CustomButton: FC<PropsWithChildren<ICustomButton>> = (props) => {
	const { buttonsize, style, text, className, variant, fontSize, customColor, customTextColor, customBorderColor, shape } = props;
	let { height, width } = props;
	if (buttonsize && buttonsize === 'xs') {
		width = 134;
		height = 40;
	} else if (buttonsize && buttonsize === 'sm') {
		width = 144;
		height = 40;
	}
	return (
		<ANTDButton
			{...props}
			className={`${`h-[${height ? height : '40'}px]`} flex items-center justify-center gap-0 border-[1px] shadow-none ${shape === 'circle' ? 'rounded-full' : 'rounded-md'} ${
				fontSize ? `text-${fontSize}` : 'text-sm'
			} font-medium ${
				!customColor
					? `${
							variant === 'solid'
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
