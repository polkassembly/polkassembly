// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { Button as ANTDButton } from 'antd';

interface ICustomButton {
	text?: string | ReactNode;
	disabled?: boolean;
	loading?: boolean;
	htmlType?: any;
	fontSize?: string;
	className?: string;
	onClick?: (pre?: any) => void;
	variant?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
	icon?: any;
	width?: number;
	height?: number;
}
const CustomButton: FC<PropsWithChildren<ICustomButton>> = (props) => {
	const { text, disabled, loading, htmlType, className, onClick, variant, icon, width, height, fontSize } = props;
	return (
		<div>
			<ANTDButton
				className={`flex items-center justify-center gap-0 rounded-md ${fontSize ? `text-${fontSize}` : 'text-sm'} font-medium ${
					variant === 'primary' ? 'hover:bg-pink_secondary dark:bg-[#33071E] dark:text-pink_primary' : 'border border-pink_primary bg-transparent text-pink_primary'
				} ${`w-[${width}px]`} ${`h-[${height}px]`} ${className} `}
				disabled={disabled}
				type={variant}
				loading={loading}
				htmlType={htmlType}
				onClick={onClick}
				icon={icon}
			>
				{props.children || text}
			</ANTDButton>
		</div>
	);
};

export default CustomButton;
