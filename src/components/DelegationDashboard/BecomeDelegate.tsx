// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { IDelegationProfileType } from '~src/auth/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import Loader from '~src/ui-components/Loader';
import CloseIcon from '~assets/icons/close-cross-icon.svg';

const BecomeDelegateModal = dynamic(() => import('../../ui-components/BecomeDelegateModal'), {
	loading: () => <Loader />,
	ssr: false
});

interface Props {
	isModalOpen?: boolean;
	setIsModalOpen?: (pre: boolean) => void;
	className?: string;
	profileDetails?: IDelegationProfileType;
	userBio?: string;
	setUserBio?: (pre: string) => void;
	onchainUsername: string;
}

const BecomeDelegate = ({ isModalOpen, setIsModalOpen, profileDetails, userBio, setUserBio, onchainUsername }: Props) => {
	const currentUser = useUserDetailsSelector();
	const [isBecomedelegateVisible, setsBecomedelegateVisible] = useState(true);
	const showModal = () => {
		setIsModalOpen?.(true);
	};
	function handleNotificationNudgeClose() {
		setsBecomedelegateVisible(false);
	}

	return (
		<div className='hidden sm:block'>
			{isBecomedelegateVisible ? (
				<>
					<div className='mb-8 rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
						<div className='flex items-center justify-between'>
							<span className='text-xl font-semibold'>How to Delegate on Polkassembly</span>
							<div className='flex items-center space-x-5'>
								<Button
									onClick={showModal}
									disabled={!currentUser.id || !currentUser.loginAddress}
									className={`border-pink_primary bg-pink_primary font-medium font-semibold text-white dark:text-black ${
										(!currentUser.id || !currentUser.loginAddress) && 'opacity-50'
									}`}
								>
									{!currentUser.id ? <Tooltip title='Please Login to continue'>Become a Delegate</Tooltip> : 'Become a Delegate'}
								</Button>
								<span onClick={handleNotificationNudgeClose}>
									<CloseIcon className='mt-1 cursor-pointer dark:text-white' />
								</span>
							</div>
						</div>
						<div className='flex justify-between'>
							<div className='flex space-x-3'>
								<ImageIcon
									src='/assets/delegation-tracks/become-delegate-1.svg'
									alt='Become delegate icon'
									className='-ml-3'
								/>
								<span className='mt-[22px] whitespace-nowrap text-sm font-semibold'>STEP 1</span>
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
								<span className='mt-[22px] whitespace-nowrap text-sm font-semibold'>STEP 2</span>
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
								<span className='text-blue-light-medium dark:text-[#9E9E9E]'>
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
							isModalOpen={isModalOpen as boolean}
							setIsModalOpen={setIsModalOpen as any}
							className=''
							profileDetails={profileDetails as any}
							userBio={userBio as any}
							setUserBio={setUserBio as any}
							onchainUsername={onchainUsername}
						/>
					</div>
				</>
			) : null}
		</div>
	);
};

export default BecomeDelegate;
