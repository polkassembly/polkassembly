// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { FC } from 'react';

import { poppins } from 'pages/_app';
import { ErrorState, LoadingState, PostEmptyState } from 'src/ui-components/UIStates';
import FilteredTags from '~src/ui-components/filteredTags';

interface ITrackListingAllTabContentProps {
	className?: string;
	posts: any[];
	error?: any;
	count?: number;
	showSimilarPost?: boolean;
}

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const TrackListingAllTabContent: FC<ITrackListingAllTabContentProps> = (props) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { className, posts, error, count, showSimilarPost } = props;
	// const noPosts = count === 0 || isNaN(Number(count));
	if (error) return <ErrorState errorMessage={error} />;
	if (posts.length <= 0)
		return (
			<>
				{!showSimilarPost && (
					<div className={className}>
						<PostEmptyState />
					</div>
				)}
				{showSimilarPost && (
					<div className='mt-12'>
						<LoadingState />
					</div>
				)}
			</>
		);

	if (posts && posts.length > 0)
		return (
			<>
				<div className='sm:mx-3'>
					<FilteredTags />
				</div>
				<div className={`${className} proposals__list`}>
					{posts.map((post, index) => {
						console.log(post.timeline);
						return (
							<div
								key={post.post_id}
								className='my-0'
							>
								{
									<Link href={`/referenda/${post.post_id}`}>
										<GovernanceCard
											className={`${showSimilarPost ? 'mb-6 rounded-2xl bg-white' : (index + 1) % 2 !== 0 && 'bg-[#FBFBFC]'} ${poppins.variable} ${poppins.className}`}
											postReactionCount={post?.post_reactions}
											address={post.proposer}
											commentsCount={post.comments_count || 0}
											method={post.method}
											onchainId={post.post_id}
											status={post.status}
											title={post.title}
											description={post.description}
											topic={post?.topic?.name}
											created_at={post.created_at}
											tags={post?.tags}
											requestedAmount={post?.requestedAmount}
											spam_users_count={post?.spam_users_count}
											tally={post?.tally}
											timeline={post?.timeline || []}
											statusHistory={post?.status_history || []}
											index={index}
											proposalType={post?.type}
											trackNumber={post?.track_no || post?.trackNumber}
											truncateUsername={false}
											type={post?.type}
											showSimilarPost={showSimilarPost}
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
