// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { Alert, Modal } from 'antd';
import { poppins } from 'pages/_app';
import React from 'react';
import { styled } from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import Address from '~src/ui-components/Address';
import SkeletonInput from '~src/basic-components/Skeleton/SkeletonInput';
import useImagePreloader from '~src/hooks/useImagePreloader';
import { IProxyState } from '.';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
	address: string;
	proxyState: IProxyState;
}

const CreateProxySuccessModal = ({ openModal, setOpenModal, className, address, proxyState }: Props) => {
	const isGifLoaded = useImagePreloader('/assets/Gifs/voted.gif');

	return (
		<Modal
			title={false}
			open={openModal}
			footer={false}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className={`${proxyState?.error && 'pb-10'} pb-2`}>
				{' '}
				<div className='flex items-center justify-center pb-10'>
					<div>
						<div className='-mt-[100px]'>
							<Image
								src={!isGifLoaded ? '/assets/Gifs/voted.svg' : '/assets/Gifs/voted.gif'}
								alt='Voted-successfully'
								width={363}
								height={347}
								priority={true}
							/>
						</div>
						<h2 className={`${poppins.variable} ${poppins.className} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>Proxy created successfully</h2>
						<div className='mt-4 flex flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<span className='w-[104px] text-blue-light-medium dark:text-blue-dark-medium'>With Address:</span>
								<Address
									displayInline
									iconSize={18}
									isTruncateUsername={false}
									address={address}
									destroyTooltipOnHide
								/>
							</div>
							<div className='flex items-center gap-2'>
								<span className='w-[104px] text-blue-light-medium dark:text-blue-dark-medium'>Proxy Address:</span>
								{proxyState?.loading ? (
									<SkeletonInput active />
								) : (
									!proxyState?.loading &&
									proxyState?.pureProxyAddress && (
										<Address
											displayInline
											iconSize={18}
											isTruncateUsername={false}
											address={proxyState?.pureProxyAddress}
											destroyTooltipOnHide
										/>
									)
								)}
							</div>
						</div>
					</div>
				</div>
				{proxyState?.error && (
					<Alert
						type='error'
						className={`mx-10 h-10 rounded-[4px] text-bodyBlue ${poppins.variable} ${poppins.className}`}
						showIcon
						message={<span className='dark:text-blue-dark-high'>{proxyState?.error}</span>}
					/>
				)}
			</div>
		</Modal>
	);
};

export default styled(CreateProxySuccessModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
