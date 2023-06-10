// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Alert, Divider, Modal } from 'antd';
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
			className='min-w-[600px]'
			onCancel={onCancel}
			onOk={onConfirm}
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
		</Modal>
	);
};

export default SetPrimaryNetworkSettingModal;
