// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPayout } from '~src/types';

export interface IClaimPayoutStore {
	claimPayoutAvailable: boolean;
	payouts: IPayout[];
}
