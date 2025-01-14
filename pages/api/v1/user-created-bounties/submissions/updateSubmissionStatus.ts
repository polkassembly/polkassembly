// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { EUserCreatedBountiesStatuses, EUserCreatedBountySubmissionStatus } from '~src/types';
import checkIsUserCreatedBountySubmissionValid from '~src/util/userCreatedBounties/checkIsUserCreatedBountySubmissionValid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { parentBountyProposerAddress, submissionProposerAddress, parentBountyIndex, submissionId, updatedStatus } = req.body;
		const substrateParentBountyProposerAddress = getSubstrateAddress(parentBountyProposerAddress);
		const substrateSubmissionProposerAddress = getSubstrateAddress(submissionProposerAddress);

		if (![EUserCreatedBountySubmissionStatus.APPROVED, EUserCreatedBountySubmissionStatus.REJECTED, EUserCreatedBountySubmissionStatus.PAID].includes(updatedStatus)) {
			return res.status(400).json({ message: 'Invalid Updated Status Param' });
		}
		if (!parentBountyProposerAddress?.length || !getEncodedAddress(parentBountyProposerAddress, network)) {
			return res.status(400).json({ message: 'Invalid Proposer Address' });
		}
		if (!submissionProposerAddress?.length || !getEncodedAddress(submissionProposerAddress, network)) {
			return res.status(400).json({ message: 'Invalid Proposer Address' });
		}

		if (isNaN(parentBountyIndex)) {
			return res.status(400).json({ message: 'Invalid Parent Bounty Index' });
		}
		if (!submissionId?.length) {
			return res.status(400).json({ message: `Invalid Submission Id-${submissionId}` });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const userCreatedBountySnapshot = await firestore_db.collection('user_created_bounties').where('network', '==', network).where('id', '==', parentBountyIndex).limit(1).get();

		if (userCreatedBountySnapshot?.empty) {
			return res.status(400).json({ message: `No bounty found with id-${parentBountyIndex}` });
		}
		const parentBountyData = userCreatedBountySnapshot?.docs?.[0]?.data();

		if (parentBountyData?.status !== EUserCreatedBountiesStatuses.ACTIVE) {
			return res.status(400).json({ message: `Parent Bounty-${parentBountyIndex} is not active for update submission status` });
		}

		//isOwner check
		if (parentBountyData?.proposer !== substrateParentBountyProposerAddress) {
			return res.status(400).json({ message: messages?.UNAUTHORISED });
		}

		const { maxClaimReached, submissionAlreadyExists, claimedSubmissionsCount } = await checkIsUserCreatedBountySubmissionValid(
			userCreatedBountySnapshot?.docs?.[0]?.ref,
			Number(user?.id),
			substrateSubmissionProposerAddress || submissionProposerAddress
		);

		if (!submissionAlreadyExists) {
			return res.status(400).json({ message: `Submission does not exists for bounty id-${parentBountyIndex}` });
		}
		if (maxClaimReached) {
			return res.status(400).json({ message: `Max number of claimed reached for bounty id-${parentBountyIndex}` });
		}

		//last sumbmission to claim check
		if (claimedSubmissionsCount == parentBountyData?.maxClaim - 1 && updatedStatus == EUserCreatedBountiesStatuses.CLAIMED) {
			await userCreatedBountySnapshot?.docs?.[0]?.ref.update({ status: EUserCreatedBountiesStatuses.CLAIMED });
		}

		const submissionsRef = userCreatedBountySnapshot?.docs?.[0]?.ref?.collection('submissions');

		const submissionDocRef = submissionsRef?.doc(submissionId);

		await submissionDocRef?.update({ status: updatedStatus });

		return res.status(200).json({ message: messages?.SUCCESS });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
