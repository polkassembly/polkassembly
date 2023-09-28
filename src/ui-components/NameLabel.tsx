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
	textClassName?: string;
	clickable?: boolean;
	truncateUsername?: boolean;
}

const NameLabel = ({ className, defaultAddress, username, disableIdenticon = false, textClassName, clickable = true, truncateUsername }: Props) => {
	return (
		<div className={`${className}`}>
			{!defaultAddress ? (
				<span
					className={`username mr-1.5 font-semibold text-bodyBlue ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
					onClick={() => {
						if (clickable) {
							const routePath = `/user/${username}`;
							window.open(routePath, '_blank');
						}
					}}
				>
					{' '}
					{username}{' '}
				</span>
			) : (
				<Address
					passedUsername={username}
					address={defaultAddress}
					className='text-sm'
					textClassName={textClassName}
					displayInline={true}
					disableIdenticon={disableIdenticon}
					clickable={clickable}
					truncateUsername={truncateUsername}
					isSubVisible={false}
				/>
			)}
		</div>
	);
};

export default NameLabel;
