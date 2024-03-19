// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Post } from '~src/types';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';

interface IUserData {
	subscribedPosts?: Post[];
}

const Subscriptions = () => {
	const [userData, setUserData] = useState<IUserData>({});

	const fetchSubscriptions = async () => {
		const { data, error } = await nextApiClientFetch('/api/v1/users/user-subscriptions', { proposalType: 'referendums_v2' });

		if (data) {
			setUserData(data);
		}
		if (error) console.log(error);
	};

	useEffect(() => {
		fetchSubscriptions();
	}, []);
	console.log('DATA', userData);

	return (
		<div className={''}>
			<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay dark:text-white md:p-8 md:text-base'>
				This is a place to keep track of Subscribed posts.
			</p>
			<div className='mt-2 flex flex-col pb-6'>
				<p className='text-xl font-medium'>Posts</p>
				{userData.subscribedPosts &&
					userData.subscribedPosts.map((post) => {
						const createdAt = post?.created_at?._seconds;
						const createdAtDate = createdAt ? new Date(createdAt * 1000) : null;
						return (
							<div
								className='my-3 flex'
								key={post.id}
							>
								<div className='w-[10%] font-semibold'>#{post.id}</div>
								<div className='flex w-[90%] space-x-1'>
									<span>{post.title}</span>
									<span>
										<Link
											href={`/referenda/${post?.id}`}
											target='_blank'
											className='flex items-center gap-1 text-sm font-medium'
										>
											<Image
												src='/assets/icons/redirect.svg'
												alt=''
												height={16}
												width={16}
											/>
										</Link>
									</span>
								</div>
								{post?.created_at && (
									<span className='flex flex-shrink-0 items-center gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
										<ClockCircleOutlined />
										{getRelativeCreatedAt(createdAtDate!)}
									</span>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default Subscriptions;
