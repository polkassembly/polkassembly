// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';

export async function getKiltDidName(
	api: ApiPromise,
	lookupAccountAddress: string,
): Promise<string | undefined> {
	const didDetails = (await api.call.did.queryByAccount({
		AccountId32: lookupAccountAddress,
	})) as any;

	if (didDetails.isNone) {
		return undefined;
	}

	const { w3n } = didDetails.unwrap();

	if (w3n.isNone) {
		return undefined;
	}

	return w3n.unwrap().toHuman();
}
