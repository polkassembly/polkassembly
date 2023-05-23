// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
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
import { handlePaginationChange } from '~src/util/handlePaginationChange';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;
	const network = getNetworkFromReqHeaders(req.headers);

	if(!networkTrackInfo[network][PostOrigin.BIG_TIPPER]) {
		return { props: { error: `Invalid track for ${network}` } };
	}

	const { trackId } = networkTrackInfo[network][PostOrigin.BIG_TIPPER];
	const proposalType = ProposalType.OPEN_GOV;

	const fetches = {
		all: getOnChainPosts({
			filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: 'All'
		}),
		closed: getOnChainPosts({
			filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: CustomStatus.Closed
		}),
		submitted: getOnChainPosts({
			filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
			listingLimit: LISTING_LIMIT,
			network,
			page,
			proposalType,
			sortBy,
			trackNo: trackId,
			trackStatus: CustomStatus.Submitted
		}),
		voting: getOnChainPosts({
			filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
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
	const props: IBigTipperProps = {
		network,
		posts: {}
	};
	Object.keys(fetches).forEach((key, index) => {
		(props.posts as any)[key] = results[index];
	});

	return { props };
};
interface IBigTipperProps {
	posts: IReferendumV2PostsByStatus;
	network: string;
	error?: string;
}

const BigTipper: FC<IBigTipperProps> = (props) => {
	const { posts, error, network } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const onPaginationChange = (page:number) => {
		router.push({
			query:{
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	if (error) return <ErrorState errorMessage={error} />;

	if (!posts || Object.keys(posts).length === 0) return null;
	return <>
		<SEOHead title={PostOrigin.BIG_TIPPER.split(/(?=[A-Z])/).join(' ')} network={network}/>
		<TrackListing
			trackName={PostOrigin.BIG_TIPPER}
			posts={posts}
		/>
		<div className='flex justify-end mt-6'>
			<Pagination defaultCurrent={1}
				pageSize={LISTING_LIMIT}
				total={posts.all?.data?.count || 0}
				showSizeChanger={false}
				hideOnSinglePage={true}
				onChange={onPaginationChange}
				responsive={true}
			/>
		</div>
	</>;
};

export default BigTipper;