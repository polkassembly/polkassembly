// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import { VoteProgressLegacy } from 'src/ui-components/VoteProgress';

interface IFellowshipReferendumVotingStatusProps {
	className?: string;
	tally?: any;
}

const FellowshipReferendumVotingStatus: FC<IFellowshipReferendumVotingStatusProps> = (props) => {
	const { className, tally } = props;

	return (
		<GovSidebarCard className={className}>
			<h6 className='dashboard-heading mb-6'>Voting Status</h6>

			{tally && <div className="flex justify-between">
				<VoteProgressLegacy
					ayesNum={Number(tally?.ayes)}
					naysNum={Number(tally?.nays)}
				/>

				<div className='flex-1 flex flex-col justify-between ml-4 md:ml-12 py-9'>
					<div className='flex items-center'>
						<div className='mr-auto text-sidebarBlue font-medium'>Ayes</div>
						<div className='text-navBlue'>{tally?.ayes}</div>
					</div>

					<div className='flex items-center'>
						<div className='mr-auto text-sidebarBlue font-medium flex items-center'>Bare Ayes</div>
						<div className='text-navBlue'>{tally?.bareAyes}</div>
					</div>

					<div className='flex items-center'>
						<div className='mr-auto text-sidebarBlue font-medium flex items-center'>Nays</div>
						<div className='text-navBlue'>{tally?.nays}</div>
					</div>
				</div>

			</div>}
		</GovSidebarCard>
	);
};

export default React.memo(FellowshipReferendumVotingStatus);