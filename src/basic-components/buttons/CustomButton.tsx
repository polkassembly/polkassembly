// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { Button as ANTDButton } from 'antd';
import { CompoundedComponent } from 'antd/es/float-button/interface';

interface ICustomButton extends CompoundedComponent {
	text?: string | ReactNode;
	disabled?: boolean;
	loading?: boolean;
	htmlType?: any;
	fontSize?: string;
	className?: string;
	onClick?: (pre?: any) => void;
	variant: 'primary' | 'default' | 'dashed' | 'link' | 'text';
	icon?: any;
	width?: number;
	height?: number;
	style?: any;
	buttonSize?: string;
}
const CustomButton: FC<PropsWithChildren<ICustomButton>> = (props) => {
	const { buttonSize, style, text, disabled, loading, htmlType, className, onClick, variant, icon, fontSize } = props;
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
			className={`${`h-[${height ? height : '40'}px]`} flex items-center justify-center gap-0 rounded-md ${fontSize ? `text-${fontSize}` : 'text-sm'} font-medium ${
				variant === 'primary'
					? 'border-pink_primary bg-pink_primary text-white hover:bg-pink_secondary dark:text-white'
					: 'border border-pink_primary bg-transparent text-pink_primary'
			} ${className} `}
			disabled={disabled}
			loading={loading}
			htmlType={htmlType}
			onClick={onClick}
			icon={icon}
			style={{ height: `${height}px`, width: `${width}px`, ...style }}
		>
			{props.children || text}
		</ANTDButton>
	);
};

export default CustomButton;
