// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { getOnChainPostsCount } from 'pages/api/v1/listing/on-chain-posts-count';
import React, { FC } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import TrackListing from '~src/components/Listing/FellowshipReferendum/TrackListing';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { IApiResponse } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';

export interface IFellowshipReferendumPostsByTrackName {
	[key: string]: IApiResponse<IPostsListingResponse> | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST, filterBy, trackName } = query;
	if (!trackName) {
		return {
			props: {},
			redirect: {
				destination: '/member-referenda?trackName=All&page=1'
			}
		};
	}
	const network = getNetworkFromReqHeaders(req.headers);
	const fellowshipReferendumPostOrigins: string[] = [];
	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if (value?.fellowshipOrigin) {
				fellowshipReferendumPostOrigins.push(key);
			}
		});
	}

	fellowshipReferendumPostOrigins.push('All');

	const proposalType = ProposalType.FELLOWSHIP_REFERENDUMS;

	const fetches = fellowshipReferendumPostOrigins.reduce((prev: any, currTrackName) => {
		const trackId: any = networkTrackInfo?.[network]?.[currTrackName]?.trackId;
		if (trackName === currTrackName) {
			prev[currTrackName] = getOnChainPosts({
				filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
				listingLimit: LISTING_LIMIT,
				network,
				page,
				proposalType,
				sortBy,
				trackNo: trackId
			});
		} else {
			prev[currTrackName] = getOnChainPostsCount({
				network,
				page,
				proposalType,
				trackNo: trackId,
				trackStatus: 'all'
			});
		}
		return prev;
	}, {});

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
	const props: IFellowshipReferendumProps = {
		network,
		posts: {}
	};
	Object.keys(fetches).forEach((key, index) => {
		(props.posts as any)[key] = results[index];
	});

	return { props };
};

interface IFellowshipReferendumProps {
	posts?: IFellowshipReferendumPostsByTrackName;
	network: string;
	error?: string;
}

const FellowshipAdmin: FC<IFellowshipReferendumProps> = (props) => {
	const { posts, error, network } = props;
	const { setNetwork } = useNetworkContext();
	setNetwork(network);

	if (error) return <ErrorState errorMessage={error} />;
	const fellowshipReferendumPostOrigins: string[] = [];
	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if (value?.fellowshipOrigin) {
				fellowshipReferendumPostOrigins.push(key);
			}
		});
	}
	return (
		<>
			<SEOHead
				title={'Fellowship Referendum'}
				network={network}
			/>
			<TrackListing
				posts={posts}
				fellowshipReferendumPostOrigins={fellowshipReferendumPostOrigins}
			/>
		</>
	);
};

export default FellowshipAdmin;
