// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Action, ThunkAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, createTransform, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { networkStore } from './network';
import { userDetailsStore } from './userDetails';
import { userUnlockTokensDataStore } from './tokenUnlocksData';
import { currentTokenPriceStore } from './currentTokenPrice';
import { curvesInformationStore } from './curvesInformation';
import { tippingStore } from './tipping';
import { treasuryProposalStore } from './treasuryProposal';
import { IUserDetailsStore } from './userDetails/@types';
import { deleteLocalStorageToken, getLocalStorageToken } from '~src/services/auth.service';
import { isExpired } from 'react-jwt';
import { voteDataStore } from './voteData';
import { initialConnectAddressStore } from './initialConnectAddress';
import { gov1TreasuryProposalStore } from './gov1TreasuryProposal';
import { removeIdentityStore } from './removeIdentity';
import { trackLevelAnalyticsStore } from './trackLevelAnalytics';
import { onchainIdentityStore } from './onchainIdentity';
import { inAppNotificationsStore } from './inAppNotifications';
import { ambassadorSeedingStore } from './addAmbassadorSeeding';
import { useDispatch } from 'react-redux';
import { batchVoteStore } from './batchVoting';
import { ambassadorRemovalStore } from './removeAmbassador';
import { ambassadorReplacementStore } from './replaceAmbassador';
import { claimPayoutStore } from './claimProposalPayout';
import { assetsCurrentPriceStore } from './assetsCurrentPrices';
import { progressReportStore } from './progressReport';
import { globalStore } from './global';
import { childBountyCreationStore } from './childBountyCreation';

const userDetailsTransform = createTransform<IUserDetailsStore, IUserDetailsStore>(
	// transform state on its way to being serialized and persisted.
	(inboundState) => {
		const authToken = getLocalStorageToken();
		if (!authToken || (authToken && isExpired(authToken))) {
			deleteLocalStorageToken();
			return {
				addresses: [],
				allowed_roles: [],
				defaultAddress: '',
				delegationDashboardAddress: '',
				email: null,
				email_verified: false,
				id: null,
				is2FAEnabled: false,
				isUserOnchainVerified: false,
				loginAddress: '',
				loginWallet: null,
				multisigAssociatedAddress: '',
				networkPreferences: {
					channelPreferences: {},
					triggerPreferences: {}
				},
				picture: null,
				primaryNetwork: '',
				username: null,
				walletConnectProvider: null,
				web3signup: false
			};
		}

		// Selectively persist only certain parts of the state
		return {
			...inboundState
		};
	},
	// transform state being rehydrated
	(outboundState) => {
		const authToken = getLocalStorageToken();
		if (!authToken || (authToken && isExpired(authToken))) {
			deleteLocalStorageToken();
			return {
				addresses: [],
				allowed_roles: [],
				defaultAddress: '',
				delegationDashboardAddress: '',
				email: null,
				email_verified: false,
				id: null,
				is2FAEnabled: false,
				isUserOnchainVerified: false,
				loginAddress: '',
				loginWallet: null,
				multisigAssociatedAddress: '',
				networkPreferences: {
					channelPreferences: {},
					triggerPreferences: {}
				},
				picture: null,
				primaryNetwork: '',
				username: null,
				walletConnectProvider: null,
				web3signup: false
			};
		}
		// Return what you want rehydrated
		return outboundState;
	},
	// define which reducer this transform gets called for.
	{ whitelist: ['userDetails'] }
);

export const makeStore = () => {
	const isServer = typeof window === 'undefined';

	const rootReducer = combineReducers({
		[globalStore.name]: globalStore.reducer,
		[networkStore.name]: networkStore.reducer,
		[userDetailsStore.name]: userDetailsStore.reducer,
		[userUnlockTokensDataStore.name]: userUnlockTokensDataStore.reducer,
		[currentTokenPriceStore.name]: currentTokenPriceStore.reducer,
		[curvesInformationStore.name]: curvesInformationStore.reducer,
		[tippingStore.name]: tippingStore.reducer,
		[treasuryProposalStore.name]: treasuryProposalStore.reducer,
		[voteDataStore.name]: voteDataStore.reducer,
		[initialConnectAddressStore.name]: initialConnectAddressStore.reducer,
		[gov1TreasuryProposalStore.name]: gov1TreasuryProposalStore.reducer,
		[removeIdentityStore.name]: removeIdentityStore.reducer,
		[trackLevelAnalyticsStore.name]: trackLevelAnalyticsStore.reducer,
		[onchainIdentityStore.name]: onchainIdentityStore.reducer,
		[inAppNotificationsStore.name]: inAppNotificationsStore.reducer,
		[ambassadorSeedingStore.name]: ambassadorSeedingStore.reducer,
		[batchVoteStore.name]: batchVoteStore.reducer,
		[progressReportStore.name]: progressReportStore.reducer,
		[ambassadorRemovalStore.name]: ambassadorRemovalStore.reducer,
		[ambassadorReplacementStore.name]: ambassadorReplacementStore.reducer,
		[claimPayoutStore.name]: claimPayoutStore.reducer,
		[assetsCurrentPriceStore.name]: assetsCurrentPriceStore.reducer,
		[childBountyCreationStore.name]: childBountyCreationStore.reducer
	});

	if (isServer) {
		const store = configureStore({
			devTools: true,
			middleware: (getDefaultMiddleware) =>
				getDefaultMiddleware({
					immutableCheck: false,
					serializableCheck: false
				}),
			reducer: rootReducer
		});
		return store;
	} else {
		// we need it only on client side
		const persistConfig = {
			key: 'polkassembly',
			storage,
			transforms: [userDetailsTransform],
			whitelist: [
				'userDetails',
				'userUnlockTokensData',
				'currentTokenPrice',
				'tipping',
				'gov1TreasuryProposal',
				'addAmbassador',
				'ambassadorRemoval',
				'ambassadorReplacement',
				'claimPayout',
				'childBountyCreation'
			] // make sure it does not clash with server keys
		};
		const persistedReducer = persistReducer(persistConfig, rootReducer);
		const store = configureStore({
			devTools: process.env.NODE_ENV !== 'production',
			middleware: (getDefaultMiddleware) =>
				getDefaultMiddleware({
					immutableCheck: false,
					serializableCheck: {
						ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
					}
				}),
			reducer: persistedReducer
		});
		(store as any).__persistor = persistStore(store); // Nasty hack
		return store;
	}
};

export type TAppStore = ReturnType<typeof makeStore>;
export type TAppState = ReturnType<TAppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, TAppState, unknown, Action>;

export const wrapper = createWrapper<TAppStore>(makeStore);

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const store = makeStore();
