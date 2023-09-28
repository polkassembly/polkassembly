// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC } from 'react';
import { PostEmptyState } from 'src/ui-components/UIStates';

import { getSinglePostLinkFromProposalType, OffChainProposalType } from '~src/global/proposalType';

import OffChainCard from './OffChainCard';

interface IOffChainPostsListingProps {
	className?: string
	posts?: any[]
	loading?: boolean
	proposalType: OffChainProposalType;
}

const OffChainPostsListing: FC<IOffChainPostsListingProps> = ({ className, posts, proposalType }) => {
	if (!posts || !posts.length) {
		return (
			<div className={className}>
				<PostEmptyState postCategory={proposalType} />
			</div>
		);
	}
	return (
		<div className={`${className} flex flex-col `}>
			{posts.map((post,index) => (
				<div key={post.post_id}>
					<Link href={`/${getSinglePostLinkFromProposalType(proposalType)}/${post.post_id}`}>
						<OffChainCard
							post_id={post.post_id}
							className={`${(index+1)%2!==0 ? 'bg-[#FBFBFC] dark:bg-[#161616]' : 'dark:bg-section-dark-overlay'}`}
							postReactionCount={post?.post_reactions}
							address={post?.proposer || ''}
							commentsCount={post.comments_count || 0}
							created_at={post.created_at}
							title={post.title || 'No title'}
							username={post?.username}
							topic={post.topic.name}
							tags={post?.tags}
							spam_users_count={post.spam_users_count}
						/>
					</Link>
				</div>
			)
			)}
		</div>
	);
};

export default OffChainPostsListing;