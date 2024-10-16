// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';

function CuratorRequest() {
	const [activeTab, setActiveTab] = useState('received');
	const bountiesData = [
		{
			createdAt: '2024-10-16T10:30:00Z',
			description: 'Proposal to enhance network stability by optimizing consensus mechanisms and reducing latency.',
			proposer: 'Alice',
			reward: 500,
			title: 'Improve Network Stability'
		},
		{
			createdAt: '2024-10-15T14:20:00Z',
			description: 'This proposal seeks to implement a new governance model that allows for more community involvement in decision making.',
			proposer: 'Bob',
			reward: 300,
			title: 'Upgrade Governance Model'
		},
		{
			createdAt: '2024-10-14T09:45:00Z',
			description: 'Proposal to increase the number of validators to ensure greater decentralization and security for the network.',
			proposer: 'Charlie',
			reward: 700,
			title: 'Expand Validator Set'
		}
	];
	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
	};

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center ${activeTab === 'received' ? 'rounded-l-full bg-[#F6F8FA]' : ''}`}
					onClick={() => handleTabClick('received')}
				>
					Received Requests
				</div>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center ${activeTab === 'sent' ? 'rounded-r-full bg-[#F6F8FA]' : ''}`}
					onClick={() => handleTabClick('sent')}
				>
					Sent Requests
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
