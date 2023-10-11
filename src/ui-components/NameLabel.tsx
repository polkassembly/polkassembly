// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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
	usernameMaxLength?: number;
}

const NameLabel = ({
	className,
	defaultAddress,
	username,
	disableIdenticon = false,
	usernameClassName,
	disableAddressClick = false,
	truncateUsername,
	usernameMaxLength
}: Props) => {
	return (
		<div
			className={`${className}`}
			title={username}
		>
			{!defaultAddress ? (
				<span
					className={`username font-semibold text-bodyBlue ${!disableAddressClick ? 'cursor-pointer hover:underline' : 'cursor-not-allowed'}`}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						if (!disableAddressClick) {
							const routePath = `/user/${username}`;
							window.open(routePath, '_blank');
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
					isTruncateUsername={truncateUsername || false}
					isSubVisible={false}
					usernameMaxLength={usernameMaxLength}
				/>
			)}
		</div>
	);
};

export default NameLabel;
