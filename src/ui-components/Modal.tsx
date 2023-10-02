// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal as AntdModal, Divider } from 'antd';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';

type Props = PropsWithChildren<{
    title: string | ReactElement,
    titleIcon: ReactElement,
    open: boolean,
    onConfirm: any,
    onCancel: any,
    footer?: Array<ReactElement>
	theme?: string;
}>

const StyledModal = styled(AntdModal)`
.ant-modal-close {
    top: 24px !important;
    right: 24px !important;
}
`;

const Modal = ({ title, titleIcon, open, onConfirm, onCancel, footer, children,theme }: Props) => {
	return (
		<StyledModal title={<div className='mr-[-24px] ml-[-24px] text-[18px] dark:bg-section-dark-overlay'>
			<h3 className='ml-[24px] mb-0 font-semibold text-blue-light-high dark:text-blue-dark-high flex align-center gap-2'> {titleIcon} {title} </h3>
			<Divider className='text-[#D2D8E0] dark:text-separatorDark'/>
		</div>}
		open={open}
		closable
		closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive'/>}
		className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''} min-w-[350px] md:min-w-[600px]`}
		onCancel={onCancel}
		onOk={onConfirm}
		footer={footer || null}
		>
			{children}
		</StyledModal>
	);
};

export default Modal;