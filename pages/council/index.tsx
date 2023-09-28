// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import MembersContainer from 'src/components/Listing/Members/MembersContainer';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const Members = (props: { network: string }) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Council'
				network={props.network}
			/>
			<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue'>Council</h1>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-xxl bg-white p-4 text-sm font-medium text-bodyBlue shadow-md md:p-8'>
					Council is the body of elected members that consists of several on-chain accounts. The Council can act as a representative for &quot;passive&quot; (non-voting)
					stakeholders. Council members have two main tasks: proposing referenda for the overall stakeholder group to vote on and cancelling malicious referenda.
				</p>
			</div>
			<MembersContainer className='mt-8' />
		</>
	);
};

export default Members;
