// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

import Address from './Address';
import Link from 'next/link';
//import TopicTag from './TopicTag';

interface Props {
	address: string;
	topic?: string;
	username?: string;
	truncateUsername?: boolean;
}

const OnchainCreationLabel = ({ address, username, truncateUsername }: Props) => {
	return (
		<div className='flex w-full justify-between text-xs text-lightBlue dark:text-blue-dark-medium min-[340px]:w-auto min-[340px]:flex-row min-[340px]:items-center'>
			<div className='flex items-center'>
				{username || address ? (
					<>
						{address ? (
							<Address
								address={address}
								className='address '
								displayInline
								isTruncateUsername={truncateUsername}
								isSubVisible={false}
								usernameClassName='font-semibold'
							/>
						) : (
							<span className='max-w-[150px] overflow-hidden text-ellipsis font-semibold text-bodyBlue dark:text-blue-dark-high'>
								<Link
									href={`/user/${username}`}
									target='_blank'
									rel='noreferrer'
								>
									{username}
								</Link>
							</span>
						)}
					</>
				) : null}
			</div>
		</div>
	);
};

export default OnchainCreationLabel;
