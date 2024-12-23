// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSubscanData } from 'pages/api/v1/subscanApi';

export const getOnChainAddressDetails = async (address: string | string[] | undefined, network: string) => {
	try {
		const data = await getSubscanData('/api/v2/scan/search', network, {
			key: address,
			row: 1
		});
		if (data.message === 'Success') {
			return data;
		} else {
			console.log(data.message);
		}
	} catch (error) {
		return error;
	}
};
