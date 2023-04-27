// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

import Address from './Address';
//import TopicTag from './TopicTag';

interface Props {
	address: string
	topic?: string
	username?: string;
}

const OnchainCreationLabel = ({ address, topic, username }:Props ) => {
	return (
		<div className='flex justify-between min-[340px]:flex-row min-[340px]:items-center text-xs text-navBlue w-full min-[340px]:w-auto'>
			<div className='flex items-center'>
				{
					username || address?
						<>
							{
								address?
									<Address
										address={address}
										className='address '
										displayInline={true}
									/>
									: <span
										className=''
									>
										{username}
									</span>
							}
						</>
						: null
				}
			</div>

		</div>
	);
};

export default OnchainCreationLabel;
