// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { FC } from 'react';

import { poppins } from 'pages/_app';
import { ErrorState, PostEmptyState } from 'src/ui-components/UIStates';
import FilteredTags from '~src/ui-components/filteredTags';
import { getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import Skeleton from '~src/basic-components/Skeleton';

interface ITrackListingAllTabContentProps {
	className?: string;
	posts: any[];
	error?: any;
	count?: number;
	showSimilarPost?: boolean;
	statusItem?: any[];
}

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const TrackListingAllTabContent: FC<ITrackListingAllTabContentProps> = (props) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { className, posts, error, count, showSimilarPost, statusItem } = props;
	const noPosts = count === 0 || isNaN(Number(count));

	if (error) return <ErrorState errorMessage={error} />;

	if (noPosts || posts.length === 0) {
		return (
			<div className={className}>
				<PostEmptyState description={<p>No Active Proposals</p>} />
			</div>
		);
	}

	if (posts && posts.length > 0)
		return (
			<>
				<div className='sm:mx-3'>
					<FilteredTags
						statusItem={statusItem}
						count={count}
					/>
				</div>
				<div className={`${className} proposals__list`}>
					{posts.map((post, index) => {
						return (
							<div
								key={post.post_id}
								className='my-0'
							>
								{
									<Link
										href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(post.type as any) as any)}/${post.post_id}`}
										target={showSimilarPost ? '_blank' : '_self'}
									>
										<GovernanceCard
											className={`${showSimilarPost ? 'mb-6 rounded-2xl bg-white dark:bg-section-dark-overlay' : (index + 1) % 2 !== 0 && 'bg-[#FBFBFC] dark:bg-[#161616]'} ${
												poppins.variable
											} ${poppins.className}`}
											assetId={post?.assetId || null}
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
											trackNumber={post?.track_no ?? post?.trackNumber}
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
