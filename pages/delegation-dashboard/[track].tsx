// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import { useEffect } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import DashboardTrackListing from '~src/components/DelegationDashboardComponents/dashboardTrack';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import { ProposalType } from '~src/global/proposalType';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const { track } = query;
	const network = getNetworkFromReqHeaders(req.headers);
  const fetch = getOnChainPosts({ network ,trackStatus: ProposalType.OPEN_GOV,  })
	return { props: { network } };

};

const DashboardTracks = ( props : { network: string} ) => {

	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <>
		<SEOHead title='Delegation Board' />
		<DashboardTrackListing/>
	</>;
};
export default DashboardTracks;