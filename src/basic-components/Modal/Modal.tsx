// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren, ReactElement } from 'react';
import { Modal as AntdModal, Divider, ModalProps } from 'antd';
import styled from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';

interface IModal extends ModalProps {
	title?: string | ReactElement;
	titleIcon?: ReactElement;
	onConfirm?: any;
	className?: string;
	wrapClassName?: string | undefined;
}

const StyledModal = styled(AntdModal)`
	.ant-modal-close {
		top: 24px !important;
		right: 24px !important;
	}
	.ant-modal .ant-modal-header {
		margin-bottom: -36px !important;
	}
`;

const ModalTitle = ({ title, titleIcon }: { title: string | ReactElement; titleIcon?: ReactElement }) => (
	<div className='text-[18px]'>
		<h3 className='mb-0 flex items-center gap-2 font-semibold text-blue-light-high dark:text-blue-dark-high'>
			{titleIcon} {title}
		</h3>
		<Divider className='text-[#D2D8E0] dark:text-separatorDark' />
	</div>
);

const ModalCloseIcon = ({ className }: { className?: string }) => <CloseIcon className={`font-medium text-lightBlue dark:text-icon-dark-inactive ${className}`} />;

const Modal: FC<PropsWithChildren<IModal>> = (props) => {
	const { wrapClassName, title, titleIcon, className, children, closeIcon } = props;
	return (
		<StyledModal
			title={
				<ModalTitle
					title={title || ''}
					titleIcon={titleIcon}
				/>
			}
			{...props}
			closeIcon={closeIcon ? closeIcon : <ModalCloseIcon />}
			className={`min-w-[350px] md:min-w-[600px] ${className}`}
			wrapClassName={`dark:bg-modalOverlayDark ${wrapClassName}`}
		>
			{children}
		</StyledModal>
	);
};

export default Modal;
