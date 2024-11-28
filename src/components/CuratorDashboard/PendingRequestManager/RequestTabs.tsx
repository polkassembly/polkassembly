// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { EPendingCuratorReqType } from '~src/types';
import { useRouter } from 'next/router';
import { EChildBountyPendingReqSection } from '../types/types';
import Alert from '~src/basic-components/Alert';
import CuratorRequests from './PendingRequestTabs/CuratorRequests';
import CuratorSubmissions from './PendingRequestTabs/CuratorSubmissions';

const RequestsTabs = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<EPendingCuratorReqType>(EPendingCuratorReqType.RECEIVED);

	const activeSection = (router?.query?.section as EChildBountyPendingReqSection) || EChildBountyPendingReqSection.CURATOR_REQUESTS;

	const handleTabClick = (tab: EPendingCuratorReqType) => {
		setActiveTab(tab);
	};

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center text-sm ${
						activeTab === EPendingCuratorReqType.RECEIVED
							? 'rounded-l-full bg-[#F6F8FA] font-bold text-bodyBlue dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick(EPendingCuratorReqType.RECEIVED)}
				>
					Received Requests
				</div>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center text-sm ${
						activeTab === EPendingCuratorReqType.SENT
							? 'rounded-r-full bg-[#F6F8FA] font-bold text-bodyBlue dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick(EPendingCuratorReqType.SENT)}
				>
					Sent Requests
				</div>
			</div>
			{activeSection === EChildBountyPendingReqSection.CURATOR_REQUESTS && (
				<div>
					{activeTab === EPendingCuratorReqType.RECEIVED && (
						<Alert
							type='info'
							showIcon
							className='mt-6'
							message='Requests to become a curator for bounties and child bounties can be viewed here'
						/>
					)}
					<CuratorRequests reqType={activeTab} />
				</div>
			)}
			{activeSection === EChildBountyPendingReqSection.SUBMISSION_REQUESTS && (
				<div className='pt-5'>
					<CuratorSubmissions reqType={activeTab} />
				</div>
			)}
		</div>
	);
};

export default RequestsTabs;
