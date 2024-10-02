// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
}

const Details: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;
	console.log('bountyId', bountyId);
	return (
		<GovSidebarCard className='min-h-[200px]'>
			<h4 className='dashboard-heading mb-6 dark:text-white'>Details</h4>

			<div className='my-4 rounded-md border-[0.7px] border-solid border-[#D2D8E0] px-2 py-1 dark:border-separatorDark'>
				<div className='flex justify-between gap-x-4'>
					<div className='w-[70%] break-words p-1'>
						<h5 className='m-auto  overflow-hidden p-0 text-sm dark:text-white'>Full Proposal:</h5>
					</div>
				</div>
			</div>

			<div className='my-4 rounded-md border-[0.7px] border-solid border-[#D2D8E0] px-2 py-1 dark:border-separatorDark'>
				<div className='flex justify-between gap-x-4'>
					<div className='w-[70%] break-words p-1'>
						<h5 className='m-auto  overflow-hidden p-0 text-sm dark:text-white'>Curator</h5>
					</div>
				</div>
			</div>

			<div className='my-4 rounded-md border-[0.7px] border-solid border-[#D2D8E0] px-2 py-1 dark:border-separatorDark'>
				<div className='flex justify-between gap-x-4'>
					<div className='w-[70%] break-words p-1'>
						<h5 className='m-auto  overflow-hidden p-0 text-sm dark:text-white'>Claimed</h5>
					</div>
				</div>
			</div>
		</GovSidebarCard>
	);
};

export default Details;
