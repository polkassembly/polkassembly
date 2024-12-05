// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { CloseIcon } from '~src/ui-components/CustomIcons';

const RejectedExpertModal = ({ isModalVisible, handleCancel }: { isModalVisible: boolean; handleCancel: () => void }) => {
	const { t } = useTranslation('common');
	return (
		<div>
			<Modal
				title={null}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={null}
				closeIcon={<CloseIcon className='font-medium text-[#485F7D] dark:text-icon-dark-inactive' />}
			>
				<Image
					src={'/assets/Gifs/reminder.gif'}
					alt='success icon'
					className='mx-auto -mt-52 block'
					width={293}
					height={327}
				/>
				<div className='-mt-8 flex flex-col gap-2 pb-5 text-[#243A57] dark:text-lightWhite'>
					<span className='text-center text-2xl font-semibold '>{t('application_rejected')}</span>
					<span className='px-8 text-center'>{t('we_regret_to_inform_you_that_your_application_to_become_an_expert_was_rejected_by_our_team')}</span>
				</div>
			</Modal>
		</div>
	);
};

export default RejectedExpertModal;
