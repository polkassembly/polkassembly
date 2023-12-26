// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tooltip as AntdTooltip } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { ReactNode } from 'react';

interface Props {
	key?: number;
	arrow?: boolean;
	open?: boolean;
	children: ReactNode;
	placement?: TooltipPlacement;
	destroyTooltipOnHide?: boolean;
	title?: ReactNode | (() => ReactNode);
	className?: string;
	color?: string;
	overlayClassName?: string;
	onOpenChange?: (e: any) => void;
}

export default function Popover({ children, key, arrow = true, open, placement, destroyTooltipOnHide, title, className, color, overlayClassName, onOpenChange }: Props) {
	return (
		<AntdTooltip
			key={key}
			arrow={arrow}
			open={open}
			placement={placement}
			destroyTooltipOnHide={destroyTooltipOnHide}
			title={title}
			className={className}
			color={color}
			overlayClassName={overlayClassName}
			onOpenChange={onOpenChange}
		>
			{children}
		</AntdTooltip>
	);
}
