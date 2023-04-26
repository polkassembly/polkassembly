// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { EMembersType } from 'pages/members';
import React, { useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import WhitelistMembersContainer from '~src/components/Listing/WhitelistMembers/WhitelistMembersContainer';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const FellowshipMembers = (props: { network: string }) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead title='Fellowship' network={props.network}/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>Fellowship</h1>

			{/* Intro and Create Post Button */}
			<div className="flex flex-col md:flex-row">
				<p className="text-sidebarBlue text-sm md:text-base font-medium bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
					Fellowship is a mostly self-governing expert body with a primary goal of representing the humans who embody and contain the technical knowledge base of the Polkadot network and protocol.
				</p>
			</div>
			<WhitelistMembersContainer membersType={EMembersType.FELLOWSHIP} className='mt-8' />
		</>
	);
};

export default FellowshipMembers;