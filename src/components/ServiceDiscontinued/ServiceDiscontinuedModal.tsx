// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { DISCONTINUED_SERVICE_DATE, DISCONTINUED_SERVICES } from 'src/global/discontinuedServices';
import Modal from '~src/ui-components/Modal';
import CustomButton from '~src/basic-components/buttons/CustomButton';

function ServiceDiscontinuedModal({ network }: { network: string }) {
	const router = useRouter();
	const isDiscontinuedService = DISCONTINUED_SERVICES.includes(network);
	const discontinuedDate = new Date(DISCONTINUED_SERVICE_DATE);
	const isAfterDiscontinuationDate = discontinuedDate < new Date();
	const [openModal, setOpenModal] = useState(true);

	const handleNetworkChange = () => {
		router.push('https://polkadot.polkassembly.io/');
	};

	return isDiscontinuedService && isAfterDiscontinuationDate ? (
		<Modal
			open={openModal}
			onCancel={() => setOpenModal(false)}
			onConfirm={() => setOpenModal(false)}
			title='Services Discontinued'
			titleIcon={
				<Image
					src='/assets/icons/service-discontinued-icon.svg'
					alt='service-discontinued-icon'
					width={24}
					height={24}
				/>
			}
			className='max-w-xl p-6'
		>
			<div className='flex flex-col items-center justify-center gap-6'>
				<Image
					src='/assets/Gifs/spam-gif.gif'
					alt='spam-post-modal'
					width={180}
					height={180}
				/>
				<span className='text-center text-xl font-semibold'>Services for this network are no longer available</span>
				<div className='flex w-full max-w-md flex-col items-center justify-center gap-5 pb-4'>
					<CustomButton
						variant='primary'
						onClick={() => {
							setOpenModal(false);
						}}
						className='w-full'
						text='View Archived Posts'
					/>
					<CustomButton
						variant='default'
						onClick={handleNetworkChange}
						className='w-full'
						text='Change Network'
					/>
				</div>
			</div>
		</Modal>
	) : null;
}

export default ServiceDiscontinuedModal;
