// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled } from '@ant-design/icons';
import React from 'react';
import { useUserDetailsContext } from '~src/context';
import DownIcon from '~assets/icons/down-arrow.svg';
import ImageComponent from '~src/components/ImageComponent';

export enum EAddressOtherTextType {
	CONNECTED = 'Connected',
	COUNCIL = 'Council',
	COUNCIL_CONNECTED = 'Council (Connected)',
	LINKED_ADDRESS = 'Linked',
	UNLINKED_ADDRESS = 'Address not linked'
}

interface Props {
	className?: string;
	displayName?: string;
	isVerified?: boolean;
}

const UserProfileDropdown = ({ className, displayName, isVerified }: Props): JSX.Element => {
	const { username, picture } = useUserDetailsContext();
	const profileUsername = displayName || username || '';

	return (
		<div
			className={`${className} user-container flex items-center justify-center gap-1 rounded-3xl bg-[#f6f7f9] px-3 font-semibold`}
			style={{ border: '1px solid #d7dce3' }}
		>
			<ImageComponent
				src={picture}
				alt='User Picture'
				className='flex h-[20px] w-[20px] items-center justify-center bg-transparent'
				iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
			/>
			<div className='flex w-[85%] items-center gap-1 text-xs'>
				<span className={`normal-case ${isVerified && 'truncate'}`}>
					{profileUsername && profileUsername?.length > 11 && !isVerified ? `${profileUsername?.slice(0, 11)}...` : profileUsername}
				</span>
				{isVerified && (
					<CheckCircleFilled
						style={{ color: 'green' }}
						className='rounded-full border-none bg-transparent text-sm'
					/>
				)}
				<DownIcon />
			</div>
		</div>
	);
};

export default UserProfileDropdown;
