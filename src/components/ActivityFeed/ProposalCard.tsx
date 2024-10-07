// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { GET_VOTES_COUNT_FOR_TIMESPAN_FOR_ADDRESS } from '~src/queries';
import { useNetworkSelector } from '~src/redux/selectors';
import { IUserDetailsStore } from '~src/redux/userDetails/@types';
import { EGovType } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface RankCardProps {
	currentUser: IUserDetailsStore | null;
}
const ProposalCard: React.FC<RankCardProps> = ({ currentUser }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const selectedGov = isOpenGovSupported(network) ? EGovType.OPEN_GOV : EGovType.GOV1;

	const [proposaldata, setProposalData] = useState({ proposals: 0, votes: 0 });
	async function getProposalData() {
		if (!currentUser) return;
		const fifteenDaysAgo = dayjs().subtract(15, 'days').toISOString();

		try {
			const addresses = Array.isArray(currentUser.addresses) ? currentUser.addresses : typeof currentUser.addresses === 'string' ? [currentUser.addresses] : [];
			const encodedAddresses = addresses.map((address) => getEncodedAddress(address, network)).filter(Boolean);
			if (encodedAddresses.length === 0) {
				throw new Error('No valid addresses provided');
			}

			if (!encodedAddresses || encodedAddresses.length === 0) {
				throw new Error('Failed to encode addresses');
			}

			const payload = {
				addresses: encodedAddresses,
				type: selectedGov === EGovType.OPEN_GOV ? 'ReferendumV2' : 'Referendum'
			};
			const votecountresponse = await fetchSubsquid({
				network: network || 'polkadot',
				query: GET_VOTES_COUNT_FOR_TIMESPAN_FOR_ADDRESS,
				variables: {
					addresses: payload.addresses,
					createdAt_gt: fifteenDaysAgo,
					voteType: payload.type
				}
			});

			const voteCount = votecountresponse?.data?.flattenedConvictionVotesConnection?.totalCount || 0;
			const { data, error } = await nextApiClientFetch<any>('/api/v1/posts/user-total-post-counts', payload);
			if (error) {
				throw new Error(error);
			}
			if (!data) {
				throw new Error('Data is undefined');
			}
			setProposalData({
				proposals: data.proposals || 0,
				votes: voteCount
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
				<div className='flex items-center justify-between gap-2'>
					<div className='flex items-center'>
						<div>
							<p className='whitespace-nowrap pt-3  font-semibold text-[#243A57] dark:text-white xl:text-[15px] 2xl:text-[18px]'>Voted Proposals</p>
						</div>
						<Image
							src={`${theme === 'dark' ? '/assets/activityfeed/arrow-dark.svg' : '/assets/activityfeed/arrow.svg'}`}
							alt=''
							className=' -mt-[4px] h-3 w-3 p-0 pl-1 text-[#485F7D] dark:text-[#9E9E9E]'
							width={1}
							height={1}
						/>
					</div>
					<div className='mt-[7px]'>
						<p className='whitespace-nowrap rounded-full bg-[#485F7D] bg-opacity-[5%] p-2 px-3 text-[11px] text-[#485F7DCC] text-opacity-[80%] dark:bg-[#3F3F4080] dark:bg-opacity-[50%] dark:text-[#9E9E9ECC] dark:text-opacity-[80%]'>
							Last 15 days
						</p>
					</div>
				</div>
				<div>
					<p className='text-[#485F7D] dark:text-[#9E9E9E]'>
						<span className='text-xl font-semibold text-[#E5007A]'>{proposaldata.votes}</span> out of{' '}
						<span className='text-md font-semibold text-[#485F7D] dark:text-[#9E9E9E]'>{proposaldata.proposals}</span> active proposals
					</p>
				</div>
			</div>
		</div>
	);
};

export default ProposalCard;
