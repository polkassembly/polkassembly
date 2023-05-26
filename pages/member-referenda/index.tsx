// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import TrackListing from '~src/components/Listing/FellowshipReferendum/TrackListing';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { ErrorState, PostEmptyState } from '~src/ui-components/UIStates';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST,filterBy } = query;
	const network = getNetworkFromReqHeaders(req.headers);

	const proposalType = ProposalType.FELLOWSHIP_REFERENDUMS;

	const { data, error } = await getOnChainPosts({
		filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network } };
};

interface IFellowshipReferendumProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
}

const FellowshipAdmin: FC<IFellowshipReferendumProps> = (props) => {
	const { data, error, network } = props;
	const { setNetwork } = useNetworkContext();
	setNetwork(network);

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return <PostEmptyState />;
	const { posts } = data;
	console.log('posts', posts);
	const fellowshipReferendumPostOrigins: string[] = [];
	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if (value?.fellowshipOrigin) {
				fellowshipReferendumPostOrigins.push(key);
			}
		});
	}
	return <>
		<SEOHead title={'Fellowship Referendum'} network={network}/>
		<TrackListing
			allTrackPosts={posts}
			fellowshipReferendumPostOrigins={fellowshipReferendumPostOrigins}
		/>
	</>;
};

export default FellowshipAdmin;