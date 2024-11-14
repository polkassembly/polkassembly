// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import Image from 'next/image';
import React from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';

const RejectedExpertModal = ({ isModalVisible, handleCancel }: { isModalVisible: boolean; handleCancel: () => void }) => {
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
					<span className='text-center text-2xl font-semibold '>Application Rejected!</span>
					<span className='px-8 text-center'>
						We regret to inform you that your application to become an Expert was rejected by our Team! Don’t worry, you can apply again in 30 days!
					</span>
				</div>
			</Modal>
		</div>
	);
};

export default RejectedExpertModal;
