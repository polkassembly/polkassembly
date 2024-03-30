// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal as AntdModal, Divider } from 'antd';
import styled from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';

type Props = PropsWithChildren<{
	title?: string | ReactElement;
	titleIcon?: ReactElement;
	open?: boolean;
	onConfirm?: any;
	onCancel?: any;
	footer?: Array<ReactElement> | any;
	className?: string;
	wrapClassName?: string | undefined;
	onOk?: any;
	zIndex?: any;
	centered?: any;
	maskClosable?: boolean;
	closable?: boolean;
	confirmLoading?: boolean;
	destroyOnClose?: boolean;
	closeIcon?: any;
}>;

const StyledModal = styled(AntdModal)`
	.ant-modal-close {
		top: 24px !important;
		right: 24px !important;
	}
	.ant-modal .ant-modal-header {
		margin-bottom: -36px !important;
	}
`;

const Modal = ({
	confirmLoading,
	closable,
	maskClosable,
	centered,
	zIndex,
	wrapClassName,
	title,
	titleIcon,
	open,
	onConfirm,
	onCancel,
	footer,
	className,
	children,
	onOk,
	destroyOnClose,
	closeIcon
}: Props) => {
	return (
		<StyledModal
			title={
				<div className='text-[18px]'>
					<h3 className='mb-0 flex items-center gap-2 font-semibold text-blue-light-high dark:text-blue-dark-high'>
						{' '}
						{titleIcon} {title}{' '}
					</h3>
					<Divider className='text-[#D2D8E0] dark:text-separatorDark' />
				</div>
			}
			open={open}
			closable={closable}
			zIndex={zIndex}
			centered={centered}
			closeIcon={<CloseIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' /> || closeIcon}
			className={`min-w-[350px] md:min-w-[600px] ${className}`}
			wrapClassName={`dark:bg-modalOverlayDark ${wrapClassName}`}
			onCancel={onCancel}
			onOk={onConfirm || onOk}
			footer={footer || null}
			maskClosable={maskClosable}
			confirmLoading={confirmLoading}
			destroyOnClose={destroyOnClose}
		>
			{children}
		</StyledModal>
	);
};

export default Modal;
