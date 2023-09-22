// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import WhitelistMembersContainer from '~src/components/Listing/WhitelistMembers/WhitelistMembersContainer';
import { useDispatch } from 'react-redux';
import { networkActions } from '~src/redux/network';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export enum EMembersType {
	WHITELIST = 'whitelist',
	FELLOWSHIP = 'fellowship',
	COUNCIL = 'council'
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const WhitelistMembers = (props: { network: string }) => {
	const { network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(networkActions.setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Whitelist'
				network={network}
			/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>Open Tech Committee Members</h1>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md md:p-8 md:text-base'>
					Open Tech Committee Members is a mostly self-governing expert body with a primary goal of representing the humans who embody and contain the technical knowledge base of
					the Polkadot network and protocol.
				</p>
			</div>
			<WhitelistMembersContainer
				membersType={EMembersType.WHITELIST}
				className='mt-8'
			/>
		</>
	);
};

export default WhitelistMembers;
