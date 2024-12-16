// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useRouter } from 'next/router';
import { EChildBountyPendingReqSection, RequestCount } from '../types/types';
import RequestTabs from '../PendingRequestManager/RequestTabs';
import { useTranslation } from 'react-i18next';

function CuratorPendingRequestManager() {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { loginAddress } = useUserDetailsSelector();
	const [selectedTab, setSelectedTab] = useState<EChildBountyPendingReqSection>(EChildBountyPendingReqSection.CURATOR_REQUESTS);

	const [requestCount, setRequestCount] = useState<RequestCount>({ curator: 0, submissions: 0 });

	const tabs = [
		{ count: requestCount?.curator, id: EChildBountyPendingReqSection.CURATOR_REQUESTS, label: 'Curator Requests' },
		{ count: requestCount?.submissions, id: EChildBountyPendingReqSection.SUBMISSION_REQUESTS, label: 'Submissions' }
	];

	const handleTabChange = (tabId: EChildBountyPendingReqSection) => {
		setSelectedTab(tabId);

		router.replace({
			pathname: '',
			query: {
				...router?.query,
				section: tabId
			}
		});
	};

	const fetchRequestsCount = async () => {
		if (!loginAddress) return;
		const { data, error } = await nextApiClientFetch<{ curator: number; submissions: number }>('/api/v1/bounty/curator/getReqCount', {
			userAddress: loginAddress
		});
		if (data) setRequestCount(data);
		if (error) console.log(error, 'error');
	};

	useEffect(() => {
		fetchRequestsCount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-section-light-container bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-2xl font-bold text-bodyBlue dark:text-lightWhite'>
				{t('pending_requests')} ({requestCount?.curator + requestCount.submissions})
			</p>

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
