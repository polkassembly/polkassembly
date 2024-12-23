// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { IOnChainIdentityStore } from './@types';
import { IIdentitySocials, IIdentityInfo } from '~src/components/OnchainIdentity/types';
import { Wallet } from '~src/types';

const initialState: IOnChainIdentityStore = {
	identityInfo: {
		alreadyVerified: false,
		displayName: '',
		email: '',
		isIdentitySet: false,
		legalName: '',
		twitter: '',
		web: '',
		discord: '',
		github: '',
		matrix: '',
		verifiedByPolkassembly: false
	},
	displayName: '',
	identityHash: '',
	isIdentityVerified: false,
	identityAddress: null,
	legalName: '',
	socials: { email: { value: '', verified: false }, matrix: { value: '', verified: false }, twitter: { value: '', verified: false }, web: { value: '', verified: false } },
	userId: null,
	wallet: null
};

export const onchainIdentityStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...(action as PayloadAction<any>).payload.onchainIdentity
			};
		});
	},
	initialState,
	name: 'onchainIdentity',
	reducers: {
		setOnchainDisplayName: (state, action: PayloadAction<string>) => {
			state.displayName = action.payload;
		},
		setOnchainLegalName: (state, action: PayloadAction<string>) => {
			state.legalName = action.payload;
		},
		setOnchainSocials: (state, action: PayloadAction<IIdentitySocials>) => {
			state.socials = action.payload;
		},
		setOnchainIdentityHash: (state, action: PayloadAction<string>) => {
			state.identityHash = action.payload;
		},
		setIsOnchainIdentityVerified: (state, action: PayloadAction<boolean>) => {
			state.isIdentityVerified = action.payload;
		},
		setOnchainIdentityInfo: (state, action: PayloadAction<IIdentityInfo>) => {
			state.identityInfo = action.payload;
		},
		setOnchainIdentityAddress: (state, action: PayloadAction<string>) => {
			state.identityAddress = action.payload;
		},
		setOnchainIdentityWallet: (state, action: PayloadAction<Wallet | null>) => {
			state.wallet = action.payload;
		},
		updateOnchainIdentityStore: (state, action: PayloadAction<IOnChainIdentityStore>) => {
			state.identityInfo = action.payload.identityInfo;
			state.displayName = action.payload.displayName;
			state.legalName = action.payload.legalName;
			state.identityHash = action.payload.identityHash;
			state.isIdentityVerified = action.payload.isIdentityVerified;
			state.socials = action.payload.socials;
			state.userId = action.payload.userId;
			state.identityAddress = action.payload.identityAddress;
			state.wallet = action.payload.wallet;
		}
	}
});
const onchainIdentityActions = onchainIdentityStore.actions;

const setOnchainDisplayName: any = (payload: string) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setOnchainDisplayName(payload));
	};
};

const setOnchainLegalName: any = (payload: string) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setOnchainLegalName(payload));
	};
};

const setOnchainSocials: any = (payload: IIdentitySocials) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setOnchainSocials(payload));
	};
};

const setOnchainIdentityHash: any = (payload: string) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setOnchainIdentityHash(payload));
	};
};

const setIsOnchainIdentityVerified: any = (payload: boolean) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setIsOnchainIdentityVerified(payload));
	};
};

const setOnchainIdentityInfo: any = (payload: IIdentityInfo) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setOnchainIdentityInfo(payload));
	};
};

const setOnchainIdentityAddress: any = (payload: string) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.setOnchainIdentityAddress(payload));
	};
};

const updateOnchainIdentityStore: any = (payload: IOnChainIdentityStore) => {
	return (dispatch: any) => {
		dispatch(onchainIdentityActions.updateOnchainIdentityStore(payload));
	};
};

export default onchainIdentityStore.reducer;

export {
	setOnchainSocials,
	onchainIdentityActions,
	setOnchainDisplayName,
	setOnchainLegalName,
	setOnchainIdentityHash,
	setIsOnchainIdentityVerified,
	setOnchainIdentityInfo,
	setOnchainIdentityAddress,
	updateOnchainIdentityStore
};
