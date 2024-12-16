// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { FC } from 'react';
import { dmSans } from 'pages/_app';
import { ErrorState, PostEmptyState } from 'src/ui-components/UIStates';
import FilteredTags from '~src/ui-components/filteredTags';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import Skeleton from '~src/basic-components/Skeleton';

interface ITrackListingAllTabContentProps {
	className?: string;
	posts: any[];
	error?: any;
	count?: number;
}

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const TrackListingAllTabContent: FC<ITrackListingAllTabContentProps> = (props) => {
	const { className, posts, error, count } = props;

	const noPosts = count === 0 || isNaN(Number(count));
	if (error) return <ErrorState errorMessage={error} />;

	if (noPosts)
		return (
			<div className={className}>
				<PostEmptyState />
			</div>
		);

	if (posts && posts.length > 0)
		return (
			<>
				<div className='sm:mx-3'>
					<FilteredTags />
				</div>
				<div className={`${className} proposals__list`}>
					{posts.map((post, index) => {
						return (
							<div
								key={post.post_id}
								className='my-0'
							>
								{
									<Link href={`/member-referenda/${post.post_id}`}>
										<GovernanceCard
											className={`${(index + 1) % 2 !== 0 && 'bg-[#FBFBFC] dark:bg-[#161616]'} ${dmSans.variable} ${dmSans.className}`}
											postReactionCount={post?.post_reactions}
											address={post.proposer}
											commentsCount={post.comments_count || 0}
											method={post.method}
											onchainId={post.post_id}
											status={post.status}
											title={post.title}
											topic={post.topic?.name}
											created_at={post.created_at}
											tags={post?.tags}
											spam_users_count={post?.spam_users_count}
											timeline={post?.timeline || []}
											statusHistory={post?.status_history || []}
											index={index}
											tally={post?.tally}
											proposalType={post?.type}
											trackNumber={post?.track_no}
										/>
									</Link>
								}
							</div>
						);
					})}
				</div>
			</>
		);
	return (
		<div className='mt-12'>
			<LoadingState />
		</div>
	);
};

export default TrackListingAllTabContent;
