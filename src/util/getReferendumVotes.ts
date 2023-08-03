// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import _ from 'lodash';
import { chainProperties } from '~src/global/networkConstants';
import { subscanApiHeaders } from '~src/global/apiHeaders';

interface IReturnResponse {
  voteInfoData?: null | any,
  voteInfoError?: null| string;
}

const getReferendumVotes = async(network:string, onchainId:number | string):Promise<IReturnResponse> => {
	const returnResponse:IReturnResponse = {
		voteInfoData: null,
		voteInfoError: null
	} ;

	try {
		const response = await fetch(`${chainProperties[network]?.externalLinks}/api/scan/democracy/referendum`,
			{
				body: JSON.stringify({
					referendum_index: Number(onchainId)
				}),
				headers: subscanApiHeaders,
				method: 'POST'
			}
		);
		if (response.ok) {
			const data = await response.json();
			returnResponse.voteInfoData = data;

		}else{
			returnResponse.voteInfoError = 'no data';
		}
	} catch (error) {

		returnResponse.voteInfoError = error || 'no data';

	}
	return returnResponse;
};

const debounceGetReferendumVotesFn = _.debounce(getReferendumVotes, 500);

export default debounceGetReferendumVotesFn;
