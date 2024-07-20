// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
const VoteCart = dynamic(() => import('src/components/VoteCart'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const CouncilBoard = (props: { network: string }) => {
	const dispatch = useDispatch();
	const user = useUserDetailsSelector();

	const getVoteCartData = async () => {
		const { data, error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/getBatchVotesCart', {
			isExternalApiCall: true,
			page: 1,
			userAddress: user?.loginAddress
		});
		if (error) {
			console.error(error);
			return;
		} else {
			console.log('cards in cart --> ', data);
		}
	};

	useEffect(() => {
		dispatch(setNetwork(props.network));
		getVoteCartData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Votes Cart'
				network={props.network}
			/>
			<VoteCart />
		</>
	);
};

export default CouncilBoard;
