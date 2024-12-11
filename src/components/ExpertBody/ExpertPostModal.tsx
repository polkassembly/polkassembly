// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal } from 'antd';
import Image from 'next/image';
import React from 'react';
import ContentForm from '../ContentForm';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useTranslation } from 'next-i18next';

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
	const { t } = useTranslation('common');
	return (
		<div>
			<Modal
				title={
					<div className='flex items-center gap-2 dark:text-lightWhite'>
						<Image
							src='/assets/icons/mentoring.svg'
							alt={'Expert Image'}
							width={24}
							height={24}
							className='h-6 w-6'
						/>
						<span className='text-xl font-semibold text-[#243A57]'>{t('add_expert_review')}</span>
					</div>
				}
				visible={isModalVisible}
				onCancel={handleCancel}
				closeIcon={<CloseIcon className='font-medium text-[#485F7D] dark:text-icon-dark-inactive' />}
				footer={null}
			>
				<Divider
					type='horizontal'
					className='m-0  rounded-sm border-t-2 border-l-[#D3D9E0] p-0 dark:border-[#4B4B4B]'
				/>
				<div className='my-3'>
					<p className='text-sm font-medium text-[#243A57] dark:text-lightWhite'>{t('please_write_your_views_about_the_proposal_below')}</p>
					<ContentForm
						onChange={(content: string) => setReview(content)}
						value={review}
						height={150}
					/>{' '}
				</div>
				<Divider
					type='horizontal'
					className='m-0 rounded-sm border-t-2 border-l-[#D3D9E0] p-0 dark:border-[#4B4B4B]'
				/>
				<div className='pt-4 text-right'>
					<Button
						className='mr-[8px] h-9 w-28 border border-pink_primary text-pink_primary'
						onClick={handleCancel}
						ghost
					>
						{t('cancel')}
					</Button>
					<Button
						className='h-9 w-28 bg-pink_primary text-white'
						onClick={handleDone}
					>
						{t('done')}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default ExpertPostModal;
