// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Link from 'next/link';
import React, { FC } from 'react';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { PostEmptyState } from '~src/ui-components/UIStates';
import GovernanceCard from '../GovernanceCard';
import { IUserPost } from '~src/types';

interface IPostTabProps {
	posts: IUserPost[];
}

const PostTab: FC<IPostTabProps> = (props) => {
	const { posts } = props;
	return (
		<div className='mt-2.5 flex h-full max-h-[530px] flex-col gap-y-3 overflow-y-auto pr-2'>
			{!posts || posts.length === 0 ? (
				<div className='flex h-full items-center justify-center'>
					<PostEmptyState />
				</div>
			) : (
				posts.map((post, i) => {
					return (
						<Link
							key={post.id}
							href={`/${getSinglePostLinkFromProposalType(post.type)}/${post.id}`}
						>
							<GovernanceCard
								className={`${(i + 1) % 2 !== 0 ? 'bg-[#FBFBFC] dark:bg-[#161616]' : 'dark:bg-section-dark-overlay'}`}
								tip_index={posts.length - i}
								isTip={post.type === 'tips'}
								postReactionCount={post?.post_reactions}
								address={post.proposer}
								isCommentsVisible={false}
								commentsCount={0}
								method={post.title}
								onchainId={post.id}
								status={''}
								title={post.title}
								topic={''}
								created_at={post.created_at}
								username={post.username}
							/>
						</Link>
					);
				})
			)}
		</div>
	);
};

export default PostTab;
