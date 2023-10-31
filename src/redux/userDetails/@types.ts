// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import WalletConnectProvider from '@walletconnect/web3-provider';
import { INetworkPreferences, Wallet } from '~src/types';
export interface IUserDetailsStore {
	id?: number | null;
	picture?: string | null;
	username?: string | null;
	email?: string | null;
	email_verified?: boolean | null;
	addresses?: string[] | null;
	allowed_roles?: string[] | null;
	defaultAddress?: string | null;
	web3signup?: boolean | null;
	walletConnectProvider: WalletConnectProvider | null;
	loginWallet: Wallet | null;
	delegationDashboardAddress: string;
	loginAddress: string;
	multisigAssociatedAddress?: string;
	networkPreferences: INetworkPreferences;
	primaryNetwork: string;
	is2FAEnabled?: boolean;
	currentTokenPrice: string;
}
