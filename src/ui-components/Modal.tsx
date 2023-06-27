// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { PropsWithChildren, ReactElement } from 'react';
import { Modal as AntdModal, Divider } from 'antd';
import CloseIcon from '~assets/icons/close-icon.svg';
import styled from 'styled-components';

type Props = PropsWithChildren<{
    title: string | ReactElement,
    titleIcon: any,
    open: boolean,
    onConfirm: any,
    onCancel: any,
    footer?: Array<ReactElement>
}>

const Modal = ({ title, titleIcon, open, onConfirm, onCancel, footer, children }: Props) => {
	return (
		<AntdModal title={<div className='mr-[-24px] ml-[-24px] text-[18px]'>
			<h3 className='ml-[24px] mb-0 font-semibold text-[#243A57]'> {titleIcon} {title} </h3>
			<Divider />
		</div>}
		open={open}
		closeIcon={<CloseIcon />}
		className='min-w-[350px] md:min-w-[600px]'
		onCancel={onCancel}
		onOk={onConfirm}
		footer={footer || null}
		>
			{children}
		</AntdModal>
	);
};

export default styled(Modal)`
.ant-modal-close-x{
    position: relative !important;
    top: 6px !important;
    right: 6px !important;
}
`;