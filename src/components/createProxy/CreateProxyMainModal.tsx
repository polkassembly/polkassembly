import { Divider, Modal } from 'antd';
import { poppins } from 'pages/_app';
import React from 'react';
import { styled } from 'styled-components';
import { CloseIcon, ProxyIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import CustomButton from '~src/basic-components/buttons/CustomButton';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
}

const CreateProxyMainModal = ({ openModal, setOpenModal, className }: Props) => {
	return (
		<Modal
			title={
				<div>
					<div
						className={`${poppins.variable} ${poppins.className} flex items-center px-6 py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
					>
						<span className='flex items-center gap-x-2 text-xl font-semibold text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
							<ProxyIcon className='userdropdown-icon text-2xl' />
							<span>Proxy</span>
						</span>
					</div>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={openModal}
			footer={
				<div className=''>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
					<div className={`${poppins.variable} ${poppins.className} px-6 py-4`}>
						<CustomButton
							onClick={() => {}}
							height={40}
							className='w-full'
							text="Let's Begin"
							variant='primary'
						/>
					</div>
				</div>
			}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div>Hello</div>
		</Modal>
	);
};

export default styled(CreateProxyMainModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
