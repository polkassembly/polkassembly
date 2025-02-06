// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { IPreimage } from '~src/types';

export const createPreimage = (api: ApiPromise, proposal: SubmittableExtrinsic<'promise'>): IPreimage => {
	const encodedProposal: HexString = proposal?.method.toHex();
	const preimageHash = blake2AsHex(encodedProposal);
	const preimageLength = Math.ceil((encodedProposal?.length - 2) / 2);
	const notePreimageTx = api.tx.preimage.notePreimage(encodedProposal);

	return {
		encodedProposal,
		notePreimageTx,
		preimageHash,
		preimageLength
	};
};
