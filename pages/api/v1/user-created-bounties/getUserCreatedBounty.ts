// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse, IUserCreatedBounty } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { getComments } from '../posts/on-chain-post';
import { ProposalType } from '~src/global/proposalType';

interface Args {
	bountyId: number;
	network: string;
}

export async function getUserCreatedBountyById({ bountyId, network }: Args): Promise<IApiResponse<IUserCreatedBounty | MessageType>> {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (isNaN(bountyId)) {
			throw apiErrorWithStatusCode('Invalid BountyId Param', 400);
		}

		const userCreatedBountiesSnapshot = await firestore_db.collection('user_created_bounties').where('network', '==', network).where('id', '==', bountyId).limit(1).get();

		if (userCreatedBountiesSnapshot.empty) {
			throw apiErrorWithStatusCode(`No bounty found with id-${bountyId}`, 400);
		}

		//TODO: pie graph percentage acc to submission count
		//TODO: submissions needs to be added

		const bountyDoc = userCreatedBountiesSnapshot?.docs?.[0];

		const bountyData = bountyDoc?.data();
		const commentRefs = await bountyDoc?.ref.collection('comments').get();

		//comments
		//replies
		const comments = await getComments(commentRefs, bountyDoc.ref, network, ProposalType.USER_CREATED_BOUNTIES, bountyId, false);

		const payload: IUserCreatedBounty = {
			comments: comments || [],
			content: bountyData?.content,
			createdAt: bountyData?.createdAt?.toDate ? String(bountyData?.createdAt?.toDate()) : bountyData?.createdAt,
			deadlineDate: bountyData?.deadlineDate.toDate ? String(bountyData?.deadlineDate.toDate()) : bountyData?.deadlineDate,
			history: bountyData?.history || [],
			id: bountyData?.id,
			maxClaim: bountyData?.maxClaim,
			proposalType: bountyData?.proposalType,
			proposer: bountyData?.proposer || '',
			reward: bountyData?.reward || '0',
			source: bountyData?.source,
			status: bountyData?.status,
			submissionGuidelines: bountyData?.submissionGuidelines || '',
			tags: bountyData?.tags || [],
			title: bountyData?.title || '',
			twitterHandle: bountyData?.twitterHandle,
			updatedAt: bountyData?.updatedAt.toDate ? String(bountyData?.updatedAt.toDate()) : bountyData?.updatedAt,
			userId: bountyData?.userId
		};
		return {
			data: payload,
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
}
const handler: NextApiHandler<IUserCreatedBounty | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { bountyId } = req.query;

		const { data, error } = await getUserCreatedBountyById({
			bountyId: Number(bountyId),
			network: network
		});

		if (data) {
			return res.status(200).json(data);
		} else if (error) {
			return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
		}
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
