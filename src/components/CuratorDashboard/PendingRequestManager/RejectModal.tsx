// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Modal } from 'antd';
import AddressDropdown from '~src/ui-components/AddressDropdown';
import { useUserDetailsSelector } from '~src/redux/selectors';

function RejectModal({
	isRejectModalVisible,
	handleCancel,
	handleReject,
	comment,
	setComment
}: {
	isRejectModalVisible: boolean;
	handleCancel: () => void;
	handleReject: () => void;
	comment: string;
	setComment: (comment: string) => void;
}) {
	const currentUser = useUserDetailsSelector();
	return (
		<div>
			<Modal
				title={
					<>
						<CloseCircleOutlined className='pr-2 text-lg' /> <span className='text-[18px] font-bold'>Reject Submission</span>
					</>
				}
				visible={isRejectModalVisible}
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
						onClick={handleReject}
					>
						Reject
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

					<label
						htmlFor='comment'
						className='mb-1 mt-3 block text-sm text-blue-light-medium'
					>
						Add Comment <span className='text-pink_primary'>*</span>
					</label>
					<Input.TextArea
						id='comment'
						placeholder='Add Comment'
						rows={4}
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>
				</div>
			</Modal>
		</div>
	);
}

export default RejectModal;
