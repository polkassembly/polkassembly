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
// import { Dropdown, Menu } from 'antd';
import { ProposalType } from '~src/global/proposalType';
import { getLabel } from '../UserProfile/ProfilePosts';

interface IUserData {
	[key: string]: Post[];
}

// const capitalizeFirstLetter = (string: String) => {
// return string
//.split('_')
// .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
// .join(' ');
// };

const Subscriptions = () => {
	const [userData, setUserData] = useState<IUserData>({});
	// const [selectedProposalType, setSelectedProposalType] = useState<string>('referendums_v2');
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

	useEffect(() => {
		const fetchSubscriptions = async () => {
			const proposalTypes = Object.values(ProposalType);
			const userDataTemp: IUserData = {};

			for (const proposalType of proposalTypes) {
				const { data, error } = await nextApiClientFetch('/api/v1/users/user-subscriptions', { proposalType });
				if (data && Array.isArray(data.subscribedPosts) && data.subscribedPosts.length > 0) {
					userDataTemp[proposalType] = data.subscribedPosts;
				}
				if (error) console.log(error);
			}

			setUserData(userDataTemp);
			const firstKey = Object.keys(userDataTemp)[0];
			if (firstKey) {
				setSelectedFilter(firstKey);
			}
		};

		fetchSubscriptions();
	}, []);

	// const proposalTypeItems = Object.entries(userData).map(([proposalType]) => ({
	// key: proposalType,
	// label: capitalizeFirstLetter(proposalType)
	// // onClick: () => setSelectedProposalType(proposalType)
	// }));

	const displayedPosts = selectedFilter ? userData[selectedFilter] : [];
	console.log('userData', userData);
	console.log('selectedFilter', selectedFilter);

	return (
		<div className={''}>
			<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay dark:text-white md:p-8 md:text-base'>
				This is a place to keep track of Subscribed posts.
			</p>
			<div className='mt-2 flex flex-col pb-6'>
				<div className='flex items-center justify-between'>
					<p className='text-xl font-medium'>Posts</p>
					{/* <Dropdown
						overlay={<Menu items={proposalTypeItems} />}
						placement='bottomRight'
					>
						<a onClick={(e) => e.preventDefault()}>Select Proposal Type</a>
					</Dropdown> */}
				</div>
				<div className='flex flex-shrink-0 gap-2'>
					{Object.entries(userData).map(([key, value]) => (
						<div
							key={key}
							onClick={() => setSelectedFilter(key)}
							className={`cursor-pointer rounded-[8px] border-[1px] border-solid px-3 py-1.5 text-xs font-normal capitalize tracking-wide ${
								selectedFilter === key ? 'bg-blue-500 text-white' : 'text-bodyBlue dark:text-blue-dark-high'
							}`}
						>
							{getLabel(key)} ({value.length})
						</div>
					))}
				</div>
				{displayedPosts &&
					displayedPosts.map((post) => (
						<div
							className='mt-6 flex w-full items-center'
							key={post.id}
						>
							<div className='w-[10%] font-semibold'>#{post.id}</div>
							<div className='flex w-[90%] justify-between space-x-1'>
								<div className='flex space-x-1'>
									<span>{post.title}</span>
									<span className='-mt-[1px]'>
										<Link href={`/referenda/${post.id}`}>
											<Image
												src='/assets/icons/redirect.svg'
												alt=''
												height={16}
												width={16}
											/>
										</Link>
									</span>
								</div>
								{post.created_at && (
									<span>
										<ClockCircleOutlined className='mr-1' />
										{getRelativeCreatedAt(new Date(post.created_at._seconds * 1000))}
									</span>
								)}
							</div>
						</div>
					))}
			</div>
		</div>
	);
};

export default Subscriptions;
