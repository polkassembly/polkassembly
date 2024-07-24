// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { IPostsListingResponse, getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import BountiesContainer from '~src/components/Bounties';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import SEOHead from '~src/global/SEOHead';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { ProposalType, getStatusesFromCustomStatus } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import { setNetwork } from '~src/redux/network';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	if (network != 'polkadot') {
		return {
			props: {},
			redirect: {
				destination: isOpenGovSupported(network) ? '/opengov' : '/'
			}
		};
	}
	const LISTING_LIMIT = 12;
	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = context.query;
	const proposalType = ProposalType.BOUNTIES;

	const [extendedResponse, activeBountyResp] = await Promise.allSettled([
		getOnChainPosts({
			filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
			includeContent: true,
			listingLimit: LISTING_LIMIT,
			network,
			page,
			preimageSection: '',
			proposalStatus: ['Active', 'Extended'],
			proposalType,
			sortBy
		}),
		getOnChainPosts({
			filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
			getBountyReward: true,
			includeContent: true,
			listingLimit: LISTING_LIMIT,
			network,
			page,
			preimageSection: 'Bounties',
			proposalStatus: getStatusesFromCustomStatus(CustomStatus.Voting),
			proposalType: ProposalType.REFERENDUM_V2,
			sortBy
		})
	]);

	const extendedData = extendedResponse.status === 'fulfilled' ? extendedResponse.value.data : null;
	const activeBountyData = activeBountyResp.status === 'fulfilled' ? activeBountyResp.value.data : null;
	const error = extendedResponse.status === 'rejected' ? extendedResponse.reason : activeBountyResp.status === 'rejected' ? activeBountyResp.reason : null;

	return {
		props: {
			activeBountyData,
			error,
			extendedData,
			network
		}
	};
};

interface IBountyProps {
	activeBountyData?: IPostsListingResponse;
	error?: string;
	extendedData?: IPostsListingResponse;
	network: string;
}

const Bounty: React.FC<IBountyProps> = (props) => {
	const { extendedData, activeBountyData, error, network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	if (error) return <ErrorState errorMessage={error} />;

	return (
		<>
			<SEOHead
				title='Bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<div>
				<BountiesContainer
					activeBountyData={activeBountyData}
					extendedData={extendedData}
				/>
			</div>
		</>
	);
};

export default Bounty;
