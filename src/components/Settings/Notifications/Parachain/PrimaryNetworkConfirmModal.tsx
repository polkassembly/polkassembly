// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Alert, Divider } from 'antd';
import styled from 'styled-components';
import CheckOutlineIcon from '~assets/icons/check-icon.svg';
import { InfoCircleOutlined } from '@ant-design/icons';
import Modal from '~src/ui-components/Modal';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const StyledAlert = styled(Alert)`
	display: flex;
	align-items: flex-start;
	padding: 14px;
	svg {
		color: white;
		margin-top: 4px;
	}
	.ant-alert-message {
		color: white;
	}
`;

const SetPrimaryNetworkSettingModal = ({ open, onConfirm, onCancel, network }: { open: boolean; onConfirm: () => void; onCancel: () => void; network: string }) => {
	return (
		<Modal
			className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
			title='Confirmation'
			titleIcon={<CheckOutlineIcon />}
			open={open}
			onCancel={onCancel}
			onConfirm={onConfirm}
			footer={[
				<div
					key='footer'
					className='flex items-center justify-end gap-x-1'
				>
					<CustomButton
						key='1'
						onClick={onCancel}
						variant='solid'
						text='Cancel'
					/>
					<CustomButton
						onClick={onConfirm}
						key='2'
						variant='solid'
						text='Confirm'
					/>
				</div>
			]}
		>
			<p className='m-0 my-6 text-[16px] font-medium leading-[21px] text-blue-light-high dark:text-blue-dark-high'>
				{`Are you sure you want ${network} as your Primary Network for
                settings?`}
			</p>
			<StyledAlert
				icon={<InfoCircleOutlined />}
				showIcon
				type='info'
				className='bg-[#4E75FF] text-sm text-[#fff] '
				message={'Primary Network Settings allow you to copy settings to other networks by just one click. You can also change the Primary Network later.'}
			/>
			<div className='ml-[-24px] mr-[-24px]'>
				<Divider className='border-b-1 my-4 dark:border-separatorDark' />
			</div>
		</Modal>
	);
};

export default SetPrimaryNetworkSettingModal;
