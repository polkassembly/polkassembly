// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useRouter } from 'next/router';
import RequestTabs from './RequestTabs';
import { EPendingCuratorSectionType, RequestCount, TabId } from '../types/types';

function CuratorPendingRequestManager() {
	const [selectedTab, setSelectedTab] = useState<TabId>(EPendingCuratorSectionType.CURATORREQUESTS);
	const currentUser = useUserDetailsSelector();
	const router = useRouter();

	const [requestCount, setRequestCount] = useState<RequestCount>({ curator: 0, submissions: 0 });
	const tabs = [
		{ count: requestCount?.curator, id: EPendingCuratorSectionType.CURATORREQUESTS, label: 'Curator Requests' },
		{ count: requestCount?.submissions, id: EPendingCuratorSectionType.SUBMISSIONS, label: 'Submissions' }
	];
	const handleTabChange = (tabId: EPendingCuratorSectionType.CURATORREQUESTS | EPendingCuratorSectionType.SUBMISSIONS) => {
		setSelectedTab(tabId);
		router.push(`/bounty-dashboard/curator-dashboard?section=${tabId}`);
	};

	const fetchbountyreqcount = async () => {
		const { data, error } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getReqCount', {
			userAddress: currentUser?.loginAddress
		});
		if (data) setRequestCount(data);
		if (error) console.log(error, 'error');
	};

	useEffect(
		() => {
			fetchbountyreqcount();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
	const TotalSubmissionCount = requestCount?.curator + requestCount?.submissions;

	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Pending Requests ({TotalSubmissionCount})</p>

			<div className='mt-4 flex gap-1'>
				{tabs.map((tab) => (
					<label
						key={tab.id}
						className={`mb-2 flex cursor-pointer items-center rounded-full p-2 px-4 ${selectedTab === tab.id ? 'bg-[#FEF2F8] dark:bg-[#540E33]' : ''}`}
					>
						<input
							type='radio'
							className={`mr-2 h-[12px] w-[12px] appearance-none rounded-[50%] border-[2px] border-solid border-white  ${
								selectedTab === tab.id ? 'bg-pink_primary shadow-[0_0_0_1px_#E5007A] dark:border-black' : 'shadow-[0_0_0_1px_#667488] dark:border-[#667488]'
							}`}
							checked={selectedTab === tab.id}
							onChange={() => handleTabChange(tab.id)}
						/>
						{`${tab.label} (${tab.count})`}
					</label>
				))}
			</div>

			<div className='mt-4'>
				<RequestTabs />
			</div>
		</div>
	);
}

export default CuratorPendingRequestManager;
