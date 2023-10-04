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
<<<<<<< HEAD
		<div className={`${className}`}>
			{!defaultAddress ? <span className={`username text-blue-light-high dark:text-blue-dark-high font-semibold mr-1.5 ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={() => {
				if(clickable){
					router.push(`/user/${username}`);
				}
			}}> { username } </span> :
=======
		<div
			className={`${className}`}
			title={username}
		>
			{!defaultAddress ? (
				<span
					className={`username mr-1.5 font-semibold text-bodyBlue ${!disableAddressClick ? 'cursor-pointer hover:underline' : 'cursor-not-allowed'}`}
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
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
