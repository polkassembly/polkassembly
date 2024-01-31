// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect } from 'react';
import { useApiContext } from '~src/context';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ShieldUserIcon from '~assets/icons/shield-user-icon.svg';
import BellNotificationIcon from '~assets/icons/BellNotificationIcon.svg';

interface Props {
	isIdentitySet: boolean;
	handleSetIdentityClick: () => void;
}

const SetNudge = ({ isIdentitySet, handleSetIdentityClick }: Props) => {
	const { api, apiReady } = useApiContext();
	const [isOpen, setIsOpen] = useState<boolean | null>(null);
	const [notificationVisible, setNotificationVisible] = useState(true);

	useEffect(() => {
		if (!api || !apiReady) return;

		const nudgeStatus = localStorage.getItem('identityNudgeStatus');

		if (nudgeStatus !== 'viewed') {
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, [api, apiReady]);

	function handleNudgeClose() {
		localStorage.setItem('identityNudgeStatus', 'viewed');
		setIsOpen(false);
	}
	function handleNotificationNudgeClose() {
		localStorage.setItem('notificationNudgeStatus', 'viewed');
		setNotificationVisible(false);
	}

	function handleSetNotificationClicked() {
		setNotificationVisible(false);
		const currentLocation = window.location;

		// Construct the new URL by combining the protocol, host, and the new path
		const newPath = '/settings?tab=notifications';
		const newUrl = `${currentLocation.protocol}//${currentLocation.host}${newPath}`;

		// Redirect the browser to the new URL
		window.location.href = newUrl;
		localStorage.setItem('notificationNudgeStatus', 'viewed');
	}

	if (isOpen === null || !isOpen) return null;

	return (
		<>
			{notificationVisible ? (
				<div className='flex flex-row border-none bg-[#2D80FF]'>
					<div className='hidden w-[80px] lg:block'></div>
					<div className='ant-layout-content mx-auto flex w-[94vw] max-w-7xl flex-initial flex-row items-center justify-between gap-8 px-2 py-2 lg:w-[85vw] 2xl:w-5/6'>
						<div
							className='flex flex-col gap-2 text-white sm:inline-flex sm:flex-row sm:items-center'
							onClick={handleSetNotificationClicked}
						>
							Get Alerts for the governance events you are interested in!
							<span className='inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#000000]/30 px-2 py-1 hover:opacity-80'>
								<BellNotificationIcon />
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
			) : (
				<div className='flex flex-row border-none bg-[#5D38F4]'>
					<div className='hidden w-[80px] lg:block'></div>
					<div className='ant-layout-content mx-auto flex w-[94vw] max-w-7xl flex-initial flex-row items-center justify-between gap-8 px-2 py-2 lg:w-[85vw] 2xl:w-5/6'>
						<div
							className='flex flex-col gap-2 text-white sm:inline-flex sm:flex-row sm:items-center'
							onClick={handleSetIdentityClick}
						>
							{isIdentitySet ? 'Identity has not been verified yet' : 'Identity has not been set yet'}
							<span className='inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#000000]/30 px-2 py-1 hover:opacity-80'>
								<ShieldUserIcon /> {isIdentitySet ? 'Verify on-chain identity' : 'Set on-chain identity'}
							</span>
						</div>
						<span
							className='ml-auto'
							onClick={handleNudgeClose}
						>
							<CloseIcon className='text-white' />
						</span>
					</div>
				</div>
			)}
		</>
	);
};

export default SetNudge;
