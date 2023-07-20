// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	IPostListing,
	IPostsListingResponse
} from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect, useState } from 'react';

import nextApiClientFetch from '~src/util/nextApiClientFetch';

import DiscussionPostCard from './DiscussionPostCard';

interface Props {
  className?: string;
  openSidebar: (postID: number) => void;
}

const DiscussionsBoard = ({ className, openSidebar }: Props) => {
	const [posts, setPosts] = useState<IPostListing[]>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IPostsListingResponse>(
			`api/v1/posts/discussions?listingLimit=${10}`
		)
			.then((res) => {
				if (res.data) {
					setPosts(res.data?.posts);
				} else if (res.error) {
					setError(res.error);
				}
				setLoading(false);
			})
			.catch((err) => {
				setError(err?.message || err);
				setLoading(false);
			});
	}, []);
	return (
		<div className={className}>
			{!loading && error && <h3>Error fetching discussions</h3>}

			<h3>
        Discussions{' '}
				{!loading && !error && posts && (
					<span className="card-count">{posts.length}</span>
				)}
			</h3>
			{!loading && !error && posts && (
				<>
					{posts.length > 0 ? (
						posts.map((post) => {
							const numPostId = Number(post.post_id);
							return (
								!!post?.username && (
									<div
										key={numPostId}
										className="post-card-div"
										onClick={() => openSidebar(numPostId)}
									>
										<DiscussionPostCard
											id={numPostId}
											title={post.title}
											username={post?.username}
											commentsCount={post.comments_count}
											createdAt={post.created_at}
										/>
									</div>
								)
							);
						})
					) : (
						<p>No Discussions found.</p>
					)}
				</>
			)}
		</div>
	);
};

export default DiscussionsBoard;
