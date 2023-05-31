// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { FC } from 'react';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import { ErrorState, LoadingState, PostEmptyState } from 'src/ui-components/UIStates';

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface ITrackListingStatusTabContentProps {
	className?: string;
	status: string;
	trackName: string;
	posts: any[];
	error?: any;
	count: number;
}

const TrackListingStatusTabContent: FC<ITrackListingStatusTabContentProps> = (props) => {
	const { posts, className, error , count } = props;
	const noPosts = count === 0 || isNaN(Number(count));

	if (error) return <ErrorState errorMessage={error} />;

	if(error) return <div className={className}><ErrorAlert errorMsg={error} /></div>;

	if (noPosts) return <PostEmptyState />;

	if(posts&& posts.length>0){
		return (
			<div className={`${className} proposals__list`}>
				{posts.map((post) => {
					return (
						<div key={post.post_id} className='my-5'>
							{<Link href={`/referenda/${post.post_id}`}>
								<GovernanceCard
									postReactionCount={post.post_reactions}
									address={post.proposer}
									commentsCount={post.comments_count || 0}
									method={post.method}
									onchainId={post.post_id}
									status={post.status}
									title={post.title}
									// topic={post.topic.name}
									created_at={post.created_at}
									tags={post?.tags}
									spam_users_count={post.spam_users_count}
								/>
							</Link>}
						</div>
					);
				}
				)}
			</div>
		);
	}
	return <div className='mt-12'><LoadingState /></div>;
};

export default TrackListingStatusTabContent;