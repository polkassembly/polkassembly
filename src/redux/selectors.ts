// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useSelector } from 'react-redux';
import { TAppState } from './store';
import { INetworkStore } from './network/@types';
import { IUserDetailsStore } from './userDetails/@types';
import { IUnlockTokenskDataStore } from './tokenUnlocksData/@types';
import { ICurrentTokenPriceStore } from './currentTokenPrice/@types';
import { ICurvesInformationStore } from './curvesInformation/@types';
import { ITippingStore } from './Tipping/@types';

const useNetworkSelector = () => {
	return useSelector<TAppState, INetworkStore>((state) => state?.network);
};

const useUserDetailsSelector = () => {
	return useSelector<TAppState, IUserDetailsStore>((state) => state.userDetails);
};

const useUserUnlockTokensDataSelector = () => {
	return useSelector<TAppState, IUnlockTokenskDataStore>((state) => state.userUnlockTokensData);
};
const useCurrentTokenDataSelector = () => {
	return useSelector<TAppState, ICurrentTokenPriceStore>((state) => state.currentTokenPrice);
};
const useCurvesInformationSelector = () => {
	return useSelector<TAppState, ICurvesInformationStore>((state) => state.curvesInformation);
};
const useTippingDataSelector = () => {
	return useSelector<TAppState, ITippingStore>((state) => state.tipping);
};

export { useNetworkSelector, useUserDetailsSelector, useUserUnlockTokensDataSelector, useCurrentTokenDataSelector, useCurvesInformationSelector, useTippingDataSelector };
