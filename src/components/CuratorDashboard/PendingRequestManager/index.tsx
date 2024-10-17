// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { IChildBountySubmission } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import CuratorRequest from './PendingRequestTabs/CuratorRequest';
import CuratorSubmission from './PendingRequestTabs/CuratorSubmission';
import Skeleton from '~src/basic-components/Skeleton';

const fetchSubmissions = async (url: string, params: Record<string, any>, setData: React.Dispatch<any>, setLoading: React.Dispatch<boolean>) => {
	try {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IChildBountySubmission>(url, params);
		if (error) {
			console.error('Error fetching submissions:', error);
			setLoading(false);
			return;
		}
		setData(data);
	} catch (e) {
		console.error('API call failed:', e);
	} finally {
		setLoading(false);
	}
};

function CuratorPendingRequestManager() {
	const [selectedTab, setSelectedTab] = useState<'curatorRequests' | 'submissions'>('curatorRequests');
	const [receivedSubmissions, setReceivedSubmissions] = useState<any>([]);
	const [sentSubmissions, setSentSubmissions] = useState<any>([]);
	const [isloadingSubmissions, setLoadingSubmission] = useState<boolean>(false);
	const [isloading, setLoading] = useState<boolean>(false);

	const getReceivedRequests = () => {
		fetchSubmissions(
			'/api/v1/bounty/curator/submissions/getReceivedSubmissions',
			{ curatorAddress: '1EkXxWpyv5pY7t427CDyqLfqUzEhwPsWSAWeurqmxYxY9ea' },
			setReceivedSubmissions,
			setLoading
		);
	};

	const getSentRequests = () => {
		fetchSubmissions(
			'/api/v1/bounty/curator/submissions/getSentSubmissions',
			{ userAddress: '5GFE6fdDkd4wXyDvQayrs9DL7K8Fx9mBFRFwioCmE4yB2GCU' },
			setSentSubmissions,
			setLoadingSubmission
		);
	};

	useEffect(() => {
		getReceivedRequests();
		getSentRequests();
	}, []);

	const totalSubmissionCount = receivedSubmissions.length + sentSubmissions.length;

	const tabs = [
		{ count: 0, id: 'curatorRequests', label: 'Curator Requests' },
		{ count: totalSubmissionCount, id: 'submissions', label: 'Submissions' }
	];

	const renderTabContent = () => {
		switch (selectedTab) {
			case 'curatorRequests':
				return <CuratorRequest />;
			case 'submissions':
				return (
					<CuratorSubmission
						isloading={isloadingSubmissions}
						receivedSubmissions={receivedSubmissions}
						isloadingSubmissions={isloading}
						sentSubmissions={sentSubmissions}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Pending Requests ({totalSubmissionCount})</p>

			{isloading || isloadingSubmissions ? (
				<Skeleton active />
			) : (
				<>
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
									onChange={() => setSelectedTab(tab.id as 'curatorRequests' | 'submissions')}
								/>
								{`${tab.label} (${tab.count})`}
							</label>
						))}
					</div>

					<div className='mt-4'>{renderTabContent()}</div>
				</>
			)}
		</div>
	);
}

export default CuratorPendingRequestManager;
