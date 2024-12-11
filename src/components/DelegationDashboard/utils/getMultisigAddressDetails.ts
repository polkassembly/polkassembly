// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import nextApiClientFetch from '~src/util/nextApiClientFetch';

export const getMultisigAddressDetails = async (address: string) => {
	const { data: addressDetail, error } = await nextApiClientFetch<any>('api/v1/getOnChainAddressData', { address });
	if (error) {
		console.log(error);
	}
	return addressDetail?.account?.multisig;
};
