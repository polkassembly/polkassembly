// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useSelector } from 'react-redux';
import { TAppState } from './store';
// import { IModalStore } from './modal/@types';
import { INetworkStore } from './network/@types';
// import { IUserDetailsStore } from './userDetails/@types';

const useNetworkSelector = () => {
	return useSelector<TAppState, INetworkStore>((state) => state?.network);
};

// const useUserDetailsSelector = () => {
// return useSelector<TAppState, IUserDetailsStore>((state) => state.userDetails);
// };

export { useNetworkSelector };
