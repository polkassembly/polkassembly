// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal } from 'antd';
import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import AddressDropdown from '~src/ui-components/AddressDropdown';

function ApproveModal({ isApproveModalVisible, handleCancel, handleApprove }: { isApproveModalVisible: boolean; handleCancel: () => void; handleApprove: () => void }) {
	const currentUser = useUserDetailsSelector();

	return (
		<div>
			<Modal
				title={
					<>
						<CheckCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Approve Submission</span>
					</>
				}
				visible={isApproveModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button
						key='cancel'
						onClick={handleCancel}
						className='w-24 rounded-md border border-solid border-pink_primary pb-2 text-center text-[14px] font-medium text-pink_primary'
					>
						Cancel
					</Button>,
					<Button
						key='reject'
						type='primary'
						className='w-24 rounded-md bg-pink_primary pb-2 text-center font-medium text-white'
						onClick={handleApprove}
					>
						Approve
					</Button>
				]}
			>
				<Divider
					className='m-0 mb-3'
					style={{ borderColor: '#D2D8E0' }}
				/>
				<div>
					<label
						htmlFor='account'
						className='mb-1 block text-sm text-blue-light-medium'
					>
						Account
					</label>
					<AddressDropdown
						accounts={currentUser?.addresses?.map((address) => ({ address })) || []}
						defaultAddress={currentUser?.loginAddress}
						onAccountChange={(newAddress) => {
							console.log('Account changed to:', newAddress);
						}}
					/>
				</div>
			</Modal>
		</div>
	);
}

export default ApproveModal;
