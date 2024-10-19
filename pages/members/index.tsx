// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import WhitelistMembersContainer from '~src/components/Listing/WhitelistMembers/WhitelistMembersContainer';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export enum EMembersType {
	WHITELIST = 'whitelist',
	FELLOWSHIP = 'fellowship',
	COUNCIL = 'council'
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const translations = await serverSideTranslations(locale || '', ['common']);

	return { props: { network, ...translations } };
};

const WhitelistMembers = (props: { network: string }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation('common');

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Whitelist'
				network={props.network}
			/>
			<h1 className='dashboard-heading mb-4 dark:text-white md:mb-6'>{t('open_tech_committee_members')}</h1>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay dark:text-white md:p-8 md:text-base'>
					{t('open_tech_committee_desc')}
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
