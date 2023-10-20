// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect, useState } from 'react';
import Listing from 'src/components/Listing';
import { ErrorState, LoadingState } from 'src/ui-components/UIStates';

import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IListingContainerProps {
	className?: string;
	title: string;
	isTip?: boolean;
	postIds: number[];
	proposalType: ProposalType;
}

const ListingContainer: FC<IListingContainerProps> = (props) => {
	const { className, title, isTip, postIds, proposalType } = props;
	const [error, setError] = useState('');
	const [posts, setPosts] = useState<any[]>();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (postIds.length > 0) {
			setLoading(true);
			nextApiClientFetch<IPostsListingResponse>(`api/v1/listing/on-chain-posts?proposalType=${proposalType}`, {
				postIds: postIds
			})
				.then((res) => {
					if (res.error) {
						setError(res.error);
					} else {
						setPosts(res.data?.posts);
					}
					setLoading(false);
				})
				.catch((err) => {
					setError(err);
					setLoading(false);
				});
		}
	}, [postIds, proposalType]);

	if (error) {
		return <ErrorState errorMessage={error} />;
	}

	return (
		<div className={`${className} rounded-md bg-white dark:bg-section-dark-overlay p-3 shadow-md md:p-8`}>
			<div className='flex items-center justify-between'>
				<h1 className='dashboard-heading'>{title}</h1>
			</div>
			{loading ? (
				<LoadingState />
			) : (
				<Listing
					posts={posts}
					proposalType={proposalType}
					isTip={isTip}
				/>
			)}
		</div>
	);
};

export default ListingContainer;
