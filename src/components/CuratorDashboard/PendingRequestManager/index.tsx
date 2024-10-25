// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import CuratorRequest from './PendingRequestTabs/CuratorRequest';
import CuratorSubmission from './PendingRequestTabs/CuratorSubmission';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useRouter } from 'next/router';

function CuratorPendingRequestManager() {
	const [selectedTab, setSelectedTab] = useState<'curatorRequests' | 'submissions'>('curatorRequests');
	const currentUser = useUserDetailsSelector();
	const router = useRouter();

	const [requestCount, setRequestCount] = useState<{ curator: number; submissions: number }>({ curator: 0, submissions: 0 });
	const tabs = [
		{ count: requestCount?.curator, id: 'curatorRequests', label: 'Curator Requests' },
		{ count: requestCount?.submissions, id: 'submissions', label: 'Submissions' }
	];
	const handleTabChange = (tabId: 'curatorRequests' | 'submissions') => {
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
	const renderTabContent = () => {
		switch (selectedTab) {
			case 'curatorRequests':
				return <CuratorRequest />;
			case 'submissions':
				return <CuratorSubmission />;
			default:
				return null;
		}
	};

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
							onChange={() => handleTabChange(tab.id as 'curatorRequests' | 'submissions')}
						/>
						{`${tab.label} (${tab.count})`}
					</label>
				))}
			</div>

			<div className='mt-4'>{renderTabContent()}</div>
		</div>
	);
}

export default CuratorPendingRequestManager;
