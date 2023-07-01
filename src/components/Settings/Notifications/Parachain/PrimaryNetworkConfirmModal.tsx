// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Alert, Button, Divider } from 'antd';
import styled from 'styled-components';
import CheckOutlineIcon from '~assets/icons/check-icon.svg';
import { InfoCircleOutlined } from '@ant-design/icons';
import Modal from '~src/ui-components/Modal';

const StyledAlert = styled(Alert)`
	display:flex;
	align-items: flex-start;
	padding:14px;
    svg {
        color: white;
		margin-top:4px;
    }
    .ant-alert-message {
        color: white;
    }
`;

const SetPrimaryNetworkSettingModal = ({
	open,
	onConfirm,
	onCancel,
	network
}: {
    open: boolean;
    onConfirm:() => void;
    onCancel: () => void;
    network: string;
}) => {
	return (
		<Modal
			title='Confirmation'
			titleIcon={<CheckOutlineIcon /> }
			open={open}
			onCancel={onCancel}
			onConfirm={onConfirm}
			footer={[
				<Button
					key='1' onClick={onCancel}
					className='h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
				>
                    Cancel
				</Button>,
				<Button
					onClick={onConfirm}
					key='2'
					className='h-10 rounded-[6px] bg-[#E5007A] border border-solid border-pink_primary px-[36px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
				>
                    Confirm
				</Button>
			]}
		>
			<p className='text-[16px] font-medium m-0 my-6 leading-[21px] text-[#243A57]'>
				{`Are you sure you want ${network} as your Primary Network for
                settings?`}
			</p>
			<StyledAlert
				icon={<InfoCircleOutlined/>}
				showIcon
				type='info'
				className='text-[14px] bg-[#4E75FF] text-[#fff] '
				message={
					'Primary Network Settings allow you to copy settings to other networks by just one click. You can also change the Primary Network later.'
				}
			/>
			<div className='mr-[-24px] ml-[-24px]'>
				<Divider className='my-4'/>
			</div>
		</Modal>
	);
};

export default SetPrimaryNetworkSettingModal;
