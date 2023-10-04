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
		<div className='flex w-full justify-between text-xs text-lightBlue min-[340px]:w-auto min-[340px]:flex-row min-[340px]:items-center'>
			<div className='flex items-center'>
<<<<<<< HEAD
				{
					username || address?
						<>
							{
								address?
									<Address
										address={address}
										className='address '
										displayInline={true}
										truncateUsername={truncateUsername}
										isSubVisible={false}
										textClassName='text-blue-light-high dark:text-blue-dark-high font-semibold'
									/>
									: <span
										className='max-w-[150px] text-ellipsis overflow-hidden text-blue-light-high dark:text-blue-dark-high font-semibold'
									>
										<Link href={`/user/${username}`}>{username}</Link>
									</span>
							}
						</>
						: null
				}
=======
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
							<span className='max-w-[150px] overflow-hidden text-ellipsis font-semibold text-bodyBlue'>
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
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			</div>
		</div>
	);
};

export default OnchainCreationLabel;
