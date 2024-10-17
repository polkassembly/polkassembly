// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useState } from 'react';
import ReceivedSubmissions from './ReceivedRequestsSubmission';
import SentSubmissions from './SentRequestsSubmission';

function CuratorSubmission({
	isloading,
	isloadingSubmissions,
	sentSubmissions,
	receivedSubmissions
}: {
	isloading: boolean;
	receivedSubmissions: any;
	isloadingSubmissions: boolean;
	sentSubmissions: any;
}) {
	const [activeTab, setActiveTab] = useState('received');

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
	};

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'received'
							? 'rounded-l-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('received')}
				>
					Received Requests <span className={'text-[12px] font-medium text-[#475569] dark:text-icon-dark-inactive'}>({receivedSubmissions.length})</span>
				</div>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'sent'
							? 'rounded-r-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('sent')}
				>
					Sent Requests <span className={'text-[12px] font-medium text-[#475569] dark:text-icon-dark-inactive'}>({sentSubmissions.length})</span>
				</div>
			</div>
			<div className='pt-5'>
				{activeTab === 'received' && (
					<ReceivedSubmissions
						isloading={isloading}
						receivedSubmissions={receivedSubmissions}
					/>
				)}
				{activeTab === 'sent' && (
					<SentSubmissions
						isloading={isloadingSubmissions}
						sentSubmissions={sentSubmissions}
					/>
				)}
			</div>
		</div>
	);
}

export default CuratorSubmission;
