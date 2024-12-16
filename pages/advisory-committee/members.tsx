// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import AdvisoryCommitteMembers from '~src/components/AdvisoryCommittee/AdvisoryCommitteMembers';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	const translations = await serverSideTranslations(locale || '', ['common']);

	if (networkRedirect) return networkRedirect;

	return { props: { network, ...translations } };
};

const AdvisoryMembers = (props: { network: string }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation('common');

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Advisory Committee'
				network={props.network}
			/>
			<h1 className='dashboard-heading mb-4 dark:text-white md:mb-6'>{t('advisory_council_members')}</h1>
			<AdvisoryCommitteMembers />
		</>
	);
};

export default AdvisoryMembers;
