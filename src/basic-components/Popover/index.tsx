// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Popover as AntdPopover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { ReactNode } from 'react';

interface Props {
	children?: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	content: ReactNode;
	title?: ReactNode | (() => ReactNode);
	className?: string;
	zIndex?: number;
	placement?: TooltipPlacement;
	arrow?: boolean | { pointAtCenter: boolean };
	onOpenChange?: (open: boolean) => void;
	overlayClassName?: string;
	rootClassName?: string;
	trigger?: 'click' | 'hover' | 'focus' | 'contextMenu';
}

export default function Popover({
	children,
	open,
	defaultOpen,
	content,
	title,
	className,
	zIndex,
	placement,
	arrow = true,
	onOpenChange,
	overlayClassName,
	rootClassName,
	trigger
}: Props) {
	return (
		<AntdPopover
			open={open}
			defaultOpen={defaultOpen}
			content={content}
			title={title}
			className={className}
			zIndex={zIndex}
			placement={placement}
			arrow={arrow}
			onOpenChange={onOpenChange}
			overlayClassName={overlayClassName}
			rootClassName={rootClassName}
			trigger={trigger}
		>
			{children}
		</AntdPopover>
	);
}
