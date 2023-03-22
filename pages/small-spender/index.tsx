// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import TrackListing from '~src/components/Listing/Tracks/TrackListing';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { IApiResponse, PostOrigin } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST } = query;
	const network = getNetworkFromReqHeaders(req.headers);

	if(!networkTrackInfo[network][PostOrigin.SMALL_SPENDER]) {
		return { props: { error: `Invalid track for ${network}` } };
	}

	const { trackId } = networkTrackInfo[network][PostOrigin.SMALL_SPENDER];
	const proposalType = ProposalType.OPEN_GOV;

	const fetches = {
		all: getOnChainPosts({
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: 'All'
		}),
		closed: getOnChainPosts({
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: CustomStatus.Closed
		}),
		submitted: getOnChainPosts({
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: CustomStatus.Submitted
		}),
		voting: getOnChainPosts({
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: CustomStatus.Voting
		})
	};

	const responseArr = await Promise.allSettled(Object.values(fetches));

	const results = responseArr.map((result) => {
		if (result.status === 'fulfilled') {
			return result.value;
		} else {
			return {
				data: null,
				error: result.reason
			} as IApiResponse<IPostsListingResponse>;
		}
	});
	const props: ISmallSpenderProps = {
		network,
		posts: {}
	};
	Object.keys(fetches).forEach((key, index) => {
		(props.posts as any)[key] = results[index];
	});

	return { props };
};
interface ISmallSpenderProps {
	posts: IReferendumV2PostsByStatus;
	network: string;
	error?: string;
}

const SmallSpender: FC<ISmallSpenderProps> = (props) => {
	const { posts, error } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

	if (!posts || Object.keys(posts).length === 0) return null;
	return <>
		<SEOHead title={PostOrigin.SMALL_SPENDER.split(/(?=[A-Z])/).join(' ')} />
		<TrackListing
			trackName={PostOrigin.SMALL_SPENDER}
			posts={posts}
		/>
	</>;
};

export default SmallSpender;