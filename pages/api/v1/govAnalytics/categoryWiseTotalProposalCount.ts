// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { GET_TOTAL_CATEGORY_PROPOSALS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { network as AllNetworks } from '~src/global/networkConstants';
import messages from '~src/auth/utils/messages';
import { IGetStatusWiseProposalCount } from '~src/components/GovAnalytics/types';

const handler: NextApiHandler<IGetStatusWiseProposalCount | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	try {
		const network = String(req.headers['x-network']);
		if (!network || !Object.values(AllNetworks).includes(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const { categoryIds } = req.body;
		const promises = [
			fetchSubsquid({
				network: network,
				query: GET_TOTAL_CATEGORY_PROPOSALS,
				variables: { Indexes: categoryIds?.Treasury }
			}),
			fetchSubsquid({
				network: network,
				query: GET_TOTAL_CATEGORY_PROPOSALS,
				variables: { Indexes: categoryIds?.Governance }
			}),
			fetchSubsquid({
				network: network,
				query: GET_TOTAL_CATEGORY_PROPOSALS,
				variables: { Indexes: categoryIds?.Whitelist }
			}),
			fetchSubsquid({
				network: network,
				query: GET_TOTAL_CATEGORY_PROPOSALS,
				variables: { Indexes: categoryIds?.Main }
			})
		];

		const results = await Promise.allSettled(promises);
		const [TreasuryRes, GovernanceRes, WhiteListRes, MainRes] = results;

		const totalProposalByCategory = {
			governance: GovernanceRes.status === 'fulfilled' ? GovernanceRes.value?.data?.count?.totalCount : null,
			main: MainRes.status === 'fulfilled' ? MainRes.value?.data?.count?.totalCount : null,
			treasury: TreasuryRes.status === 'fulfilled' ? TreasuryRes.value?.data?.count?.totalCount : null,
			whiteList: WhiteListRes.status === 'fulfilled' ? WhiteListRes.value?.data?.count?.totalCount : null
		};

		return res.status(200).json({ categoryCounts: totalProposalByCategory });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
