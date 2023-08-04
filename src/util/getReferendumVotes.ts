// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';
import { subscanApiHeaders } from '~src/global/apiHeaders';

interface IReturnResponse {
  data?: null | any,
  error?: null| string;
}

/**
 * get referendum votes from subscan
 * @param {string} network - polkadot network name
 * @param {number} onchainId - referendum onchain id
 * @returns {IReturnResponse} - returns data or error in an object
 **/
export default async function getReferendumVotes(network:string, onchainId:number | string):Promise<IReturnResponse> {
	const returnResponse:IReturnResponse = {
		data: null,
		error: null
	} ;

	try {
		const response = await fetch(`${chainProperties[network]?.externalLinks}/api/scan/democracy/referendum`, {
			body: JSON.stringify({
				referendum_index: Number(onchainId)
			}),
			headers: subscanApiHeaders,
			method: 'POST'
		});

		if (response.ok) {
			const resJSON = await response.json();

			if(resJSON?.data?.info) throw new Error('Vote data unavailable');

			returnResponse.data = resJSON?.data?.info;
		}else{
			throw new Error('Vote data unavailable');
		}
	} catch (error) {
		returnResponse.error = error || 'Vote data unavailable.';
	}

	return returnResponse;
}