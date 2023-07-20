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

const OnchainCreationLabel = ({
	address,
	username,
	truncateUsername,
}: Props) => {
	return (
		<div className="flex justify-between min-[340px]:flex-row min-[340px]:items-center text-xs text-[#485F7D] w-full min-[340px]:w-auto">
			<div className="flex items-center">
				{username || address ? (
					<>
						{address ? (
							<Address
								address={address}
								className="address "
								displayInline={true}
								truncateUsername={truncateUsername}
							/>
						) : (
							<span className="max-w-[150px] text-ellipsis overflow-hidden text-[#243a57] font-semibold">
								<Link href={`/user/${username}`}>
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
