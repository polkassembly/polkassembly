// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';

import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import fetchSubsquid from '~src/util/fetchSubsquid';
import {
	GET_NETWORK_TRACK_ACTIVE_PROPOSALS_COUNT,
	GOV1_NETWORK_ACTIVE_PROPOSALS_COUNT,
	POLYMESH_NETWORK_ACTIVE_PROPOSALS_COUNT,
	ZEITGEIST_NETWORK_ACTIVE_PROPOSALS_COUNT
} from '~src/queries';
import { IActiveProposalCount } from '~src/types';
import { isPolymesh } from '~src/util/isPolymeshNetwork';

export const getNetworkTrackActiveProposalsCount = async ({ network }: { network: string }) => {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (isOpenGovSupported(network)) {
			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_NETWORK_TRACK_ACTIVE_PROPOSALS_COUNT
			});

			const proposals = subsquidRes?.['data']?.proposals || [];
			let proposalsCount: { [key: string]: number } = {};

			proposals?.map((proposal: { trackNumber: number }) => {
				if (proposalsCount?.[proposal?.trackNumber] === undefined) {
					proposalsCount[proposal?.trackNumber] = 1;
				} else {
					proposalsCount[proposal?.trackNumber] += 1;
				}
			});
			proposalsCount = {
				...proposalsCount,
				allCount: subsquidRes?.['data']?.all?.totalCount || 0,
				bountiesCount: subsquidRes?.['data']?.bountiesCount?.totalCount || 0,
				childBountiesCount: subsquidRes?.['data']?.childBountiesCount?.totalCount || 0
			};

			return {
				data: proposalsCount,
				error: null,
				status: 200
			};
		} else {
			let query = GOV1_NETWORK_ACTIVE_PROPOSALS_COUNT;
			if (network === 'zeitgeist') {
				query = ZEITGEIST_NETWORK_ACTIVE_PROPOSALS_COUNT;
			}
			if (isPolymesh(network)) {
				query = POLYMESH_NETWORK_ACTIVE_PROPOSALS_COUNT;
			}
			const subsquidRes = await fetchSubsquid({
				network,
				query
			});
			const data = subsquidRes?.['data'];
			let proposalsCount: IActiveProposalCount;
			if (isPolymesh(network)) {
				proposalsCount = {
					communityPipsCount: data?.communityPips?.totalCount || 0,
					technicalPipsCount: data?.technicalPips?.totalCount || 0,
					upgradePipsCount: data?.upgradePips?.totalCount || 0
				};
			} else {
				proposalsCount = {
					councilMotionsCount: data?.councilMotions?.totalCount || 0,
					democracyProposalsCount: data?.democracyProposals?.totalCount || 0,
					referendumsCount: data?.referendums?.totalCount || 0,
					techCommetteeProposalsCount: data?.techCommitteeProposals?.totalCount || 0,
					tipsCount: data?.tips?.totalCount || 0,
					treasuryProposalsCount: data?.treasuryProposals?.totalCount || 0
				};
				if (network === 'zeitgeist') {
					proposalsCount = { ...proposalsCount, advisoryCommitteeMotionsCount: data?.advisoryCommitteeMotions?.totalCount || 0 };
				} else {
					proposalsCount = {
						...proposalsCount,
						bountiesCount: data?.bounties?.totalCount || 0,
						childBountiesCount: data?.childBounties?.totalCount || 0
					};
				}
			}
			return {
				data: proposalsCount,
				error: null,
				status: 200
			};
		}
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<{ [key: string]: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { data, error, status } = await getNetworkTrackActiveProposalsCount({
		network
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
