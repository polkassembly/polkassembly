// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';

const getAmbassadorXcmTx = (callData: string, api: ApiPromise): SubmittableExtrinsic<'promise'> => {
	const xcmCall = api?.tx.xcmPallet.send(
		{
			V4: {
				interior: {
					X1: [{ Parachain: '1001' }]
				},
				parenets: 0
			}
		},
		{
			V4: [
				{
					UnpaidExecution: {
						checkOrigin: null,
						weightLimit: 'Unlimited'
					}
				},
				{
					Transact: {
						call: {
							encoded: callData
						},
						originKind: 'Xcm',
						requireWeightAtMost: {
							proofSize: '250000',
							refTime: '4000000000'
						}
					}
				}
			]
		}
	);
	return xcmCall;
};

export default getAmbassadorXcmTx;
