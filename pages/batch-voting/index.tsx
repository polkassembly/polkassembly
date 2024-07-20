// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { getActiveProposalsForTrack } from 'pages/api/v1/posts/non-voted-active-proposals';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import console_pretty from '~src/api-utils/console_pretty';
import { IRefreshTokenPayload } from '~src/auth/types';
import VotingCards from '~src/components/VotingCards';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import * as jwt from 'jsonwebtoken';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';

interface IBatchVoting {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	trackDetails: any;
}
// const publicKey = process.env.REFRESH_TOKEN_PUBLIC_KEY;
export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	// const token = context.req.cookies.refresh_token;
	// let userInfo;
	// console.log('console token --> ', token);
	// if (token && publicKey) {
	// 	const decoded = jwt.verify(token, publicKey) as IRefreshTokenPayload;
	// 	console_pretty({ decoded });
	// 	if (decoded) {
	// 		userInfo = decoded;
	// 	}
	// }
	// console.log('console is here --> ', userInfo);
	// const { data, error } = await getActiveProposalsForTrack({
	// 	isExternalApiCall: true,
	// 	network: network,
	// 	proposalType: ProposalType.REFERENDUM_V2,
	// 	// userAddress: userInfo?.login_address || '',
	// 	// userId: userInfo?.id || 0
	// 	userAddress: '5GBnMKKUHNbN2fqBY4NbwMMNNieJLYHjr3p9J5W9i1nxKk8e',
	// 	userId: 13494
	// });

	return {
		props: {
			// data,
			// error,
			network
		}
	};
};

const BatchVoting: FC<IBatchVoting> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();
	const user = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const [activeProposals, setActiveProposals] = useState();
	const getActiveProposals = async () => {
		const { data, error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/updateBatchVoteCart', {
			isExternalApiCall: true,
			network: network,
			proposalType: ProposalType.REFERENDUM_V2,
			userAddress: user?.loginAddress,
			userId: user?.id
		});
		if (error) {
			console.error(error);
			return;
		} else {
			console.log(data);
			setActiveProposals(data);
		}
	};

	useEffect(() => {
		dispatch(setNetwork(props.network));
		if (!api || !apiReady) return;
		getActiveProposals();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	console.log(activeProposals);

	return (
		<>
			<SEOHead
				title='Batch Voting'
				network={network}
			/>
			<VotingCards trackPosts={activeProposals} />
		</>
	);
};

export default BatchVoting;
