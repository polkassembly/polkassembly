// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal } from 'antd';
import Image from 'next/image';
import React from 'react';
import ContentForm from '../ContentForm';

const ExpertPostModal = ({
	isModalVisible,
	handleCancel,
	handleDone,
	review,
	setReview
}: {
	isModalVisible: boolean;
	handleCancel: () => void;
	handleDone: () => void;
	review: string;
	setReview: (content: string) => void;
}) => {
	return (
		<div>
			<Modal
				title={
					<div className='flex items-center gap-2'>
						<Image
							src='/assets/icons/mentoring.svg'
							alt={'Expert Image'}
							width={24}
							height={24}
							className='h-6 w-6'
						/>
						<span className='text-xl font-semibold'>Add Expert Review</span>
					</div>
				}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				<Divider
					type='horizontal'
					className='m-0  rounded-sm border-t-2 border-l-[#D2D8E0] p-0 dark:border-[#4B4B4B]'
				/>
				<div className='my-3'>
					<p className='text-sm font-medium text-[#243A57]'>Please write your views about the proposal below</p>
					<ContentForm
						onChange={(content: any) => setReview(content)}
						value={review}
						height={150}
					/>{' '}
				</div>
				<Divider
					type='horizontal'
					className='m-0 rounded-sm border-t-2 border-l-[#D2D8E0] p-0 dark:border-[#4B4B4B]'
				/>
				<div className='pt-4 text-right'>
					<Button
						className='mr-[8px] h-9 w-28 border border-pink_primary text-pink_primary'
						onClick={handleCancel}
						ghost
					>
						Cancel
					</Button>
					<Button
						className='h-9 w-28 bg-pink_primary text-white'
						onClick={handleDone}
					>
						Done
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default ExpertPostModal;
