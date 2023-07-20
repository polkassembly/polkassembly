// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useContext } from 'react';

import { ApiContext } from './ApiContext';
import { ModalContext } from './ModalContext';
import { NetworkContext } from './NetworkContext';
import { PostDataContext } from './PostDataContext';
import { UserDetailsContext } from './UserDetailsContext';

const useModalContext = () => {
	return useContext(ModalContext);
};

const useUserDetailsContext = () => {
	return useContext(UserDetailsContext);
};

const useApiContext = () => {
	return useContext(ApiContext);
};

const useNetworkContext = () => {
	return useContext(NetworkContext);
};

function usePostDataContext() {
	return useContext(PostDataContext);
}

export {
	useModalContext,
	useUserDetailsContext,
	useApiContext,
	useNetworkContext,
	usePostDataContext,
};
