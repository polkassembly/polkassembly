// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubscanAPIResponseType } from '~src/auth/types';
import nextApiClientFetch from './nextApiClientFetch';

export const getOnChainAddressDetails = async (address: string | string[] | undefined) => {
	try {
		const { data, error } = await nextApiClientFetch<SubscanAPIResponseType>('api/v1/subscanApi', {
			body: {
				key: address,
				row: 1
			},
			url: '/api/v2/scan/search'
		});
		if (error || !data) {
			console.log('error fetching events : ', error);
		}
		if (data) {
			return data;
		}
	} catch (error) {
		return error;
	}
};
