// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { IPostsListingResponse, getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import BountiesContainer from '~src/components/Bounties';
import SEOHead from '~src/global/SEOHead';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { ProposalType } from '~src/global/proposalType';
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

	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = context.query;
	const proposalType = ProposalType.BOUNTIES;

	const extendedResponse = await getOnChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalStatus: ['Proposed', 'Active', 'CuratorUnassigned', 'Extended'],
		proposalType,
		sortBy
	});

	const activeResponse = await getOnChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalStatus: ['Active'],
		proposalType,
		sortBy
	});

	return {
		props: {
			activeData: activeResponse.data,
			error: extendedResponse.error || activeResponse.error || null,
			extendedData: extendedResponse.data,
			network
		}
	};
};

interface IBountyProps {
	activeData?: IPostsListingResponse;
	error?: string;
	extendedData?: IPostsListingResponse;
	network: string;
}

const Bounty: React.FC<IBountyProps> = (props) => {
	const { extendedData, activeData, error, network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	if (error) return <ErrorState errorMessage={error} />;
	if (!extendedData || !activeData) return null;

	return (
		<>
			<SEOHead
				title='Bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<BountiesContainer
				extendedData={extendedData}
				activeData={activeData}
			/>
		</>
	);
};

export default Bounty;
