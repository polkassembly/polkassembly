// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React from 'react';

import Address from './Address';

interface Props {
	className?: string
	defaultAddress?: string | null
	username?: string
	disableIdenticon?: boolean
	textClassName?: string
	clickable?:boolean
	truncateUsername?:boolean;
}

const NameLabel = ({ className, defaultAddress, username, disableIdenticon = false, textClassName, clickable=true , truncateUsername } : Props) => {
	const router = useRouter();
	return (
		<div className={`${className}`}>
			{!defaultAddress ? <span className={`username text-bodyBlue font-semibold mr-1.5 ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={() => {
				if(clickable){
					router.push(`/user/${username}`);
				}
			}}> { username } </span> :
				<Address
					address={defaultAddress}
					className='text-sm'
					textClassName={textClassName}
					displayInline={true}
					disableIdenticon={disableIdenticon}
					clickable={clickable}
					truncateUsername={truncateUsername}
					isSubVisible={false}
				/>
			}
		</div>
	);
};

export default NameLabel;