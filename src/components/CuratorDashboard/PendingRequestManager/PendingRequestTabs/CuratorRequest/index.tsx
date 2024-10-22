// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { EPendingCuratorReqType, IPendingCuratorReq } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { useRouter } from 'next/router';
import ReceivedRequests from './CuratorReceivedRequest';
import SentRequests from './CuratorSentRequest';

const CuratorRequest = () => {
	const [activeTab, setActiveTab] = useState('received');
	const currentUser = useUserDetailsSelector();
	const userAddress = currentUser?.loginAddress;

	const [loadingBounty, setLoadingBounty] = useState(false);
	const [loadingChildBounty, setLoadingChildBounty] = useState(false);
	const [bountyRequests, setBountyRequests] = useState<IPendingCuratorReq[]>([]);
	const [childBountyRequests, setChildBountyRequests] = useState<IPendingCuratorReq[]>([]);
	const [isBountyExpanded, setBountyExpanded] = useState(false);
	const [isChildBountyExpanded, setChildBountyExpanded] = useState(false);

	const router = useRouter();
	const currentPage = parseInt(router?.query?.page as string) || 1;
	const requestType = (router?.query?.type as string) || ProposalType.BOUNTIES;

	const fetchCuratorRequest = async (proposalType: ProposalType, isBounty: boolean) => {
		const reqType = activeTab === 'received' ? EPendingCuratorReqType.RECEIVED : EPendingCuratorReqType.SENT;
		const isLoading = isBounty ? loadingBounty : loadingChildBounty;
		if (isLoading) return;

		try {
			isBounty ? setLoadingBounty(true) : setLoadingChildBounty(true);
			const { data, error } = await nextApiClientFetch<IPendingCuratorReq[]>('/api/v1/bounty/curator/requests/getAllSentOrReceivedCuratorReq', {
				page: currentPage,
				proposalType,
				reqType,
				userAddress
			});

			if (error) return;

			if (data) {
				isBounty ? setBountyRequests((prev) => [...prev, ...data]) : setChildBountyRequests((prev) => [...prev, ...data]);
				if (data?.length === BOUNTIES_LISTING_LIMIT) {
					router?.push({ query: { page: currentPage + 1, type: requestType } });
				}
			}
		} finally {
			isBounty ? setLoadingBounty(false) : setLoadingChildBounty(false);
		}
	};

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
		setBountyRequests([]);
		setChildBountyRequests([]);
		setBountyExpanded(false);
		setChildBountyExpanded(false);
		router?.push({ query: { page: 1, type: requestType } });
	};

	const handleBountyClick = async () => {
		setChildBountyExpanded(false);
		setBountyExpanded(!isBountyExpanded);
		if (!isBountyExpanded && bountyRequests?.length === 0) {
			await fetchCuratorRequest(ProposalType.BOUNTIES, true);
		}
		!isBountyExpanded ? router.push({ query: { ...router.query, type: ProposalType.BOUNTIES } }) : router.push({ query: { ...router.query, type: undefined } });
	};

	const handleChildBountyClick = async () => {
		setBountyExpanded(false);
		setChildBountyExpanded(!isChildBountyExpanded);
		if (!isChildBountyExpanded && childBountyRequests?.length === 0) {
			await fetchCuratorRequest(ProposalType.CHILD_BOUNTIES, false);
		}
		!isChildBountyExpanded ? router.push({ query: { ...router.query, type: ProposalType.CHILD_BOUNTIES } }) : router.push({ query: { ...router.query, type: undefined } });
	};

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'received'
							? 'rounded-l-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('received')}
				>
					Received Requests
				</div>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'sent'
							? 'rounded-r-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('sent')}
				>
					Sent Requests
				</div>
			</div>

			<div className='pt-5'>
				{activeTab === 'received' && (
					<ReceivedRequests
						isBountyExpanded={isBountyExpanded}
						bountyRequests={bountyRequests}
						childBountyRequests={childBountyRequests}
						isChildBountyExpanded={isChildBountyExpanded}
						handleBountyClick={handleBountyClick}
						handleChildBountyClick={handleChildBountyClick}
						loadingBounty={loadingBounty}
						loadingChildBounty={loadingChildBounty}
					/>
				)}
				{activeTab === 'sent' && (
					<SentRequests
						isBountyExpanded={isBountyExpanded}
						bountyRequests={bountyRequests}
						childBountyRequests={childBountyRequests}
						isChildBountyExpanded={isChildBountyExpanded}
						handleBountyClick={handleBountyClick}
						handleChildBountyClick={handleChildBountyClick}
						loadingBounty={loadingBounty}
						loadingChildBounty={loadingChildBounty}
					/>
				)}
			</div>
		</div>
	);
};

export default CuratorRequest;
