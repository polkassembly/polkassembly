// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ACTIVE_DELEGATIONS_TO_OR_FROM_ADDRESS_FOR_TRACK } from '~src/queries';
import { ETrackDelegationStatus, IDelegation } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';

export interface ITrackDelegation {
	track: number
	activeProposals: number
	status: ETrackDelegationStatus
	recieved_delegation_count: number
	delegations: IDelegation[]
}

const getDelegationDashboardData = async (address: string, network: string) => {
	if(!address || !network) return [];

	const subsquidFetches: any[] = [];
	Object.values(networkTrackInfo[network]).map((trackInfo) => {
		subsquidFetches.push(
			fetchSubsquid({
				network,
				query: ACTIVE_DELEGATIONS_TO_OR_FROM_ADDRESS_FOR_TRACK,
				variables : {
					address: String(address),
					track_eq: trackInfo.trackId
				}
			})
		);
	});

	const subsquidResults = await Promise.allSettled(subsquidFetches);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const result: ITrackDelegation[] = [];

	for(const trackDelegationData of subsquidResults) {
		if (!trackDelegationData || trackDelegationData.status !== 'fulfilled') continue;
		const votingDelegationsArr = trackDelegationData.value.data.votingDelegations;

		const track = votingDelegationsArr?.length ? votingDelegationsArr[0].track : false;
		if(isNaN(track)) continue;

		const trackDelegation: ITrackDelegation = {
			activeProposals: trackDelegationData.value.data.proposalsConnection?.totalCount || 0,
			delegations: votingDelegationsArr,
			recieved_delegation_count: 0,
			status: ETrackDelegationStatus.Undelegated,
			track
		};

		// address has delegated to someone for this track
		if(votingDelegationsArr[0].from === address) {
			trackDelegation.status = ETrackDelegationStatus.Delegated;
		}else {
			// address has received delegation for this track
			trackDelegation.status = ETrackDelegationStatus.Received_Delegation;
			trackDelegation.recieved_delegation_count = votingDelegationsArr.length;
		}

		result.push(trackDelegation);
	}

	return result;
};

async function handler (req: NextApiRequest, res: NextApiResponse<ITrackDelegation[] | { error: string }>) {
	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const { address } = req.query;
	if(!address) return res.status(400).json({ error: 'Missing address in request query.' });

	const result = await getDelegationDashboardData(String(address), network);
	return res.status(200).json(result as ITrackDelegation[]);
}

export default withErrorHandling(handler);