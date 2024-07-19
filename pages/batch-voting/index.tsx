// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { getActiveProposalsForTrack } from 'pages/api/v1/posts/non-voted-active-proposals';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import VotingCards from '~src/components/VotingCards';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

interface IBatchVoting {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	trackDetails: any;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);
	const token = getTokenFromReq(context.req.headers as any);
	console.log('hello SSR --> ', token);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error = '' } = await getActiveProposalsForTrack({
		isExternalApiCall: true,
		network,
		page: 1,
		proposalType: ProposalType.OPEN_GOV,
		userAddress: ''
	});

	return {
		props: {
			data,
			error,
			network
		}
	};
};

const BatchVoting: FC<IBatchVoting> = (props) => {
	const { network, data } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
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
