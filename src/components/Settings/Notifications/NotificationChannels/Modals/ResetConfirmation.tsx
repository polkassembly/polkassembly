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

const ResetConfirmation = ({ open, onConfirm, onCancel, channel }: { open: boolean; onConfirm: () => void; onCancel: () => void; channel: string }) => {
	return (
		<Modal
			title='Confirmation'
			titleIcon={<CheckOutlineIcon />}
			open={open}
			onCancel={onCancel}
			onConfirm={onConfirm}
			footer={[
				<Button
					key='1'
					onClick={onCancel}
					className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#FFFFFF] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary'
				>
					Cancel
				</Button>,
				<Button
					onClick={onConfirm}
					key='2'
					className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#E5007A] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
				>
					Confirm
				</Button>
			]}
		>
			<p className='m-0 my-6 text-[16px] font-medium leading-[21px] text-[#243A57]'>{`Are you sure you want to remove Polkassembly bot from your ${channel} channel chat?`}</p>
			<StyledAlert
				icon={<InfoCircleOutlined />}
				showIcon
				type='info'
				className='bg-[#4E75FF] text-[14px] text-[#fff] '
				message={`Removing bot means no more notifications for ${channel} channel chat, Stay connected and informed by keeping the bot.`}
			/>
			<div className='ml-[-24px] mr-[-24px]'>
				<Divider className='my-4' />
			</div>
		</Modal>
	);
};

export default ResetConfirmation;
