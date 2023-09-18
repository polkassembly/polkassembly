// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import IdentityBadge from './IdentityBadge';
import { DeriveAccountFlags, DeriveAccountRegistration } from '@polkadot/api-derive/types';

interface IInlineAddress {
	mainDisplay?: string;
	encodedAddress?: string;
	t1?: string;
	sub?: string;
	isSubVisible?: boolean;
	usernameClassName?: string;
	isTruncateUsername?: boolean;
	address: string;
	identity?: DeriveAccountRegistration;
	flags?: DeriveAccountFlags;
	kiltName?: string;
}

const InlineAddress = ({ mainDisplay, encodedAddress, t1, sub, isSubVisible, usernameClassName, isTruncateUsername, flags, identity, address, kiltName }: IInlineAddress) => {
	return (
		<div className='flex items-center gap-1'>
			{kiltName ||
				(identity && mainDisplay && (
					<IdentityBadge
						address={address}
						identity={identity}
						flags={flags}
						className='text-navBlue'
					/>
				))}

			<div className={'flex items-center font-medium text-bodyBlue hover:underline'}>
				<span
					title={mainDisplay || encodedAddress}
					className={`flex gap-x-1 ${usernameClassName ? usernameClassName : 'text-sm font-medium text-bodyBlue'}`}
				>
					{t1 && <span className={`${isTruncateUsername && 'max-w-[85px] truncate'}`}>{t1}</span>}
					{sub && isSubVisible && <span className={`${isTruncateUsername && 'max-w-[85px] truncate'}`}>{sub}</span>}
				</span>
			</div>
		</div>
	);
};

export default InlineAddress;
