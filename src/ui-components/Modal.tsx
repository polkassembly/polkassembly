// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal as AntdModal, Divider } from 'antd';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';

type Props = PropsWithChildren<{
	title: string | ReactElement;
	titleIcon: ReactElement;
	open: boolean;
	onConfirm: any;
	onCancel: any;
	footer?: Array<ReactElement>;
	className?: string;
}>;

const StyledModal = styled(AntdModal)`
	.ant-modal-close {
		top: 24px !important;
		right: 24px !important;
	}
`;

const Modal = ({ title, titleIcon, open, onConfirm, onCancel, footer, className, children }: Props) => {
	return (
		<StyledModal
			title={
				<div className='ml-[-24px] mr-[-24px] text-[18px] dark:bg-section-dark-overlay'>
					<h3 className='align-center mb-0 ml-[24px] flex gap-2 font-semibold text-blue-light-high dark:text-blue-dark-high'>
						{' '}
						{titleIcon} {title}{' '}
					</h3>
					<Divider className='text-section-light-container dark:text-separatorDark' />
				</div>
			}
			open={open}
			closable
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			className={`min-w-[350px] md:min-w-[600px] ${className}`}
			wrapClassName='dark:bg-modalOverlayDark'
			onCancel={onCancel}
			onOk={onConfirm}
			footer={footer || null}
		>
			{children}
		</StyledModal>
	);
};

export default Modal;
