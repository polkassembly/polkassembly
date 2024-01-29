// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
// import BecomeDelegateModal from '~src/ui-components/BecomeDelegateModal';
import ImageIcon from '~src/ui-components/ImageIcon';
import Loader from '~src/ui-components/Loader';

const BecomeDelegateModal = dynamic(() => import('../../ui-components/BecomeDelegateModal'), {
	loading: () => <Loader />,
	ssr: false
});

const BecomeDelegate = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const currentUser = useUserDetailsSelector();
	const showModal = () => {
		setIsModalOpen(true);
	};

	return (
		<div className='rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
			<div className='flex items-center justify-between'>
				<span className='text-xl font-semibold'>How to Delegate on Polkassembly</span>
				{!currentUser.id ? (
					<Button
						onClick={showModal}
						disabled={!currentUser.id}
						className='border-[#E5007A] bg-[#ef66af] text-white'
					>
						<Tooltip title='Please Login to continue'>Become a Delegate</Tooltip>
					</Button>
				) : (
					<Button
						onClick={showModal}
						disabled={!currentUser.id}
						className='border-[#E5007A] bg-[#ef66af] text-white'
					>
						Become a Delegate
					</Button>
				)}
			</div>
			<div className='flex justify-between'>
				<div className='flex space-x-3'>
					<ImageIcon
						src='/assets/delegation-tracks/become-delegate-1.svg'
						alt='Become delegate icon'
						className='-ml-3'
					/>
					<span className='mt-[22px] text-sm font-semibold'>STEP 1</span>
					<div className='mt-[22px] flex max-w-[380px] flex-col text-sm'>
						<span className='font-semibold '>Select Track for Delegation</span>
						<span className='text-blue-light-high dark:text-blue-dark-high'>OpenGov allows for track level agile delegation. Choose a track to proceed.</span>
					</div>
				</div>
				<div className='mr-2 mt-10'>
					<ImageIcon
						src='/assets/delegation-tracks/become-arrow.svg'
						alt='Double side arrow icon'
					/>
				</div>
				<div className='flex space-x-3'>
					<ImageIcon
						src='/assets/delegation-tracks/become-delegate-2.svg'
						alt='Become delegate icon'
						imgClassName='mt-[22px] mr-3'
					/>
					<span className='mt-[22px] text-sm font-semibold'>STEP 2</span>
					<div className='mt-[22px] flex max-w-[380px] flex-col text-sm'>
						<span className='font-semibold'>Select Delegate</span>
						<span className='text-blue-light-high dark:text-blue-dark-high'>Choose a delegate based on the stats to complete your delegation process.</span>
					</div>
				</div>
			</div>

			<Alert
				type='info'
				showIcon
				message={
					<span className='text-blue-light-medium dark:text-blue-dark-high'>
						Want to learn more about delegation process before locking your tokens. Click
						<a
							href='https://docs.polkassembly.io/opengov/learn-about-referenda/voting-on-a-referendum/delegating-voting-power'
							className='ml-[3px] text-[#407BFF] underline'
							target='_blank'
							rel='noreferrer'
						>
							here
						</a>
					</span>
				}
				className='border-none dark:bg-infoAlertBgDark'
			/>
			<BecomeDelegateModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				className=''
			/>
		</div>
	);
};

export default BecomeDelegate;
