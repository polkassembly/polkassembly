// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import AllianceMembers from '~src/components/Listing/Members/AllianceMembers';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return {
		props: {
			network
		}
	};
};

const Members = ({ network }: { network: string }) => {
	return (
		<>
			<SEOHead
				title={'Alliance Members'}
				network={network}
			/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>Alliance</h1>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay md:p-8 md:text-base'>
					The Alliance Pallet provides a collective that curates a list of accounts and URLs, deemed by the voting members to be unscrupulous actors. The Alliance provides a set of
					ethics against bad behavior, and provides recognition and influence for those teams that contribute something back to the ecosystem.
				</p>
			</div>
			<AllianceMembers className='mt-8' />
		</>
	);
};

export default Members;
