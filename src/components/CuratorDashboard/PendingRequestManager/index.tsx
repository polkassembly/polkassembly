// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useState } from 'react';
import CuratorRequest from './PendingRequestTabs/CuratorRequest';
import CuratorSubmission from './PendingRequestTabs/CuratorSubmission';
import Input from '~src/basic-components/Input';
import { SearchIcon } from '~src/ui-components/CustomIcons';

function CuratorPendingRequestManager() {
	const [selectedTab, setSelectedTab] = useState<'curatorRequests' | 'submissions'>('curatorRequests');

	const tabs = [
		{ count: 0, id: 'curatorRequests', label: 'Curator Requests' },
		{ count: 0, id: 'submissions', label: 'Submissions' }
	];

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
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Pending Requests (0)</p>

			<div className='mt-4 flex gap-1'>
				{tabs.map((tab) => (
					<label
						key={tab.id}
						className={`mb-2 flex cursor-pointer items-center rounded-full p-2 px-4 ${selectedTab === tab.id ? 'bg-[#FEF2F8]' : ''}`}
					>
						<input
							type='radio'
							className={`mr-2 h-[12px] w-[12px] appearance-none rounded-[50%] border-[2px] border-solid border-white ${
								selectedTab === tab.id ? 'bg-pink_primary shadow-[0_0_0_1px_#E5007A]' : 'shadow-[0_0_0_1px_#667488]'
							}`}
							checked={selectedTab === tab.id}
							onChange={() => setSelectedTab(tab.id as 'curatorRequests' | 'submissions')}
						/>
						{`${tab.label} (${tab.count})`}
					</label>
				))}
			</div>

			<div className='relative mt-2'>
				<Input
					className='placeholderColor h-10 rounded-[4px] border-[1px] border-[#D2D8E0] pl-10 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high dark:focus:border-[#91054F]'
					type='search'
					placeholder='Search'
				/>
				<SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 transform text-xl text-gray-500' />
			</div>

			<div className='mt-4'>{renderTabContent()}</div>
		</div>
	);
}

export default CuratorPendingRequestManager;
