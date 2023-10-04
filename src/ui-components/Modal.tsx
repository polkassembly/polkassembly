// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal as AntdModal, Divider } from 'antd';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';

type Props = PropsWithChildren<{
<<<<<<< HEAD
    title: string | ReactElement,
    titleIcon: ReactElement,
    open: boolean,
    onConfirm: any,
    onCancel: any,
    footer?: Array<ReactElement>
	theme?: string;
}>
=======
	title: string | ReactElement;
	titleIcon: ReactElement;
	open: boolean;
	onConfirm: any;
	onCancel: any;
	footer?: Array<ReactElement>;
	className?: string;
}>;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

const StyledModal = styled(AntdModal)`
	.ant-modal-close {
		top: 24px !important;
		right: 24px !important;
	}
`;

<<<<<<< HEAD
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
		wrapClassName='dark:bg-modalOverlayDark'
=======
const Modal = ({ title, titleIcon, open, onConfirm, onCancel, footer, className, children }: Props) => {
	return (
		<StyledModal
			title={
				<div className='ml-[-24px] mr-[-24px] text-[18px]'>
					<h3 className='align-center mb-0 ml-[24px] flex gap-2 font-semibold text-[#243A57]'>
						{' '}
						{titleIcon} {title}{' '}
					</h3>
					<Divider className='text-[#D2D8E0]' />
				</div>
			}
			open={open}
			closable
			closeIcon={<CloseIcon />}
			className={`min-w-[350px] md:min-w-[600px] ${className}`}
			onCancel={onCancel}
			onOk={onConfirm}
			footer={footer || null}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		>
			{children}
		</StyledModal>
	);
};

export default Modal;
