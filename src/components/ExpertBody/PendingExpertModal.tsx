// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import Image from 'next/image';
import React from 'react';

const PendingExpertModal = ({ isModalVisible, handleCancel }: { isModalVisible: boolean; handleCancel: () => void }) => {
	return (
		<div>
			<Modal
				title={null}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				<Image
					src={'/assets/Gifs/pendingstate.gif'}
					alt='success icon'
					className='mx-auto -mt-44 block'
					width={293}
					height={327}
				/>
				<div className='-mt-20 flex flex-col gap-2 pb-5 text-[#243A57] dark:text-lightWhite'>
					<span className='text-center text-2xl font-semibold '>Application under Review</span>
					<span className='px-8 text-center'>Your application is being thoroughly checked by our team! Please wait while we get back to you! </span>
				</div>
			</Modal>
		</div>
	);
};

export default PendingExpertModal;
