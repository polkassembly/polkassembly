// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import VotingCards from '~src/components/TinderStyleVoting';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import BatchVotingWeb from '~src/components/BatchVoting';
import { network as AllNetworks } from '~src/global/networkConstants';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

interface IBatchVoting {
	network: string;
}
export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	if (
		!isOpenGovSupported(network) ||
		[AllNetworks.MOONBASE, AllNetworks.MOONRIVER, AllNetworks.LAOSSIGMA, AllNetworks.MOONBEAM, AllNetworks.PICASSO, AllNetworks.MYTHOS].includes(network)
	) {
		return {
			props: {},
			redirect: {
				destination: isOpenGovSupported(network) ? '/opengov' : '/'
			}
		};
	}

	return {
		props: {
			network
		}
	};
};

const BatchVoting: FC<IBatchVoting> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Batch Voting'
				network={network}
			/>
			{network === 'polkadot' && (
				<div className='batch-voting-mobile-container mb-4 block overflow-y-hidden px-4 sm:hidden'>
					<VotingCards />
				</div>
			)}
			<div className='batch-voting-desktop-container hidden sm:block'>
				<BatchVotingWeb />
			</div>
		</>
	);
};

export default BatchVoting;
