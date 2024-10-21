// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { useEffect, useState } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import SEOHead from '~src/global/SEOHead';
import { IApiResponse, NetworkSocials } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import styled from 'styled-components';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import Skeleton from '~src/basic-components/Skeleton';
import ActivityFeeToggleButton from '~src/components/ActivityFeed/ActivityFeeToggleButton';
import ActivityFeedSidebar from '~src/components/ActivityFeed/ActivityFeedSidebar';
import { EActivityFeedTab } from '~src/components/ActivityFeed/types/types';
import { isActivityFeedSupportedNetwork } from '~src/components/ActivityFeed/utils/ActivityFeedSupportedNetwork';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const LatestActivity = dynamic(() => import('~src/components/ActivityFeed'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	networkSocialsData?: IApiResponse<NetworkSocials>;
	network: string;
	error: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
	try {
		const network = getNetworkFromReqHeaders(req?.headers);
		const networkRedirect = checkRouteNetworkWithRedirect(network);
		if (networkRedirect) return networkRedirect;

		if (!networkTrackInfo[network]) {
			return {
				props: {
					error: `Network '${network}' does not support OpenGov yet.`,
					network,
					networkSocialsData: null
				}
			};
		}
		if (!isActivityFeedSupportedNetwork(network)) {
			return {
				props: {},
				redirect: {
					destination: isOpenGovSupported(network) ? '/opengov' : '/'
				}
			};
		}

		const networkSocialsData = await getNetworkSocials({ network });
		const translations = await serverSideTranslations(locale || '', ['common']);

		return {
			props: {
				error: '',
				network,
				networkSocialsData,
				...translations
			}
		};
	} catch (error) {
		console.error('Error in getServerSideProps:', error);
		return {
			props: {
				error: 'An unexpected error occurred. Please try again later.',
				network: '',
				networkSocialsData: null
			}
		};
	}
};

const ActivityFeed = ({ error, network, networkSocialsData }: Props) => {
	const dispatch = useDispatch();
	const { t } = useTranslation('common');
	const [activeTab, setActiveTab] = useState<EActivityFeedTab>(EActivityFeedTab.EXPLORE as EActivityFeedTab);

	useEffect(() => {
		dispatch(setNetwork(network));
	}, [network, dispatch]);
	if (error) return <ErrorState errorMessage={error} />;

	return (
		<>
			<SEOHead
				title='Activity Feed'
				desc={`Join the future of blockchain with ${network}'s revolutionary governance system on Polkassembly`}
				network={network}
			/>
			<div className='w-full'>
				<div className='flex w-full justify-between lg:mt-3 xl:items-center'>
					<div className='flex flex-col lg:flex-row  xl:h-12 xl:gap-2'>
						<div>
							<h1 className='mx-2 text-xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high lg:mt-3 lg:text-2xl'>{t('activity_feed')}</h1>
						</div>
						<ActivityFeeToggleButton
							activeTab={activeTab}
							setActiveTab={setActiveTab}
						/>
					</div>
					<div className='flex flex-col items-end gap-2 lg:flex-row xl:mr-[6px] xl:justify-end'>
						<ProposalActionButtons isUsedInHomePage={true} />
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 xl:flex-row'>
					<div className='mx-1 mt-[26px] flex-grow'>
						<div className=''>
							{activeTab === EActivityFeedTab.EXPLORE ? <LatestActivity currentTab={EActivityFeedTab.EXPLORE} /> : <LatestActivity currentTab={EActivityFeedTab.FOLLOWING} />}
						</div>
					</div>
					<ActivityFeedSidebar networkSocialsData={networkSocialsData || { data: null, error: '', status: 500 }} />
				</div>
			</div>
		</>
	);
};

export default styled(ActivityFeed)`
	.docsbot-wrapper {
		z-index: 1 !important;
		margin-left: 250px;
		pointer-events: none !important;
	}
	.floating-button {
		display: none !important;
	}
	.docsbot-chat-inner-container {
		z-index: 1 !important;
		margin-right: 250px !important;
		pointer-events: none !important;
	}
	.ant-float-btn-group-circle {
		display: none !important;
	}
`;
