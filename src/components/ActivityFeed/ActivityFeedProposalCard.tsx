// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { IUserDetailsStore } from '~src/redux/userDetails/@types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface IRankCardProps {
	currentUser: IUserDetailsStore | null;
}
const ActivityFeedProposalCard: React.FC<IRankCardProps> = ({ currentUser }) => {
	const { network } = useNetworkSelector();
	const [proposaldata, setProposalData] = useState<{ totalVotes: number; activeProposals: number }>({
		activeProposals: 0,
		totalVotes: 0
	});
	const { username, id } = useUserDetailsSelector();

	async function getProposalData() {
		if (!currentUser) return;

		try {
			const addresses = Array?.isArray(currentUser?.addresses) ? currentUser?.addresses : typeof currentUser?.addresses === 'string' ? [currentUser?.addresses] : [];
			const encodedAddresses = addresses?.map((address) => getEncodedAddress(address, network))?.filter(Boolean);
			if (encodedAddresses.length === 0) {
				throw new Error('No valid addresses provided');
			}

			if (!encodedAddresses || encodedAddresses?.length === 0) {
				throw new Error('Failed to encode addresses');
			}

			const { data, error } = await nextApiClientFetch<any>('/api/v1/activity-feed/getActiveVotesInLastFifDays', {
				addresses: encodedAddresses
			});
			if (error) {
				return console.error(error);
			}

			setProposalData({
				activeProposals: data?.activeProposals || 0,
				totalVotes: data?.totalVotes || 0
			});
		} catch (err) {
			console.error('Failed to fetch proposal data:', err);
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			await getProposalData();
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser, network]);

	return (
		<div>
			<div className='mt-5 rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 text-[13px] dark:border-[#4B4B4B] dark:bg-section-dark-overlay md:p-5'>
				<div className='flex items-start justify-between gap-2'>
					<div className='flex items-center pt-1.5'>
						<div className='whitespace-nowrap font-semibold text-[#243A57] dark:text-white xl:text-[15px] 2xl:text-[18px]'>Voted Proposals</div>
						{!!id && !!username && (
							<Link
								className='flex items-center border-none bg-transparent bg-none p-0'
								href={`/user/${username}`}
								target='_blank'
							>
								<RightOutlined className='h-3 w-4 p-0 pl-1 text-xl text-blue-light-medium dark:text-[#9E9E9E]' />
							</Link>
						)}
					</div>
					<p className='whitespace-nowrap rounded-full bg-[#485F7D] bg-opacity-[5%] p-2 px-3 text-[11px] text-[#485F7DCC] text-opacity-[80%] dark:bg-[#3F3F4080] dark:bg-opacity-[50%] dark:text-[#9E9E9ECC] dark:text-opacity-[80%]'>
						Last 15 days
					</p>
				</div>
				<div>
					<p className='text-blue-light-medium dark:text-[#9E9E9E]'>
						<Link
							className='mr-1'
							href={`/user/${username}`}
							target='_blank'
						>
							<span className='text-xl font-semibold text-pink_primary'>{proposaldata?.totalVotes}</span>
						</Link>
						out of <span className='text-md font-semibold text-blue-light-medium dark:text-[#9E9E9E]'>{proposaldata?.activeProposals}</span> active proposals
					</p>
				</div>
			</div>
		</div>
	);
};

export default ActivityFeedProposalCard;
