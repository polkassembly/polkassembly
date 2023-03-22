// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useContext, useEffect, useState } from 'react';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import { LoadingState, PostEmptyState } from 'src/ui-components/UIStates';

import { NetworkContext } from '~src/context/NetworkContext';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface ITrackListingTabContentProps {
	className?: string;
	trackName: string;
}

const TrackListingTabContent: FC<ITrackListingTabContentProps> = (props) => {
	const { trackName, className } = props;
	const { network } = useContext(NetworkContext);

	const { trackId } = networkTrackInfo[network][trackName];

	const [loading, setLoading] = useState(false);

	const [error, setError] = useState('');
	const [posts, setPosts] = useState<any[]>([]);

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IPostsListingResponse>(`/api/v1/listing/on-chain-posts?proposalType=${ProposalType.FELLOWSHIP_REFERENDUMS}&trackNo=${trackId}`)
			.then((res) => {
				setLoading(false);
				const { data, error } = res;
				if (error) {
					setError(error);
				} else if (data) {
					setPosts(data.posts);
				}
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
			});
	}, [trackId]);

	if(error) return <div className={className}><ErrorAlert errorMsg={error} /></div>;

	if(!posts || loading) return <div className={className}><LoadingState /></div>;

	const noPost = !posts || !posts.length;

	if (noPost) return <div className={className}><PostEmptyState /></div>;

	return (
		<div className={className}>
			{posts.map((post) => {
				return (
					<div key={post.post_id} className='my-5'>
						{<Link href={`/member-referenda/${post.post_id}`}>
							<GovernanceCard
								postReactionCount={post.post_reactions}
								address={post.proposer}
								commentsCount={post.comments_count || 0}
								method={post.method}
								onchainId={post.post_id}
								status={post.status}
								title={post.title}
								topic={post.topic.name}
								created_at={post.created_at}
							/>
						</Link>}
					</div>
				);
			}
			)}
		</div>
	);
};

export default TrackListingTabContent;