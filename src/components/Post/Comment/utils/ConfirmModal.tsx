// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider, Modal } from 'antd';
import Image from 'next/image';
interface ConfirmModalProps {
	isConfirmModalOpen: boolean;
	setIsConfirmModalOpen: (pre: boolean) => void;
	onConfirm?: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isConfirmModalOpen, setIsConfirmModalOpen, onConfirm }) => {
	return (
		<Modal
			title={
				<div>
					<div className='text-base font-semibold text-blue-light-high dark:text-blue-dark-high sm:text-xl'>AI Comment Summary</div>
					<Divider className='-mx-6 h-full w-[520px] bg-section-light-container dark:bg-separatorDark ' />
				</div>
			}
			open={isConfirmModalOpen}
			onCancel={() => setIsConfirmModalOpen(false)}
			footer={false}
		>
			<div className='mx-auto flex w-[400px] flex-col items-center justify-center pb-6'>
				<span className='w-[350px] text-center text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>Was AI generated summary of comments helpful ?</span>
				<div
					onClick={onConfirm}
					className='mt-6 flex items-center gap-10'
				>
					<div className='flex h-[112px] w-[112px] cursor-pointer items-center justify-center rounded-full bg-[#D2D8E0] shadow-md transition-colors duration-300 hover:bg-[#F53C3C]'>
						<Image
							alt='like-icon'
							src='/assets/like-ai-icon.svg'
							width={60}
							height={60}
						/>
					</div>

					<div
						onClick={() => setIsConfirmModalOpen(false)}
						className='flex h-[112px] w-[112px] cursor-pointer items-center justify-center rounded-full bg-[#D2D8E0] shadow-md transition-colors duration-300 hover:bg-[#2ED47A]'
					>
						<Image
							alt='like-icon'
							src='/assets/like-ai-icon.svg'
							width={60}
							height={60}
							className='rotate-180 scale-x-[-1]'
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmModal;
