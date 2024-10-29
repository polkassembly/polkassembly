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
import { getBountyInfo } from '../../getBountyInfoFromIndex';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import { EChildbountySubmissionStatus } from '~src/types';
import getEncodedAddress from '~src/util/getEncodedAddress';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { curatorAddress, proposerAddress, submissionId, parentBountyIndex, rejectionMessage, updatedStatus } = req.body;
		if (
			!proposerAddress?.length ||
			!getEncodedAddress(proposerAddress, network) ||
			!curatorAddress?.length ||
			!getEncodedAddress(curatorAddress, network) ||
			!submissionId?.length ||
			![EChildbountySubmissionStatus.APPROVED, EChildbountySubmissionStatus.REJECTED, EChildbountySubmissionStatus.DELETED].includes(updatedStatus)
		) {
			return res.status(400).json({ message: messages?.INVALID_PARAMS });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(401).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(401).json({ message: messages.UNAUTHORISED });

		const { data } = await getBountyInfo({
			bountyIndex: parentBountyIndex,
			network: network
		});

		if (!getBountiesCustomStatuses(EBountiesStatuses.ACTIVE).includes(data?.status || '')) {
			return res.status(400).json({ message: messages?.PARENT_BOUNTY_IS_NOT_ACTIVE });
		}

		if ([EChildbountySubmissionStatus.APPROVED, EChildbountySubmissionStatus.REJECTED].includes(updatedStatus)) {
			if (![getEncodedAddress(curatorAddress, network), curatorAddress].includes(data?.curator)) {
				return res.status(401).json({ message: messages.UNAUTHORISED });
			}
		}

		const submissionDocRef = firestore_db.collection('curator_submissions').doc(submissionId);
		const submissionDoc = await submissionDocRef.get();

		if (!submissionDoc?.exists) {
			return res.status(404).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_NOT_EXISTS });
		}

		if (updatedStatus == EChildbountySubmissionStatus.DELETED) {
			if (submissionDoc?.data()?.user_id !== user?.id) {
				return res.status(401).json({ message: messages.UNAUTHORISED });
			}
			await submissionDocRef?.delete();
			return res.status(200).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_DELETED_SUCCESSFULLY });
		}

		const payload = {
			rejection_msg: rejectionMessage || '',
			status: updatedStatus,
			updatedAt: new Date()
		};

		await submissionDocRef?.update(payload);

		return res.status(200).json({ message: messages?.CHILD_BOUNTY_SUBMISSION_EDITED_SUCCESSFULLY });
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
