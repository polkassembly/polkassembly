// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AllianceUnscrupulous from 'src/components/Listing/Members/AllianceUnscrupulous';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const translations = await serverSideTranslations(locale || '', ['common']);

	return {
		props: {
			network,
			...translations
		}
	};
};

const Unscrupulous = ({ network }: { network: string }) => {
	const { t } = useTranslation('common');
	return (
		<>
			<SEOHead
				title={'Alliance Unscrupulous'}
				network={network}
			/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>t{'alliance'}</h1>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay md:p-8 md:text-base'>{t('alliance_desc')}</p>
			</div>
			<AllianceUnscrupulous className='mt-8' />
		</>
	);
};

export default Unscrupulous;
