// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import VotingCards from '~src/components/VotingCards';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import getQueryToTrack from '~src/util/getQueryToTrack';

interface IBatchVoting {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	trackDetails: any;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, track } = query;
	const trackDetails: any = getQueryToTrack(String(track), network);

	const { data, error = '' } = await getOnChainPosts({
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType: ProposalType.OPEN_GOV,
		sortBy,
		trackNo: trackDetails?.trackId,
		trackStatus: CustomStatus.Active
	});

	return {
		props: {
			data,
			error,
			network,
			trackDetails
		}
	};
};

const BatchVoting: FC<IBatchVoting> = (props) => {
	const { network, data } = props;
	console.log(data);
	return (
		<>
			<SEOHead
				title='Batch Voting'
				network={network}
			/>
			<VotingCards trackPosts={data} />
		</>
	);
};

export default BatchVoting;
