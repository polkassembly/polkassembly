// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useReducer, useState } from 'react';
import Parachain from './Parachain';
import Proposals from './Proposals';
import SubscribedPosts from './SubscribedPosts';
import Gov1Notification from './Gov1Notification';
import OpenGovNotification from './OpenGovNotification';
import NotificationChannels, { CHANNEL } from './NotificationChannels';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { PublicUser } from '~src/auth/types';
import Loader from '~src/ui-components/Loader';
import { notificationInitialState } from './Reducer/initState';
import { reducer } from './Reducer/reducer';
import { ACTIONS } from './Reducer/action';
import { INotificationObject } from './types';
import { networks } from './Parachain/utils';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { network as AllNetworks } from '~src/global/networkConstants';
import PipNotification from './PIP/Pip';
import { setUserDetailsState } from '~src/redux/userDetails';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
const getAllNetworks = (network: string) => {
	for (const category of Object.keys(networks)) {
		const chains = networks[category];
		const chainToUpdate = chains.find((chain: any) => chain.name === network);
		if (chainToUpdate) {
			chainToUpdate.selected = true;
			break;
		}
	}
	return networks;
};

export default function Notifications({ network }: { network: string }) {
	const currentUser = useUserDetailsSelector();
	const { id, networkPreferences, primaryNetwork } = currentUser;
	const reduxDispatch = useDispatch();

	const [notificationPreferences, dispatch] = useReducer(reducer, notificationInitialState(network));
	const [selectedNetwork, setSelectedNetwork] = useState<{
		[index: string]: Array<{ name: string; selected: boolean }>;
	}>(getAllNetworks(network));
	const [loading, setLoading] = useState(true);

	const handleCurrentNetworkNotifications = (obj: INotificationObject) => {
		reduxDispatch(
			setUserDetailsState({
				...currentUser,
				networkPreferences: {
					...currentUser.networkPreferences,
					triggerPreferences: {
						...currentUser.networkPreferences.triggerPreferences,
						[network]: obj
					}
				}
			})
		);
	};

	const getNotificationSettings = async (network: string) => {
		if (!network) {
			return;
		}
		try {
			const { data, error } = (await nextApiClientFetch('api/v1/auth/data/notificationSettings')) as { data: any; error: null | string };
			if (error) {
				throw new Error(error);
			}
			if (data?.notification_preferences?.channelPreferences) {
				reduxDispatch(
					setUserDetailsState({
						...currentUser,
						networkPreferences: {
							...currentUser.networkPreferences,
							channelPreferences: data?.notification_preferences?.channelPreferences
						}
					})
				);
			}
			if (data?.notification_preferences?.triggerPreferences) {
				reduxDispatch(
					setUserDetailsState({
						...currentUser,
						networkPreferences: {
							...currentUser.networkPreferences,
							triggerPreferences: data?.notification_preferences?.triggerPreferences
						}
					})
				);
				dispatch({
					payload: {
						data: data?.notification_preferences?.triggerPreferences?.[network],
						network
					},
					type: ACTIONS.GET_NOTIFICATION_OBJECT
				});
			}
			setLoading(false);
		} catch (e) {
			console.log(e);
		}
	};

	const getPrimaryNetwork = async () => {
		try {
			const { data, error } = (await nextApiClientFetch(`api/v1/auth/data/user?userId=${id}`)) as { data: PublicUser; error: null | string };
			if (error) {
				throw new Error(error);
			}
			if (data.primary_network) {
				reduxDispatch(
					setUserDetailsState({
						...currentUser,
						primaryNetwork: data.primary_network || ''
					})
				);
			} else {
				handleSetPrimaryNetwork(network);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetPrimaryNetwork = async (network: string) => {
		try {
			reduxDispatch(
				setUserDetailsState({
					...currentUser,
					primaryNetwork: network
				})
			);
			await nextApiClientFetch('api/v1/auth/actions/setPrimaryNetwork', { primary_network: network });
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetNetworkPreferences = async (networks: Array<string>) => {
		if (!networkPreferences?.triggerPreferences?.[network]) {
			return;
		}
		try {
			const { data, error } = (await nextApiClientFetch('api/v1/auth/actions/setNetworkPreferences', {
				network_preferences: networkPreferences.triggerPreferences[network],
				networks
			})) as { data: { message: string }; error: string | null };
			if (error || !data.message) {
				throw new Error(error || '');
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleCopyPrimaryNetworkNotification = async (selectedNetwork: Array<string>) => {
		try {
			const primarySettings = networkPreferences.triggerPreferences?.[primaryNetwork] || {};
			const { data, error } = (await nextApiClientFetch('api/v1/auth/actions/setNetworkPreferences', {
				network_preferences: primarySettings,
				networks: selectedNetwork
			})) as { data: { message: string }; error: string | null };
			if (error || !data.message) {
				throw new Error(error || '');
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleReset = async (channel: CHANNEL) => {
		try {
			reduxDispatch(
				setUserDetailsState({
					...currentUser,
					networkPreferences: {
						...currentUser.networkPreferences,
						channelPreferences: {
							...currentUser.networkPreferences.channelPreferences,
							[channel]: {}
						}
					}
				})
			);
			const { data, error } = (await nextApiClientFetch('api/v1/auth/actions/resetChannelNotification', {
				channel
			})) as { data: { message: string }; error: string | null };
			if (error || !data.message) {
				throw new Error(error || '');
			}

			return true;
		} catch (e) {
			console.log(e);
		}
	};

	const handleEnableDisabled = async (channel: CHANNEL, enabled = false) => {
		try {
			reduxDispatch(
				setUserDetailsState({
					...currentUser,
					networkPreferences: {
						...currentUser.networkPreferences,
						channelPreferences: {
							...currentUser.networkPreferences?.channelPreferences,
							[channel]: {
								...currentUser.networkPreferences?.channelPreferences?.channel,
								enabled: enabled
							}
						}
					}
				})
			);
			const { data, error } = (await nextApiClientFetch('api/v1/auth/actions/updateChannelNotification', {
				channel,
				enabled
			})) as { data: { message: string }; error: string | null };
			if (error || !data.message) {
				throw new Error(error || '');
			}

			return true;
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		console.log('enter');
		if (loading) {
			return;
		}
		const selectedNames: Array<string> = [];
		for (const category of Object.values(selectedNetwork)) {
			category.forEach((chain) => {
				if (chain.selected) selectedNames.push(chain.name);
			});
		}
		console.log(selectedNames);
		handleSetNetworkPreferences(selectedNames);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [networkPreferences.triggerPreferences]);

	useEffect(() => {
		getPrimaryNetwork().catch((e) => console.log(e));
		getNotificationSettings(network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return loading ? (
		<Loader />
	) : (
		<div className='flex flex-col gap-[24px] text-blue-light-high dark:text-blue-dark-high'>
			<NotificationChannels
				handleEnableDisabled={handleEnableDisabled}
				handleReset={handleReset}
			/>
			<Parachain
				primaryNetwork={primaryNetwork}
				onSetPrimaryNetwork={handleSetPrimaryNetwork}
				onSetNetworkPreferences={handleSetNetworkPreferences}
				onCopyPrimaryNetworkNotification={handleCopyPrimaryNetworkNotification}
				selectedNetwork={selectedNetwork}
				setSelectedNetwork={setSelectedNetwork}
			/>
			<Proposals
				userNotification={networkPreferences.triggerPreferences[network]}
				options={notificationPreferences.myProposal}
				dispatch={dispatch}
				onSetNotification={handleCurrentNetworkNotifications}
			/>
			<SubscribedPosts
				userNotification={networkPreferences.triggerPreferences[network]}
				options={notificationPreferences.subscribePost}
				dispatch={dispatch}
				onSetNotification={handleCurrentNetworkNotifications}
			/>
			{network !== AllNetworks.POLYMESH ? (
				<>
					<Gov1Notification
						userNotification={networkPreferences.triggerPreferences[network]}
						options={notificationPreferences.gov1Post}
						dispatch={dispatch}
						onSetNotification={handleCurrentNetworkNotifications}
					/>
					{Object.keys(networkTrackInfo).includes(network) && (
						<OpenGovNotification
							userNotification={networkPreferences.triggerPreferences[network]}
							options={notificationPreferences.openGov}
							dispatch={dispatch}
							onSetNotification={handleCurrentNetworkNotifications}
						/>
					)}
				</>
			) : (
				<PipNotification
					userNotification={networkPreferences.triggerPreferences[network]}
					options={notificationPreferences.pipNotification}
					dispatch={dispatch}
					onSetNotification={handleCurrentNetworkNotifications}
				/>
			)}
		</div>
	);
}
