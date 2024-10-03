// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import OnchainBounties from '~src/components/OnchainBounties';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

interface OnchainBountiesProps {
	network: string;
}
export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return {
		props: {
			network
		}
	};
};

const Index: FC<OnchainBountiesProps> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div>
			{' '}
			<SEOHead
				title='On-chain bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<OnchainBounties />
		</div>
	);
};

export default Index;
