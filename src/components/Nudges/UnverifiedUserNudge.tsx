// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ShieldUserIcon from '~assets/icons/shield-user-icon.svg';
import { setCookie, getCookie } from 'cookies-next';

const UnverifiedUserNudge = () => {
	const [isOpen, setIsOpen] = useState<boolean>(true);

	useEffect(() => {
		const viewedNudge = getCookie('nudge_viewed');

		if (viewedNudge) {
			setIsOpen(false);
		}
	}, []);

	function handleNudgeClose() {
		setCookie('nudge_viewed', true);
		setIsOpen(false);
	}

	if (!isOpen) return null;

	return (
		<Layout className='flex flex-row'>
			<div className='hidden w-[72px] lg:block '></div>
			<div className='flex w-full flex-row items-center justify-between gap-8 bg-purple-600 px-4 py-2 md:px-8 lg:px-20'>
				<div className='flex flex-col gap-2 sm:inline-flex sm:flex-row sm:items-center'>
					Identity has not been verified yet
					<span className='inline-flex items-center gap-2 rounded-md bg-purple-900 px-2 py-1'>
						<ShieldUserIcon /> Set on-chain identity
					</span>
				</div>
				<span
					className='ml-auto'
					onClick={handleNudgeClose}
				>
					<CloseIcon className='text-white' />
				</span>
			</div>
		</Layout>
	);
};

export default UnverifiedUserNudge;
