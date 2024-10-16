// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useState } from 'react';
import CuratorRequest from './PendingRequestTabs/CuratorRequest';
import CuratorSubmission from './PendingRequestTabs/CuratorSubmission';
import CuratorArchived from './PendingRequestTabs/CuratorArchived';

function CuratorPendingRequestManager() {
	const [selectedTab, setSelectedTab] = useState('curatorRequests');

	const renderTabContent = () => {
		switch (selectedTab) {
			case 'curatorRequests':
				return <CuratorRequest />;
			case 'submissions':
				return <CuratorSubmission />;
			case 'archived':
				return <CuratorArchived />;
			default:
				return null;
		}
	};

	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Pending Requests (0)</p>

			<div className='mt-4 flex gap-1'>
				<label className={`mb-2 flex items-center rounded-full p-2 px-4 ${selectedTab === 'curatorRequests' ? 'bg-[#FEF2F8]' : ''}`}>
					<input
						type='radio'
						className={`mr-2 h-[12px] w-[12px] appearance-none rounded-[50%] border-[2px]  border-solid border-white  ${
							selectedTab === 'curatorRequests' ? 'bg-pink_primary shadow-[0_0_0_1px_#E5007A]' : 'shadow-[0_0_0_1px_#667488] '
						}`}
						checked={selectedTab === 'curatorRequests'}
						onChange={() => setSelectedTab('curatorRequests')}
					/>
					Curator Requests (0)
				</label>
				<label className={`mb-2 flex items-center rounded-full p-2 px-4 ${selectedTab === 'submissions' ? 'bg-[#FEF2F8]' : ''}`}>
					<input
						type='radio'
						className={`mr-2 h-[12px] w-[12px] appearance-none rounded-[50%] border-[2px]  border-solid border-white   ${
							selectedTab === 'submissions' ? 'bg-pink_primary shadow-[0_0_0_1px_#E5007A]' : 'shadow-[0_0_0_1px_#667488]'
						}`}
						checked={selectedTab === 'submissions'}
						onChange={() => setSelectedTab('submissions')}
					/>
					Submissions (0)
				</label>
				<label className={`mb-2 flex items-center rounded-full p-2 px-4 ${selectedTab === 'archived' ? 'bg-[#FEF2F8]' : ''}`}>
					<input
						type='radio'
						className={`mr-2 h-[12px] w-[12px] appearance-none rounded-[50%] border-[2px]  border-solid border-white  ${
							selectedTab === 'archived' ? 'bg-pink_primary shadow-[0_0_0_1px_#E5007A]' : 'shadow-[0_0_0_1px_#667488] '
						}`}
						checked={selectedTab === 'archived'}
						onChange={() => setSelectedTab('archived')}
					/>
					Archived (0)
				</label>
			</div>

			<div className='mt-4'>{renderTabContent()}</div>
		</div>
	);
}

export default CuratorPendingRequestManager;
