// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { FC } from 'react';
import { ErrorState, PostEmptyState } from 'src/ui-components/UIStates';

interface ITrackListingAllTabContentProps {
	className?: string;
	posts: any[];
	error?: any;
}

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const TrackListingAllTabContent: FC<ITrackListingAllTabContentProps> = (props) => {
	const { className, posts, error } = props;

	const noPost = !posts || !posts.length;
	if (error) return <ErrorState errorMessage={error} />;

	if (noPost) return <div className={className}><PostEmptyState /></div>;

	return (
		<div className={`${className} proposals__list`}>
			{posts.map((post: any , index) => {
				return (
					<div key={post.post_id} className=''>
						{<Link href={`/referenda/${post.post_id}`}>
							<GovernanceCard
								className={`${(index+1)%2!==0 && 'bg-[#F5F6F8]'}`}
								postReactionCount={post?.post_reactions}
								address={post.proposer}
								commentsCount={post.comments_count || 0}
								method={post.method}
								onchainId={post.post_id}
								status={post.status}
								title={post.title}
								// topic={post.topic.name}
								created_at={post.created_at}
								tags={post?.tags}
								spam_users_count={post?.spam_users_count}
							/>
						</Link>}
					</div>
				);
			}
			)}
		</div>
	);
};

export default TrackListingAllTabContent;