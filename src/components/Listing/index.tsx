// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC, useEffect, useState } from 'react';
import { poppins } from 'pages/_app';
import { PostEmptyState } from 'src/ui-components/UIStates';

import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';
import GovernanceCard from '../GovernanceCard';
import getReferendumVotes from '~src/util/getReferendumVotes';
import { useNetworkContext } from '~src/context';

interface IListingProps {
  className?: string;
  posts?: any[];
  proposalType: ProposalType;
  isTip?: boolean;
  tipStartedIndex?: number
}

const Listing: FC<IListingProps> = (props) => {
	const { className, proposalType, isTip, tipStartedIndex } = props;

	const { network } = useNetworkContext();

	const [posts, setPosts] = useState(props.posts || []);

	useEffect(() => {
		if(!network || !props.posts || !props.posts.length || proposalType != ProposalType.REFERENDUMS) return;

		(async () => {
			// function to await for ms milliseconds
			const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

			const postsWithVotesData = [];

			for (const post of posts) {
				const votesData =  await getReferendumVotes(network, post.post_id);
				postsWithVotesData.push({ ...post, votesData });

				sleep(500); // to avoid rate limit
			}

			setPosts(postsWithVotesData);
		})();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, props.posts, proposalType]);

	if (!posts || !posts.length) {
		return (
			<div className={className}>
				<PostEmptyState postCategory={proposalType} />
			</div>
		);
	}

	return (
		<div className={`${className} proposals__list`}>
			{posts.map((post, index) => {
				const {
					cid,
					curator,
					post_id,
					post_reactions,
					proposer,
					comments_count,
					status,
					title,
					topic,
					created_at,
					hash,
					description,
					method,
					end,
					tags,
					tally,
					spam_users_count
					// votesData, TODO: Enable
				} = post;
				const id = isTip ? hash : post_id;
				return (
					<div key={id} className="my-0">
						{
							<Link href={`/${getSinglePostLinkFromProposalType(proposalType)}/${id}`}>
								<GovernanceCard
									className={`${(index+1)%2!==0 && 'bg-[#FBFBFC]'} ${poppins.variable} ${poppins.className}`}
									cid={cid}
									postReactionCount={post_reactions}
									address={proposer || curator}
									commentsCount={comments_count || 0}
									end={end}
									method={method}
									tipReason={isTip && description}
									onchainId={id}
									status={status}
									title={title || description}
									topic={topic && topic?.name ? topic.name : ''}
									created_at={created_at}
									tip_index={tipStartedIndex? tipStartedIndex - index: null}
									isTip={isTip}
									tags={tags}
									spam_users_count={spam_users_count}
									tally={tally}
									proposalType={proposalType}
									// votesData={votesData}
								/>
							</Link>
						}
					</div>
				);
			})}
		</div>
	);
};

export default Listing;