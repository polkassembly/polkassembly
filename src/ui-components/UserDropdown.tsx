// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled } from '@ant-design/icons';
import React from 'react';
import ImageComponent from '~src/components/ImageComponent';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { DownArrowIcon } from './CustomIcons';

interface Props {
	className?: string;
	displayName?: string;
	isVerified?: boolean;
}

const UserDropdown = ({ className, displayName, isVerified }: Props): JSX.Element => {
	const { username, picture } = useUserDetailsSelector();
	const profileUsername = displayName || username || '';

	return (
		<div
			className={`${className} user-container flex items-center justify-center gap-1 rounded-3xl border-[#d7dce3] bg-[#f6f7f9] px-3 font-semibold dark:border-separatorDark dark:bg-section-dark-overlay`}
			style={{ border: '1px solid #d7dce3' }}
		>
			<ImageComponent
				src={picture}
				alt='User Picture'
				className='flex h-[16px] w-[16px] items-center justify-center bg-transparent'
				iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
			/>
			<div className='flex w-[85%] items-center gap-1 text-sm dark:text-white'>
				<span className={`normal-case ${isVerified && 'truncate'}`}>
					{!!profileUsername && profileUsername?.length > 11 && !isVerified ? `${profileUsername?.slice(0, 11)}...` : profileUsername}
				</span>
				{isVerified && (
					<CheckCircleFilled
						style={{ color: 'green' }}
						className='rounded-full border-none bg-transparent text-sm'
					/>
				)}
				<DownArrowIcon className='text-2xl' />
			</div>
		</div>
	);
};

export default UserDropdown;
