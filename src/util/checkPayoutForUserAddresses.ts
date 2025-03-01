// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { IPayout } from '~src/types';
import { convertAnyHexToASCII } from './decodingOnChainInfo';
import blockToSeconds from './blockToSeconds';
import getEncodedAddress from './getEncodedAddress';
import isMultiassetSupportedNetwork from './isMultiassetSupportedNetwork';

interface Args {
	api: ApiPromise | null;
	apiReady: boolean;
	network: string;
	currentBlockNumber: number;
}

const checkPayoutForUserAddresses = async ({ api, apiReady, network, currentBlockNumber }: Args): Promise<IPayout[]> => {
	const data: IPayout[] = [];

	if (!api || !apiReady || !network || !isMultiassetSupportedNetwork(network)) return data;

	const values = await api?.query?.treasury?.spends?.entries();
	if (!values) return [];
	values?.map((value) => {
		const payoutIndex = Number((value?.[0]?.toHuman() as any)?.[0]);
		const payoutData = convertAnyHexToASCII(value?.[1]?.toHuman(), network);
		const beneficiary =
			convertAnyHexToASCII(payoutData?.beneficiary?.V4?.interior?.X1?.[0]?.AccountId32?.id || payoutData?.beneficiary?.V3?.interior?.X1?.AccountId32?.id, network) || '';
		const startedAt = Number(payoutData?.validFrom?.split(',')?.join(''));

		if (startedAt <= currentBlockNumber && payoutData.status == 'Pending') {
			const res: IPayout = {
				amount: payoutData.amount.split(',').join(''),
				beneficiary: getEncodedAddress(beneficiary, network) || '',
				expireAt: blockToSeconds(network, Number(payoutData?.expireAt?.split(',')?.join('')), currentBlockNumber) || '',
				generalIndex:
					(payoutData?.assetKind?.V4?.assetId?.interior?.X2?.[1]?.GeneralIndex || payoutData?.assetKind?.V3?.assetId?.Concrete.interior?.X2?.[1]?.GeneralIndex || '')
						.split(',')
						?.join('') || '',
				payoutIndex: payoutIndex,
				startedAt: blockToSeconds(network, startedAt, currentBlockNumber) || '',
				status: payoutData.status
			};
			data.push(res);
		}
	});
	console.log('data', data);
	return data.filter((item) => typeof item?.payoutIndex == 'number');
};
export default checkPayoutForUserAddresses;
