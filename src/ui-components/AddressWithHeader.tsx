// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Space } from 'antd';
import IdentityBadge from './IdentityBadge';
import { DeriveAccountFlags, DeriveAccountRegistration } from '@polkadot/api-derive/types';

interface Props {
	extensionName?: string;
	isSubVisible?: boolean;
	sub?: string;
	t2?: string;
	address: string;
	usernameClassName?: string;
	isTruncateUsername?: boolean;
	identity?: DeriveAccountRegistration;
	flags?: DeriveAccountFlags;
	kiltName?: string;
	mainDisplay?: string;
}
const AddressWithHeader = ({ extensionName, isSubVisible, sub, t2, address, isTruncateUsername, usernameClassName, kiltName, identity, flags, mainDisplay }: Props) => {
	return (
		<div className=''>
			<div className='flex items-center'>
				{kiltName ||
					(identity && mainDisplay && (
						<IdentityBadge
							address={address}
							identity={identity}
							flags={flags}
							className='text-navBlue'
						/>
					))}
				<Space className={'header'}>
					<span className={'flex flex-col font-semibold text-bodyBlue'}>
						{t2 && <span className={`${usernameClassName} ${isTruncateUsername && 'w-[85px] truncate'}`}>{t2}</span>}
						{!extensionName && sub && isSubVisible && <span className={`${usernameClassName} ${isTruncateUsername && 'w-[85px] truncate'}`}>{sub}</span>}
					</span>
				</Space>
			</div>
		</div>
	);
};

export default AddressWithHeader;
