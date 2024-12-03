// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
const Community = dynamic(() => import('~src/components/Community'), { ssr: false });

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	if (!isOpenGovSupported(network)) {
		return {
			props: {},
			redirect: {
				destination: '/'
			}
		};
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const NetworkCommunity = (props: { network: string }) => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.network]);

	return (
		<>
			<SEOHead
				title='Network Community Page'
				desc='Meet the accomplished and dedicated members of our Governance Level Analytics program, who are dedicated to promoting and advancing the goals of the community.'
				network={props.network}
			/>
			<section className='mt-2 flex flex-col gap-y-2'>
				<div className='flex items-center justify-start gap-x-2'>
					<h1 className='m-0 p-0 text-2xl font-semibold text-bodyBlue dark:text-white'>Community</h1>
				</div>
				<div className='flex w-full items-center rounded-xl border-none bg-white px-4 py-4 dark:bg-black'>
					<p className='m-0 p-0 text-sm font-normal text-bodyBlue dark:text-white'>Explore all members contributing to the {props.network} ecosystem.</p>
				</div>
				<Community />
			</section>
		</>
	);
};

export default NetworkCommunity;
