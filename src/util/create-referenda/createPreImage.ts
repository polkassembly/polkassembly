// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';

// of the Apache-2.0 license. See the LICENSE file for details.

interface IPreimage {
	encodedProposal: HexString | null;
	notePreimageTx: SubmittableExtrinsic<'promise'>;
	preimageHash: string;
	preimageLength: number;
}
export const createPreImage = (api: ApiPromise, proposal: SubmittableExtrinsic<'promise'>): IPreimage => {
	const encodedProposal: HexString = proposal?.method.toHex();
	const preimageHash = blake2AsHex(encodedProposal);
	const preimageLength: number = Math.ceil((encodedProposal?.length - 2) / 2);
	const notePreimageTx: SubmittableExtrinsic<'promise'> = api.tx.preimage.notePreimage(encodedProposal);

	return {
		encodedProposal,
		notePreimageTx,
		preimageHash,
		preimageLength
	};
};
