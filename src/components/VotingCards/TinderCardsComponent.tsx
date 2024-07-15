// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
// import PostHeading from '../Post/PostHeading';
import CardPostHeading from '../Post/CardPostHeading';
import { Divider, Skeleton } from 'antd';
import Markdown from '~src/ui-components/Markdown';
// import GovernanceSideBar from '../Post/GovernanceSideBar';
import { ProposalType } from '~src/global/proposalType';
import dynamic from 'next/dynamic';
// import CardVoteInfo from '../Post/GovernanceSideBar/cardVoteInfo';
const CardVoteInfo = dynamic(() => import('../Post/GovernanceSideBar/cardVoteInfo'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ITinderCardsComponent {
	proposal: any;
}

const TinderCardsComponent: FC<ITinderCardsComponent> = (props) => {
	const { proposal } = props;
	console.log('from tinder cards --> ', proposal);
	const [isEditing, setIsEditing] = useState(false);

	const toggleEdit = () => setIsEditing(!isEditing);

	const sanitizeSummary = (md: string) => {
		const newMd = (md || '').trim();
		return newMd;
	};
	const onchainId = proposal?.type === ProposalType.TIPS ? proposal?.hash : proposal?.id;

	return (
		<section>
			<div>
				<CardPostHeading
					method={proposal?.method}
					motion_method={proposal?.motion_method}
					postArguments={proposal?.proposed_call?.args}
					className='mb-5'
					post={proposal}
				/>
				<Divider
					type='horizontal'
					className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
				/>
				<div className='flex w-full justify-start'>
					<Markdown
						className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
						md={sanitizeSummary(proposal?.summary || '')}
					/>
				</div>
				<CardVoteInfo
					toggleEdit={toggleEdit}
					proposalType={proposal?.type}
					onchainId={onchainId}
					// status={postStatus}
					// canEdit={canEdit}
					startTime={proposal.created_at as any}
					post={proposal}
					tally={proposal?.tally}
					// trackName={trackName}
					// className={`${!isOffchainPost}`}
					pipsVoters={proposal?.pips_voters || []}
					hash={proposal?.hash}
					bountyIndex={proposal.parent_bounty_index}
				/>
			</div>
		</section>
	);
};

export default TinderCardsComponent;
