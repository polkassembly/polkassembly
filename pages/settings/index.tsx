// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Col, Tabs } from 'antd';
import { GetServerSideProps } from 'next';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Notifications from '~src/components/Settings/Notifications';
import UserAccount from '~src/components/Settings/UserAccount';
import SEOHead from '~src/global/SEOHead';
import Tracker from '~src/components/Tracker/Tracker';
import { useRouter } from 'next/router';
import { PageLink } from '~src/global/post_categories';
import BackToListingView from '~src/ui-components/BackToListingView';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import NotificationUpgradingState from '~src/components/Settings/Notifications/NotificationChannels/NotificationUpgradingState';
import { AVAILABLE_NETWORK } from '~src/util/notificationsAvailableChains';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';

interface Props {
	network: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const Settings: FC<Props> = (props) => {
	const { network } = useNetworkSelector();
	const dispatch = useDispatch();
	const router = useRouter();
	const tab = router.query?.tab as string;
	const { id } = useUserDetailsSelector();
	const [searchQuery, setSearchQuery] = useState<string>('');

	const handleTabClick = (key: string) => {
		router.push(`/settings?tab=${key}`);
	};

	const tabItems = useMemo(
		() => [
			{ children: <UserAccount network={network} />, key: 'account', label: 'Account' },
			{ children: AVAILABLE_NETWORK.includes(network) ? <Notifications network={network} /> : <NotificationUpgradingState />, key: 'notifications', label: 'Notifications' },
			{ children: <Tracker network={network} />, key: 'tracker', label: 'Tracker' }
		],
		[network]
	);

	useEffect(() => {
		if (router.isReady) {
			if (!id) {
				router.push('/login');
			}
			if (!tabItems.map((t) => t.key).includes(tab)) {
				router.replace('/settings?tab=account');
				setSearchQuery('account');
				return;
			}
			setSearchQuery(tab as string);
		}
	}, [id, router, router.isReady, searchQuery, tab, tabItems]);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Settings'
				network={network}
			/>
			{Object.keys(networkTrackInfo).includes(network) ? (
				<BackToListingView
					postCategory={PageLink.OVERVIEW_GOV_2}
					trackName='Overview'
				/>
			) : (
				<BackToListingView
					postCategory={PageLink.OVERVIEW}
					trackName='Overview'
				/>
			)}

			<Col className='h-full w-full'>
				<div className='mt-6 w-full rounded-md bg-white p-8 shadow-md dark:bg-section-dark-overlay'>
					<h3 className='text-xl font-semibold leading-7 tracking-wide text-sidebarBlue'>Settings</h3>
					<Tabs
						className='ant-tabs-tab-bg-white font-medium text-sidebarBlue'
						type='card'
						defaultActiveKey={tab || 'account'}
						onTabClick={handleTabClick}
						items={tabItems}
					/>
				</div>
			</Col>
		</>
	);
};

export default Settings;
