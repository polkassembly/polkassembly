// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import NotificationsContent from '~src/components/InAppNotification/NotificationsContent';
import { CHANNEL } from '~src/components/Settings/Notifications/NotificationChannels';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { AVAILABLE_NETWORK } from '~src/util/notificationsAvailableChains';

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const translations = await serverSideTranslations(locale || '', ['common']);
	if (!AVAILABLE_NETWORK.includes(network)) {
		return {
			props: {},
			redirect: {
				destination: '/'
			}
		};
	}

	return { props: { network, ...translations } };
};

interface Props {
	network: string;
}

const InAppNotifications: FC<Props> = ({ network }) => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const { networkPreferences, id: userId } = useUserDetailsSelector();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!networkPreferences.channelPreferences?.[CHANNEL.IN_APP]?.enabled) {
		return (
			<div className='flex flex-col gap-8 rounded-xl bg-white px-12 py-10 dark:bg-section-dark-overlay'>
				<div className='flex items-center gap-2 text-2xl font-semibold text-bodyBlue dark:text-white'>
					<Image
						src={'/assets/icons/notification-bell-default.svg'}
						height={28}
						width={28}
						alt='notific...'
						className={theme === 'dark' ? 'dark-icons' : ''}
					/>
					{t('notifications')}
				</div>
				{!userId ? (
					<div className='flex items-center text-base'>
						{t('please')}
						<Link
							href={'/login'}
							className='mx-1 text-pink_primary dark:to-blue-dark-helper'
						>
							{t('login')}
						</Link>
						{t('to_use_notifications')}.
					</div>
				) : (
					<div className='flex items-center text-base'>
						{t('please_enable_notifications_via')}{' '}
						<Link
							href={'/settings?tab=notifications'}
							className='mx-1 text-pink_primary dark:to-blue-dark-helper'
						>
							{t('settings')}
						</Link>{' '}
						{t('page')} .
					</div>
				)}
			</div>
		);
	}

	return (
		<>
			<SEOHead
				title='Notifications'
				desc=''
				network={network}
			/>
			<NotificationsContent inPage />
		</>
	);
};

export default InAppNotifications;
