// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Alert, Button, Divider, Modal } from 'antd';
import styled from 'styled-components';
import { CheckOutlineIcon } from '~src/ui-components/CustomIcons';

const StyledAlert = styled(Alert)`
    svg {
        color: white;
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
			title={
				<div className='mr-[-24px] ml-[-24px]'>
					<h3 className='ml-[24px] mb-0 flex items-center gap-3'>
						<CheckOutlineIcon /> Confirmation
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			onCancel={onCancel}
			onOk={onConfirm}
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
			<p className='text-[16px] font-normal m-0 m-6'>
                Are you sure you want ${network} as your Primary Network for
                settings?
			</p>
			<StyledAlert
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
