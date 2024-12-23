// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect } from 'react';
import { useApiContext } from '~src/context';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useRouter } from 'next/router';
import ImageIcon from './ImageIcon';

const TopNudges = () => {
	const { api, apiReady } = useApiContext();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState<boolean | null>(null);

	useEffect(() => {
		if (!api || !apiReady) return;

		const nudgeStatus = sessionStorage.getItem('identityNudgeStatus');

		if (nudgeStatus !== 'viewed') {
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, [api, apiReady]);

	function handleNotificationNudgeClose() {
		sessionStorage.setItem('notificationNudgeStatus', 'viewed');
		setIsOpen(false);
	}

	function handleSetNotificationClicked() {
		router.push('/settings?tab=notifications');
		sessionStorage.setItem('notificationNudgeStatus', 'viewed');
	}

	if (isOpen === null || !isOpen) return null;
	return (
		<>
			<div className='flex flex-row border-none bg-[#2D80FF]'>
				<div className='hidden w-[80px] lg:block'></div>
				<div className='ant-layout-content mx-auto flex w-[94vw] max-w-7xl flex-initial flex-row items-center justify-between gap-8 px-2 py-2 lg:w-[85vw] 2xl:w-5/6'>
					<div
						className='flex flex-col gap-2 text-white sm:inline-flex sm:flex-row sm:items-center'
						onClick={handleSetNotificationClicked}
					>
						Get Alerts for the governance events you are interested in!
						<span className='inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#000000]/30 px-2 py-1 hover:opacity-80'>
							<ImageIcon
								src='/assets/icons/BellNotificationIcon.svg'
								alt='notificationIcon'
							/>
							Set Notifications
						</span>
					</div>
					<span
						className='ml-auto'
						onClick={handleNotificationNudgeClose}
					>
						<CloseIcon className='text-white' />
					</span>
				</div>
			</div>
		</>
	);
};

export default TopNudges;
