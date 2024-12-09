// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
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
	setOpenProxyMainModal: (pre: boolean) => void;
	className: string;
}

const CreateProxyModal = ({ openModal, setOpenModal, className, setOpenProxyMainModal }: Props) => {
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
							onClick={() => {
								setOpenModal(false);
								setOpenProxyMainModal(true);
							}}
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
			<div className='flex flex-col items-center justify-center p-4'>
				<Image
					src={'/assets/icons/proxy-modal-icon.svg'}
					alt='proxy-icon'
					width={303}
					height={175}
					className='mt-1'
				/>
				<div className='mt-7 px-[14px]'>
					<div className='flex items-start gap-2 text-blue-light-high dark:text-blue-dark-high'>
						<div className='mt-2 h-1 w-[4px] rounded-full bg-blue-light-high dark:bg-blue-dark-high'></div>{' '}
						<span>Proxies are helpful because they let you delegate efficiently and add a layer of security.</span>
					</div>
					<div className='flex items-start gap-2 text-blue-light-high dark:text-blue-dark-high'>
						<div className='mt-2 h-1 w-[6px] rounded-full bg-blue-light-high dark:bg-blue-dark-high'></div>{' '}
						<span>Rather than using funds in a single account, smaller accounts with unique roles can complete tasks on behalf of the main stash account.</span>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default styled(CreateProxyModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
