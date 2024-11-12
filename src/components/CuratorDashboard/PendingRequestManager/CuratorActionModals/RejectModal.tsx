// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Divider, Modal } from 'antd';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import InputTextarea from '~src/basic-components/Input/InputTextarea';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import CustomButton from '~src/basic-components/buttons/CustomButton';

function RejectModal({
	open,
	setOpen,
	handleReject,
	comment,
	setComment
}: {
	open: boolean;
	setOpen: (pre: boolean) => void;
	handleReject: () => void;
	setComment: (pre: string) => void;
	comment: string;
}) {
	const { loginAddress } = useUserDetailsSelector();

	return (
		<div>
			<Modal
				className={classNames(poppins.className, poppins.variable)}
				title={
					<div className='text-bodyBlue dark:text-white'>
						<CloseCircleOutlined className='pr-2 text-lg' /> <span className='text-lg font-bold'>Reject Submission</span>
					</div>
				}
				open={open}
				onCancel={() => setOpen(false)}
				footer={
					<div className='mt-6 flex w-full items-center justify-end gap-1'>
						<CustomButton
							variant='default'
							key='cancel'
							onClick={() => setOpen(false)}
							height={30}
							width={100}
						>
							Cancel
						</CustomButton>
						<CustomButton
							key='reject'
							variant='primary'
							type='primary'
							onClick={handleReject}
							disabled={!comment?.length}
							height={30}
							width={100}
						>
							Reject
						</CustomButton>
					</div>
				}
			>
				<Divider
					className='m-0 mb-3'
					style={{ borderColor: '#D2D8E0' }}
				/>
				<div className='mt-6'>
					<label
						htmlFor='account'
						className='mb-0.5 block text-sm text-lightBlue dark:text-white'
					>
						Account
					</label>
					<div className='flex h-10 items-center rounded-sm border-[1px] border-solid  border-section-light-container px-3 dark:border-separatorDark'>
						<Address
							address={loginAddress}
							displayInline
							disableTooltip
							isTruncateUsername={false}
						/>
					</div>

					<label
						htmlFor='comment'
						className='mb-0.5 mt-4 block text-sm text-lightBlue dark:text-white'
					>
						Add Comment <span className='text-pink_primary'>*</span>
					</label>
					<InputTextarea
						id='comment'
						placeholder='Add Comment'
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>
				</div>
			</Modal>
		</div>
	);
}

export default RejectModal;
