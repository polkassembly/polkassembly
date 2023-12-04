// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect } from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ShieldUserIcon from '~assets/icons/shield-user-icon.svg';

interface Props {
	isIdentitySet: boolean;
	handleSetIdentityClick: () => void;
}

const SetIdentityNudge = ({ isIdentitySet, handleSetIdentityClick }: Props) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	useEffect(() => {
		const nudgeStatus = localStorage.getItem('identityNudgeStatus');

		if (nudgeStatus !== 'viewed') {
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, []);

	function handleNudgeClose() {
		localStorage.setItem('identityNudgeStatus', 'viewed');
		setIsOpen(false);
	}

	if (!isOpen) return null;

	return (
		<div className='flex flex-row border-none bg-[#5D38F4]'>
			<div className='hidden w-[72px] lg:block'></div>
			<div className='mx-auto flex w-[94vw] max-w-7xl flex-initial flex-row items-center justify-between gap-8 py-2 lg:w-[85vw] 2xl:w-5/6'>
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
	);
};

export default SetIdentityNudge;
