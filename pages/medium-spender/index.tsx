// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import {
	getOnChainPosts,
	IPostsListingResponse,
} from 'pages/api/v1/listing/on-chain-posts';
import { getOnChainPostsCount } from 'pages/api/v1/listing/on-chain-posts-count';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import TrackListing from '~src/components/Listing/Tracks/TrackListing';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { IApiResponse, PostOrigin } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';

export const getServerSideProps: GetServerSideProps = async ({
	req,
	query,
}) => {
	const {
		page = 1,
		sortBy = sortValues.NEWEST,
		filterBy,
		trackStatus,
	} = query;
	if (!trackStatus) {
		return {
			props: {},
			redirect: {
				destination: '/medium-spender?trackStatus=all&page=1',
			},
		};
	}
	const network = getNetworkFromReqHeaders(req.headers);

	if (!networkTrackInfo[network][PostOrigin.MEDIUM_SPENDER]) {
		return { props: { error: `Invalid track for ${network}` } };
	}

	const { trackId } = networkTrackInfo[network][PostOrigin.MEDIUM_SPENDER];
	const proposalType = ProposalType.OPEN_GOV;

	const fetches = [
		'CustomStatusSubmitted',
		'CustomStatusVoting',
		'CustomStatusClosed',
		'All',
	].reduce((prev: any, status) => {
		const strTrackStatus = String(trackStatus);
		if (status.toLowerCase().includes(strTrackStatus)) {
			prev[strTrackStatus] = getOnChainPosts({
				filterBy:
					filterBy &&
					Array.isArray(
						JSON.parse(decodeURIComponent(String(filterBy))),
					)
						? JSON.parse(decodeURIComponent(String(filterBy)))
						: [],
				listingLimit: LISTING_LIMIT,
				network,
				page,
				proposalType,
				sortBy,
				trackNo: trackId,
				trackStatus: status,
			});
		} else {
			prev[status.toLowerCase().replace('customstatus', '')] =
				getOnChainPostsCount({
					network,
					page,
					proposalType,
					trackNo: trackId,
					trackStatus: status,
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
				error: result.reason,
			} as IApiResponse<IPostsListingResponse>;
		}
	});
	const props: IMediumSpenderProps = {
		network,
		posts: {},
	};
	Object.keys(fetches).forEach((key, index) => {
		(props.posts as any)[key] = results[index];
	});

	return { props };
};
interface IMediumSpenderProps {
	posts: IReferendumV2PostsByStatus;
	network: string;
	error?: string;
}

const MediumSpender: FC<IMediumSpenderProps> = (props) => {
	const { posts, error } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	if (error) return <ErrorState errorMessage={error} />;

	if (!posts || Object.keys(posts).length === 0) return null;
	return (
		<>
			<SEOHead
				title={PostOrigin.MEDIUM_SPENDER.split(/(?=[A-Z])/).join(' ')}
				network={props.network}
			/>
			<TrackListing trackName={PostOrigin.MEDIUM_SPENDER} posts={posts} />
		</>
	);
};

export default MediumSpender;
