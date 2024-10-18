// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { convertAnyHexToASCII } from './decodingOnChainInfo';

interface Args {
	preimageArgs: any;
	network: string;
}

interface IResponse {
	requestedAmt: BN;
	assetId: string | null;
}
const getBeneficiaryDetails = ({ preimageArgs, network }: Args): IResponse => {
	let requested = new BN(0);
	let assetId: null | string = null;

	if (preimageArgs) {
		if (
			preimageArgs?.assetKind?.assetId?.value?.interior ||
			preimageArgs?.assetKind?.assetId?.interior?.value ||
			preimageArgs?.calls?.map((item: any) => item?.value?.assetKind?.assetId?.interior?.value || item?.value?.assetKind?.assetId?.value?.interior)?.length
		) {
			const call =
				preimageArgs?.assetKind?.assetId?.value?.interior?.value ||
				preimageArgs?.assetKind?.assetId?.interior?.value ||
				preimageArgs?.calls?.map((item: any) => item?.value?.assetKind?.assetId?.interior?.value || item?.value?.assetKind?.assetId?.value?.interior)?.[0]?.value;
			assetId = (call?.length ? call?.find((item: { value: number; __kind: string }) => item?.__kind == 'GeneralIndex')?.value : null) || null;
		}

		preimageArgs = convertAnyHexToASCII(preimageArgs, network);
		if (preimageArgs?.amount) {
			requested = preimageArgs.amount;
		} else {
			const calls = preimageArgs.calls;

			if (calls && Array.isArray(calls) && calls.length > 0) {
				calls.forEach((call) => {
					if (call && call.amount) {
						requested = new BN(call.amount).add(requested);
					}
					if (call && call?.value?.amount) {
						requested = new BN(call?.value?.amount).add(requested);
					}
				});
			}
		}
	}

	return {
		assetId,
		requestedAmt: requested
	};
};

export default getBeneficiaryDetails;
