// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import ImageIcon from '~src/ui-components/ImageIcon';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
const GovAnalytics = dynamic(() => import('~src/components/GovAnalytics'), { ssr: false });

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	if (!isOpenGovSupported(network)) {
		return {
			props: {},
			redirect: {
				destination: '/'
			}
		};
	}

	const translations = await serverSideTranslations(locale || '', ['common']);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network, ...translations } };
};

const GovLevelAnalytics = (props: { network: string }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation('common');

	const { resolvedTheme: theme } = useTheme();
	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.network]);

	return (
		<>
			<SEOHead
				title='Governance Level Analytics'
				desc='Meet the accomplished and dedicated members of our Governance Level Analytics program, who are dedicated to promoting and advancing the goals of the community.'
				network={props.network}
			/>
			<section className='mt-2 flex flex-col gap-y-8'>
				<div className='flex items-center justify-start gap-x-2'>
					<ImageIcon
						src={theme === 'dark' ? '/assets/icons/gov-analytics-icon-white.svg' : '/assets/icons/gov-analytics-icon.svg'}
						alt='gov-analytics'
					/>
					<h1 className='m-0 p-0 text-2xl font-semibold text-bodyBlue dark:text-white'>{t('governance_analytics')}</h1>
				</div>
				<div className='flex h-[68px] w-full items-center rounded-xl border-none bg-white px-6 py-4 dark:bg-black'>
					<p className='m-0 p-0 text-sm font-normal text-bodyBlue dark:text-white'>{t('gov_Analytics_desc')}</p>
				</div>
				<GovAnalytics />
			</section>
		</>
	);
};

export default GovLevelAnalytics;
