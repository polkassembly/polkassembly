// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

export interface IUnlockTokenskData {
	track: BN;
	endBlock: BN;
	locked: string;
	refId: BN;
	total: BN;
	loading?: boolean;
}
export interface IUnlockTokenskDataStore {
	address: string;
	data: {
		totalLockData: IUnlockTokenskData[];
		totalOngoingData: IUnlockTokenskData[];
		totalUnlockableData: IUnlockTokenskData[];
	};
}
