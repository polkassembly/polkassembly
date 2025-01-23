// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IBeneficiary } from '~src/types';
import { containsBinaryData, convertAnyHexToASCII } from './decodingOnChainInfo';
import BN from 'bn.js';

interface IRes {
	beneficiaries: IBeneficiary[];
	requested: string | undefined;
	remark?: string;
	assetId?: any | null;
}
interface IMethodHandlers {
	[key: string]: (args: any, network: string) => IRes;
}

const ZERO_BN = new BN(0);

//extract general index from args;
const extractGeneralIndex = (call: any) => {
	const interiorAssetId = call?.assetKind?.assetId || null;
	if (!interiorAssetId) return null;
	const assetCall = interiorAssetId?.value?.interior?.value || interiorAssetId?.interior?.value;
	return assetCall?.find((item: any) => item.__kind === 'GeneralIndex')?.value || null;
};

//handle single call with general index;
const handleSpendCall = (call: any, network: string) => {
	const beneficiaries: IBeneficiary[] = [];
	const requested = new BN(call?.amount || 0)?.toString();
	const assetId = extractGeneralIndex(call) || null;

	const beneficiary = {
		address: convertAnyHexToASCII(((call?.beneficiary as any)?.value?.interior?.value?.id as string) || (call?.beneficiary as any)?.value?.interior?.value?.[0]?.id, network) || '',
		amount: call?.amount,
		genralIndex: assetId || null
	};

	beneficiaries.push(beneficiary);
	return { assetId, beneficiaries, requested };
};

//handle single call without general index;
const handleSpenLocalCall = (call: any, network: string) => {
	const beneficiaries: IBeneficiary[] = [];

	const requested = new BN(call.amount)?.toString();

	if (call.beneficiary) {
		beneficiaries.push({
			address:
				convertAnyHexToASCII((call?.beneficiary?.value as string) || (call.beneficiary as string), network) ||
				(call?.beneficiary?.value as string) ||
				(call.beneficiary as string) ||
				'',
			amount: call.amount || '0',
			genralIndex: null
		});
	}
	return { assetId: null, beneficiaries, requested };
};

//handle multiple call case
const handleBatchCall = (args: any, network: string) => {
	if (!args) return { beneficiaries: [], remark: '', requested: '0' };
	let remark = '';
	let requestedAmt = ZERO_BN;
	const allBeneficiaries: IBeneficiary[] = [];

	args?.calls.forEach(({ value: call }: { value: any }) => {
		if (call && call.remark && typeof call.remark === 'string' && !containsBinaryData(call.remark)) {
			remark += call.remark + '\n';
		}
		if (call && call.__kind) {
			if (call?.__kind == 'spend_local') {
				const { requested, beneficiaries } = handleSpenLocalCall(call, network);
				requestedAmt = requestedAmt?.add(new BN(requested));
				allBeneficiaries.push(...(beneficiaries || []));
			}

			if (call?.__kind == 'spend') {
				const { beneficiaries } = handleSpendCall(call, network);
				allBeneficiaries.push(...(beneficiaries || []));
			}
		}
	});

	return { beneficiaries: allBeneficiaries || [], remark, requested: requestedAmt.toString() };
};

const preimageToBeneficiaries = (onchainCall: any, network: string): IRes => {
	const methodHandlers: IMethodHandlers = {
		batch: handleBatchCall,
		batch_all: handleBatchCall,
		spend: handleSpendCall,
		spend_local: handleSpenLocalCall
	};

	const method = onchainCall?.method || null;
	if (!onchainCall?.args || !method || !methodHandlers?.[method]) {
		return { assetId: null, beneficiaries: [], remark: '', requested: undefined };
	}

	const data = methodHandlers?.[method]?.(onchainCall?.args, network);

	return { ...data, assetId: method == 'spend' ? data?.assetId || null : null };
};

export default preimageToBeneficiaries;
