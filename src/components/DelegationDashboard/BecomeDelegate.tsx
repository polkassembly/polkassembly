// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Alert, Button, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import { IDelegationProfileType } from '~src/auth/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import Loader from '~src/ui-components/Loader';
import CloseIcon from '~assets/icons/close-cross-icon.svg';
import { useTranslation } from 'next-i18next';

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
	const { t } = useTranslation('common');
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
							<span className='text-xl font-semibold text-bodyBlue dark:text-white'>{t('how_to_delegate')}</span>
							<div className='flex items-center space-x-5'>
								<Button
									onClick={showModal}
									disabled={!currentUser.id || !currentUser.loginAddress}
									className={`border-pink_primary bg-pink_primary font-medium font-semibold text-white dark:text-black ${
										(!currentUser.id || !currentUser.loginAddress) && 'opacity-50'
									}`}
								>
									{!currentUser.id ? <Tooltip title={t('login_to_continue')}>{t('become_delegate')}</Tooltip> : t('become_delegate')}
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
									alt={t('delegate_icon')}
									className='-ml-3'
								/>
								<span className='mt-[22px] whitespace-nowrap text-sm font-semibold'>{t('step_1')}</span>
								<div className='mt-[22px] flex max-w-[380px] flex-col text-sm'>
									<span className='font-semibold text-bodyBlue dark:text-white'>{t('select_track')}</span>
									<span className='text-blue-light-high dark:text-blue-dark-high'>{t('track_level_delegation')}</span>
								</div>
							</div>
							<div className='mr-2 mt-10'>
								<ImageIcon
									src='/assets/delegation-tracks/become-arrow.svg'
									alt={t('double_arrow_icon')}
								/>
							</div>
							<div className='flex space-x-3'>
								<ImageIcon
									src='/assets/delegation-tracks/become-delegate-2.svg'
									alt={t('delegate_icon')}
									imgClassName='mt-[22px] mr-3'
								/>
								<span className='mt-[22px] whitespace-nowrap text-sm font-semibold'>{t('step_2')}</span>
								<div className='mt-[22px] flex max-w-[380px] flex-col text-sm'>
									<span className='font-semibold text-bodyBlue dark:text-white'>{t('select_delegate')}</span>
									<span className='text-blue-light-high dark:text-blue-dark-high'>{t('choose_delegate')}</span>
								</div>
							</div>
						</div>

						<Alert
							type='info'
							showIcon
							message={
								<span className='text-blue-light-medium dark:text-[#9E9E9E]'>
									{t('learn_more_before_locking')}
									<a
										href='https://docs.polkassembly.io/opengov/learn-about-referenda/voting-on-a-referendum/delegating-voting-power'
										className='ml-[3px] text-[#407BFF] underline'
										target='_blank'
										rel='noreferrer'
									>
										{t('here')}
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
