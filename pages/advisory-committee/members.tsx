// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import AdvisoryCommitteMembers from '~src/components/AdvisoryCommittee/AdvisoryCommitteMembers';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { useNetworkSelector } from '~src/redux/selectors';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { getSubdomain } from '~src/util/getSubdomain';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	let network = getNetworkFromReqHeaders(req.headers);
	const queryNetwork = new URL(req.headers.referer || '').searchParams.get('network');
	if (queryNetwork) {
		network = queryNetwork;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const AdvisoryMembers = (props: { network: string }) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { network } = useNetworkSelector();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window.location.href;
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain].includes(network)) {
			router.push({
				query: {
					network: network
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Advisory Committee'
				network={props.network}
			/>
			<h1 className='dashboard-heading mb-4 dark:text-white md:mb-6'>Advisory Council Members</h1>
			<AdvisoryCommitteMembers />
		</>
	);
};

export default AdvisoryMembers;
