// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import ImageIcon from '~src/ui-components/ImageIcon';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import ScoringDetails from '../../src/components/AstralScoring/ScoringDetails';
import { scoringData } from '../../src/components/AstralScoring/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

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

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	const translations = await serverSideTranslations(locale || '', ['common']);

	if (networkRedirect) return networkRedirect;

	return { props: { network, ...translations } };
};

const AstralScoring = (props: { network: string; className: string }) => {
	const { className } = props;
	const dispatch = useDispatch();
	const { t } = useTranslation('common');
	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.network]);

	return (
		<>
			<SEOHead
				title='Astral Scoring'
				desc='Meet the accomplished and dedicated members of our Governance Level Analytics program, who are dedicated to promoting and advancing the goals of the community.'
				network={props.network}
			/>
			<section className={`${className} mt-2 flex h-full flex-col gap-y-6`}>
				<div
					className='hidden h-[200px] w-full rounded-2xl md:block'
					style={{
						backgroundImage: "url('/assets/astral-banner.svg')",
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundSize: 'cover'
					}}
				></div>
				<article className='flex h-full w-full flex-col gap-y-2 rounded-[14px] bg-white px-6 py-4 shadow-md dark:bg-section-dark-overlay'>
					<div className='mt-3 flex items-center justify-start gap-x-2 '>
						<ImageIcon
							src='/assets/icons/astral-star-icon.svg'
							alt='astral-star-icon'
						/>
						<h1 className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>{t('astrals_scoresheet')}</h1>
					</div>
					<p className='m-0 p-0 text-sm font-medium text-sidebarBlue dark:text-blue-dark-medium'>{t('see_how_you_can_earn_more_points')}</p>
					<div className='mt-2 grid w-full gap-x-6 gap-y-4 md:grid-cols-2'>
						<ScoringDetails scoringData={scoringData.slice(0, 3)} />
						<ScoringDetails scoringData={scoringData.slice(3)} />
					</div>
				</article>
			</section>
		</>
	);
};

export default AstralScoring;
