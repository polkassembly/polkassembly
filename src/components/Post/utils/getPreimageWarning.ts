// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { isString, isU8a, objectSpread, u8aToHex } from '@polkadot/util';
import BN from 'bn.js';

interface Args {
	api: ApiPromise;
	apiReady: boolean;
	preimageHash: string;
}

const BN_ZERO = new BN(0);

function getParameterType(api: ApiPromise) {
	if (api?.query.preimage && api?.query.preimage.preimageFor && api?.query.preimage.preimageFor.creator.meta.type.isMap) {
		const { type } = api.registry.lookup.getTypeDef(api.query.preimage.preimageFor.creator.meta.type.asMap.key);

		if (type === 'H256') {
			return 'hash';
		} else if (type === '(H256,u32)') {
			return 'hashAndLen';
		} else {
			// we are clueless :()
		}
	}

	return 'unknown';
}

function getPreimageHash(api: ApiPromise, hash: any) {
	let inlineData;
	let referendaHash;

	if (isString(hash)) {
		referendaHash = hash;
	} else if (isU8a(hash)) {
		referendaHash = (hash as any).toHex();
	} else {
		const boundedHash = hash;

		if (boundedHash.isInline) {
			inlineData = boundedHash.asInline.toU8a(true);
			referendaHash = u8aToHex(api?.registry.hash(inlineData));
		} else if (hash.isLegacy) {
			referendaHash = hash.asLegacy.hash_.toHex();
		} else if (hash.isLookup) {
			referendaHash = hash.asLookup.hash_.toHex();
		} else {
			console.error(`FrameSupportPreimagesBounded type ${hash.type} is a unhandled type`);
		}
	}

	return {
		inlineData,
		referendaHash,
		resultPreimageHash: referendaHash && {
			count: 0,
			isCompleted: false,
			isHashParam: getParameterType(api) === 'hash',
			referendaHash,
			referendaLength: inlineData && new BN(inlineData.length),
			registry: api?.registry,
			status: null
		},
		status: referendaHash
	};
}

function getTicketWithAmountAndProposer(ticket: any[]) {
	return ticket
		? {
				amount: ticket[1],
				who: ticket[0].toString()
		  }
		: undefined;
}

function getParamInBytes(interimResult: any, optStatus: any) {
	const result: any = objectSpread({}, interimResult, {
		status: optStatus.unwrapOr(null)
	});

	if (result.status) {
		if (result.status.isRequested) {
			const asRequested = result.status.asRequested;
			if (!(asRequested instanceof Option)) {
				const { count, maybeTicket, maybeLen } = asRequested;
				result.count = count.toNumber();
				result.ticket = getTicketWithAmountAndProposer(maybeTicket.unwrapOr(null));
				result.referendaLength = maybeLen.unwrapOr(BN_ZERO);
				result.statusName = 'requested';
			}
		} else if (result.status.isUnrequested) {
			const asUnrequested = result.status.asUnrequested;

			if (asUnrequested instanceof Option) {
				result.ticket = getTicketWithAmountAndProposer(
					// old-style conversion
					(asUnrequested as any).unwrapOr(null)
				);
			} else {
				const { ticket, len } = result.status.asUnrequested.toJSON();

				result.ticket = getTicketWithAmountAndProposer(ticket);
				result.referendaLength = len;
				result.statusName = 'unrequested';
			}
		} else {
			console.error(`PalletPreimageRequestStatus type: ${result.status.type} is unhandled type`);
		}
	}

	return {
		paramsBytes: result.isHashParam ? [result.referendaHash] : [[result.referendaHash, result.referendaLength || BN_ZERO]],
		resultPreimageFor: result
	};
}

function getResult(optBytes: any) {
	const callUnwrapData = isU8a(optBytes) ? optBytes : optBytes.unwrapOr(null);

	let preimageWarning = null;

	if (!callUnwrapData) {
		preimageWarning = 'No preimage found';
	}

	return {
		preimageWarning
	};
}

const getPreimageWarning = async ({ api, apiReady, preimageHash }: Args) => {
	if (!api || !apiReady || !preimageHash) return;
	const { inlineData, status, resultPreimageHash } = getPreimageHash(api, preimageHash);
	const optStatus = !inlineData && status && (await api?.query?.preimage?.requestStatusFor(status));
	const { paramsBytes = null, resultPreimageFor = null } = resultPreimageHash && optStatus ? getParamInBytes(resultPreimageHash, optStatus) : {};
	const optBytes = paramsBytes && (await api?.query.preimage?.preimageFor(...paramsBytes));

	const result = resultPreimageFor
		? optBytes
			? getResult(optBytes)
			: resultPreimageFor
		: resultPreimageHash
		? inlineData
			? getResult(inlineData)
			: resultPreimageHash
		: undefined;

	return result;
};

export default getPreimageWarning;
