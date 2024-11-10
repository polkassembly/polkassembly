// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal } from 'antd';
import Image from 'next/image';
import React from 'react';

const RejectedExpertModal = ({ isModalVisible, handleCancel }: { isModalVisible: boolean; handleCancel: () => void }) => {
	return (
		<div>
			<Modal
				title={null}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				<Image
					src={'/assets/Gifs/reminder.gif'}
					alt='success icon'
					className='mx-auto -mt-52 block'
					width={293}
					height={327}
				/>
				<div className='-mt-10 flex flex-col gap-2 text-[#243A57] dark:text-lightWhite'>
					<span className='text-center text-2xl font-semibold '>Application Rejected!</span>
					<span className='px-8 text-center'>
						We regret to inform you that your application to become an Expert was rejected by our Team! Don’t worry, you can apply again in 30 days!
					</span>
				</div>
				<div className='mt-2 text-center'>
					<Button className='mb-3 h-10 w-96 bg-[#E5007A] text-white'>Set Reminder</Button>
					<Button className='h-10 w-96 border border-solid border-[#E5007A] text-[#E5007A]'>See Why I was Rejected</Button>
				</div>
			</Modal>
		</div>
	);
};

export default RejectedExpertModal;
