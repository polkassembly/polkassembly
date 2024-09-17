// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { TooltipPlacement } from 'antd/es/tooltip';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
	className?: string;
	text: string | ReactNode;
	bgColor?: string;
	placement?: TooltipPlacement;
	overlayClassName?: string;
	usedInPostPage?: boolean;
}

const HelperTooltip = ({ className, text, bgColor = '#363636', placement, overlayClassName, usedInPostPage }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	return (
		<Tooltip
			placement={placement}
			className={classNames(className)}
			color={bgColor}
			title={text}
			overlayClassName={classNames(overlayClassName, usedInPostPage ? 'top-fix' : '')}
			getPopupContainer={(triggerNode) => triggerNode}
		>
			<InfoCircleOutlined className={classNames(className, theme == 'dark' ? 'text-icon-dark-inactive' : 'text-bodyBlue')} />
		</Tooltip>
	);
};

export default styled(HelperTooltip)`
	.top-fix {
		top: ${(props: any) => (props.usedInPostPage ? '-50px' : '55px')} !important;
	}
`;
