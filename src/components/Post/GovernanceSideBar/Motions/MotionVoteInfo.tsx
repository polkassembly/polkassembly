// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import React, { FC } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import HelperTooltip from 'src/ui-components/HelperTooltip';

import Address from '../../../../ui-components/Address';

interface IMotionVoteInfoProps {
	className?: string;
	councilVotes: {
		decision: string;
		voter: string;
	}[];
}

const MotionVoteInfo: FC<IMotionVoteInfoProps> = (props) => {
	const { councilVotes, className } = props;

	return (
		<GovSidebarCard className={`${className} px-1 md:px-9 xl:overflow-y-visible`}>
			<h3 className='dashboard-heading flex items-center dark:text-white'>
				Council Votes{' '}
				<HelperTooltip
					className='ml-2 font-normal'
					text='This represents the onchain votes of council members'
				/>
			</h3>
			<div className='mt-6'>
				{councilVotes.map((councilVote, index) => (
					<div
						className='mb-6 flex items-center justify-between'
						key={`${councilVote.voter}_${index}`}
					>
						<div className='item'>
							<Address
								isSubVisible={false}
								address={councilVote.voter}
							/>
						</div>

						{councilVote.decision === 'yes' ? (
							<div className='text-md flex items-center text-aye_green'>
								<LikeFilled className='mr-2' /> Aye
							</div>
						) : (
							<div className='text-md flex items-center text-nay_red'>
								<DislikeFilled className='mr-2' /> Nay
							</div>
						)}
					</div>
				))}
			</div>
		</GovSidebarCard>
	);
};

export default MotionVoteInfo;
