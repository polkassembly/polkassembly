// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { poppins, spaceGrotesk } from 'pages/_app';
import React, { useState } from 'react';

function CuratorRequest() {
	const [activeTab, setActiveTab] = useState('received');
	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
	};

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'received' ? 'rounded-l-full bg-[#F6F8FA] font-bold text-blue-light-high' : 'font-medium text-[#475569]'
					}`}
					onClick={() => handleTabClick('received')}
				>
					Received Requests <span className={`${poppins.className} ${poppins.variable} text-[12px] font-medium text-[#475569]`}>(0)</span>
				</div>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'sent' ? 'rounded-r-full bg-[#F6F8FA] font-bold text-blue-light-high' : 'font-medium text-[#475569]'
					}`}
					onClick={() => handleTabClick('sent')}
				>
					Sent Requests <span className={`${poppins.className} ${poppins.variable} text-[12px] font-medium text-[#475569]`}>(0)</span>
				</div>
			</div>
			<div className='pt-5'>
				{activeTab === 'received' && <ReceivedRequests />}
				{activeTab === 'sent' && <SentRequests />}
			</div>
		</div>
	);
}

function ReceivedRequests() {
	return <div>Content for Received Requests</div>;
}

function SentRequests() {
	return <div>Content for Sent Requests</div>;
}

export default CuratorRequest;
