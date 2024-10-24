// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { GET_ALL_BOUNTIES_WITHOUT_PAGINATION, GET_CURATOR_RECIVED_SENT_COUNT } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IPendingCuratorReq } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { firestore_db } from '~src/services/firebaseInit';

const handler: NextApiHandler<{ data: IPendingCuratorReq[]; totalCount: number } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { userAddress } = req.body;

	try {
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		if (!userAddress?.length || !getEncodedAddress(userAddress, network)) {
			return res.status(400).json({ message: messages.INVALID_PARAMS });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const encodedUserAddress = getEncodedAddress(userAddress, network);

		const curatorReqSubsquidRes = await fetchSubsquid({
			network,
			query: GET_CURATOR_RECIVED_SENT_COUNT,
			variables: {
				address: encodedUserAddress
			}
		});

		// received submissions
		const subsquidBountiesRes = await fetchSubsquid({
			network,
			query: GET_ALL_BOUNTIES_WITHOUT_PAGINATION,
			variables: {
				curator_eq: encodedUserAddress
			}
		});

		const subsquidBountiesData = subsquidBountiesRes?.data?.bounties || [];

		const allSubsquidBountiesIndexes = subsquidBountiesData?.map((bounty: { index: number }) => bounty?.index) || [];

		const submissionsSnapshot = firestore_db.collection('curator_submissions');

		const receivedSubmissions = await submissionsSnapshot?.where('parent_bounty_index', 'in', allSubsquidBountiesIndexes).count().get();

		//sent submission
		const sentSubmissions = await submissionsSnapshot
			?.where('proposer', '==', getEncodedAddress(userAddress, network))
			.where('user_id', '==', user?.id)
			.count()
			.get();

		return {
			data: {
				curator: {
					bounties: curatorReqSubsquidRes?.data?.bounties?.totalCount || 0,
					childBounties: curatorReqSubsquidRes?.data?.childBounties?.totalCount || 0
				},
				submission: {
					received: receivedSubmissions?.data()?.count || 0,
					sent: sentSubmissions?.data()?.count || 0
				}
			},
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error || messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

export default withErrorHandling(handler);
