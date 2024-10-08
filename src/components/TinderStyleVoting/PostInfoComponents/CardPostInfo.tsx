// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import PostOnChainInfo from '../../Post/Tabs/PostOnChainInfo';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import CardPostHeading from './CardPostHeading';
import { useTheme } from 'next-themes';
import CardPostDescription from './CardPostDescription';
import { Tabs } from '~src/ui-components/Tabs';
import { ProposalType } from '~src/global/proposalType';

interface ICardPostInfo {
	post: any;
	proposalType?: ProposalType;
}

const CardPostInfo: FC<ICardPostInfo> = (props) => {
	const { post, proposalType } = props;
	const { resolvedTheme: theme } = useTheme();

	const getOnChainTabs = () => {
		const tabs: any[] = [];

		if (proposalType && !isOffChainProposalTypeValid(proposalType)) {
			tabs.push({
				children: (
					<PostOnChainInfo
						onChainInfo={{
							assetId: post?.assetId || null,
							beneficiaries: post?.beneficiaries || [],
							bond: post?.bond,
							cid: post?.cid,
							code: post?.code,
							codec: post?.codec,
							curator: post?.curator,
							curator_deposit: post?.curator_deposit,
							deciding: post?.deciding,
							decision_deposit_amount: post?.decision_deposit_amount,
							delay: post?.delay,
							deposit: post?.deposit,
							description: post?.description,
							enactment_after_block: post.enactment_after_block,
							enactment_at_block: post.enactment_at_block,
							end: post?.end,
							ended_at: post?.ended_at,
							ended_at_block: post?.ended_at_block,
							fee: post?.fee,
							hash: post?.hash,
							marketMetadata: post?.marketMetadata || null,
							member_count: post?.member_count,
							method: post?.method,
							motion_method: post?.motion_method,
							origin: post?.origin,
							payee: post?.payee,
							post_id: post?.post_id,
							proposal_arguments: post?.proposal_arguments,
							proposed_call: post?.proposed_call,
							proposer: post?.proposer,
							reward: post?.reward,
							status: post?.status,
							statusHistory: post?.statusHistory,
							submission_deposit_amount: post?.submission_deposit_amount,
							submitted_amount: post?.submitted_amount,
							track_number: post?.track_number,
							version: post?.version,
							vote_threshold: post?.vote_threshold
						}}
						proposalType={proposalType}
					/>
				),
				key: 'onChainInfo',
				label: 'On Chain Info'
			});
		}

		return tabs;
	};

	const tabItems: any[] = [
		{
			children: (
				<CardPostDescription
					className='max-h-[170px] overflow-y-auto'
					postContent={post?.content}
					postId={post?.id}
				/>
			),
			key: 'description',
			label: 'Description'
		},
		...getOnChainTabs()
	];

	return (
		<section className='max-h-[400px]'>
			<CardPostHeading
				method={post?.method}
				motion_method={post?.motion_method}
				postArguments={post?.proposed_call?.args}
				className='mb-5'
				post={post}
			/>
			<Tabs
				theme={theme}
				type='card'
				isPostTab={true}
				className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
				items={tabItems}
			/>
		</section>
	);
};

export default CardPostInfo;
