// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import MembersContainer from 'src/components/Listing/Members/MembersContainer';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useDispatch } from 'react-redux';
import { networkActions } from '~src/redux/network';
import SEOHead from '~src/global/SEOHead';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const Members = (props : { network: string }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(networkActions.setNetwork(props.network));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead title='Council' network={props.network}/>
			<h1 className='text-bodyBlue font-semibold text-2xl leading-9 mx-2'>Council</h1>

			{/* Intro and Create Post Button */}
			<div className="flex flex-col md:flex-row">
				<p className="text-bodyBlue text-sm font-medium bg-white p-4 md:p-8 rounded-xxl w-full shadow-md mb-4">
                Council is the body of elected members that consists of several on-chain accounts. The Council can act as a representative for &quot;passive&quot; (non-voting) stakeholders. Council members have two main tasks: proposing referenda for the overall stakeholder group to vote on and cancelling malicious referenda.
				</p>
			</div>
			<MembersContainer className='mt-8' />
		</>
	);
};

export default Members;