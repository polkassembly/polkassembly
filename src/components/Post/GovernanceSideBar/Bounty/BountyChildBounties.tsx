// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import StatusTag from 'src/ui-components/StatusTag';

interface IBountyChildBountiesProps {
	childBounties: any[];
	childBountiesCount: number;
}

const BountyChildBounties: FC<IBountyChildBountiesProps> = (props) => {
	const { childBounties, childBountiesCount } = props;

	return (
		childBounties.length > 0 ?
			<GovSidebarCard>
				<h4 className='dashboard-heading mb-6'>{childBountiesCount} Child Bounties</h4>

				{childBounties.map(childBounty => (
					childBounty && <Link href={`/child_bounty/${childBounty.index}`} key={childBounty.index} className='mb-6'>
						<div className='my-4 border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-2 md:p-4'>
							<div className="flex justify-between gap-x-4">
								<div className='w-[70%] break-words p-1'>
									<h5 className='m-0 p-0 text-sm m-auto'>{childBounty.description} || {`#${childBounty.index} Untitled`}</h5>
								</div>
								{childBounty.status && <StatusTag
									className='statusTag m-auto'
									status={childBounty.status}
								/>}
							</div>
						</div>
					</Link>
				))}
			</GovSidebarCard>
			: <></>
	);
};

export default BountyChildBounties;
