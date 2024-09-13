// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { delegationSupportedNetworks } from '~src/components/Post/Tabs/PostStats/util/constants';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';

const DelegationDashboard = dynamic(() => import('src/components/DelegationDashboard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	if (!delegationSupportedNetworks.includes(network)) {
		return {
			props: {},
			redirect: {
				destination: '/'
			}
		};
	}
	return { props: { network } };
};

const Delegation = (props: { network: string }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Delegation Dashboard'
				network={props.network}
			/>
			<div className=''>
				<DelegationDashboard />
			</div>
		</>
	);
};

export default Delegation;
