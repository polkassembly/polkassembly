// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React from 'react';

import Address from './Address';

interface Props {
	className?: string;
	defaultAddress?: string | null;
	username?: string;
	disableIdenticon?: boolean;
	usernameClassName?: string;
	disableAddressClick?: boolean;
	truncateUsername?: boolean;
}

const NameLabel = ({ className, defaultAddress, username, disableIdenticon = false, usernameClassName, disableAddressClick = false, truncateUsername }: Props) => {
	const router = useRouter();
	return (
		<div className={`${className}`}>
			{!defaultAddress ? (
				<span
					className={`username mr-1.5 font-semibold text-bodyBlue ${!disableAddressClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
					onClick={() => {
						if (!disableAddressClick) {
							router.push(`/user/${username}`);
						}
					}}
				>
					{username}
				</span>
			) : (
				<Address
					passedUsername={username}
					address={defaultAddress}
					className='text-sm'
					displayInline
					usernameClassName={usernameClassName}
					disableIdenticon={disableIdenticon}
					disableAddressClick={disableAddressClick}
					isTruncateUsername={truncateUsername}
					isSubVisible={false}
				/>
			)}
		</div>
	);
};

export default NameLabel;
