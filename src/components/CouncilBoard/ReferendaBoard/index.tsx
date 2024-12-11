// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IPostListing, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect, useState } from 'react';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ReferendaPostCard from './ReferendaPostCard';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	openSidebar: (postID: number) => void;
}

const ReferendaBoard = ({ className, openSidebar }: Props) => {
	const { t } = useTranslation('common');
	const [posts, setPosts] = useState<IPostListing[]>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IPostsListingResponse>(`api/v1/posts/on-chain-posts?proposalType=${ProposalType.REFERENDUMS}&listingLimit=${10}`)
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
			<h3>
				{t('referenda')} {!loading && !error && posts && <span className='card-count'>{posts.length}</span>}
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
										className='post-card-div'
										onClick={() => openSidebar(numPostId)}
									>
										<ReferendaPostCard
											title={post.title}
											method={post.method}
											postStatus={post.status}
											createdAt={post.created_at}
											referendumId={numPostId}
										/>
									</div>
								)
							);
						})
					) : (
						<p>{t('no_referenda_found')}</p>
					)}
				</>
			)}
		</div>
	);
};

export default ReferendaBoard;
