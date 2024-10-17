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
import { ESubmissionStatus, IChildBountySubmission } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import { getBountyInfo } from '../../getBountyInfoFromIndex';
import { getSubSquareContentAndTitle } from 'pages/api/v1/posts/subsqaure/subsquare-content';
import { getProposalTypeTitle, ProposalType } from '~src/global/proposalType';
import { getDefaultContent } from '~src/util/getDefaultContent';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';

const handler: NextApiHandler<IChildBountySubmission[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { userAddress } = req.body;

		if (!userAddress?.length || !getEncodedAddress(userAddress, network)) {
			return res.status(400).json({ message: messages?.INVALID_PARAMS });
		}

		const token = getTokenFromReq(req);
		if (!token) return res.status(400).json({ message: messages?.INVALID_JWT });

		const user = await authServiceInstance.GetUser(token);
		if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

		const submissionsSnapshot = firestore_db.collection('curator_submissions');

		const submissionsDocs = await submissionsSnapshot?.where('proposer', '==', getEncodedAddress(userAddress, network)).get();

		if (submissionsDocs?.empty) {
			return res.status(403).json({ message: messages?.NO_CHILD_BOUNTY_SUBMISSION_FOUND });
		}

		const allSubmissions: IChildBountySubmission[] = [];

		const submissionsPromises = submissionsDocs?.docs?.map(async (doc) => {
			if (doc?.exists) {
				const data = doc?.data();

				const payload: IChildBountySubmission = {
					content: data?.content || '',
					createdAt: data?.created_at?.toDate ? data?.created_at?.toDate() : data?.created_at,
					link: data?.link || '',
					parentBountyIndex: data?.parent_bounty_index,
					proposer: data?.proposer,
					reqAmount: data?.req_amount,
					status: data?.staus,
					tags: data?.tags || [],
					title: data?.title || '',
					updatedAt: data?.updated_at?.toDate ? data?.updated_at?.toDate() : data?.updated_at
				};

				//is Bounty active
				const { data: subsquidRes } = await getBountyInfo({
					bountyIndex: userAddress,
					network: network
				});

				if (!getBountiesCustomStatuses(EBountiesStatuses.ACTIVE).includes(subsquidRes?.status || '')) {
					payload.status = ESubmissionStatus.OUTDATED;
				}
				payload.bountyData = {
					...(payload?.bountyData || {}),
					createdAt: subsquidRes?.createdAt as any,
					curator: subsquidRes?.curator || '',
					reqAmount: subsquidRes?.reqAmount || '0',
					status: subsquidRes?.status || ''
				};

				allSubmissions.push(payload);
			}
		});

		await Promise.allSettled(submissionsPromises);

		const allSubmissionsBountyIndexes = allSubmissions?.map((data: IChildBountySubmission) => data?.parentBountyIndex);
		const chunkArray = (arr: any[], chunkSize: number) => {
			const chunks = [];
			for (let i = 0; i < arr.length; i += chunkSize) {
				chunks.push(arr.slice(i, i + chunkSize));
			}
			return chunks;
		};

		const chunks = chunkArray(allSubmissionsBountyIndexes, 30);

		const bountiesDocsPromises = chunks.map((chunk) => postsByTypeRef(network, ProposalType.BOUNTIES).where('id', 'in', chunk).get());
		const bountiesDocsSnapshots = await Promise.all(bountiesDocsPromises);

		const bountiesDocs = bountiesDocsSnapshots.flatMap((snapshot) => snapshot.docs);

		const resultsPromises = allSubmissions?.map(async (submission: IChildBountySubmission) => {
			const bountiesDataPromises = bountiesDocs?.map(async (bounty) => {
				if (bounty?.exists) {
					const data = bounty.data();
					if (submission?.parentBountyIndex == data?.id) {
						submission.bountyData = {
							...(submission?.bountyData || {}),
							content: data?.content || '',
							title: data?.title || ''
						};
					}
				}
			});

			if (!submission?.content?.length || !submission?.title?.length) {
				const subsqaureRes = await getSubSquareContentAndTitle(ProposalType.BOUNTIES, network, submission?.parentBountyIndex);

				submission.bountyData = {
					...(submission?.bountyData || {}),
					content: subsqaureRes?.content || getDefaultContent({ proposalType: ProposalType.BOUNTIES, proposer: userAddress || '' }) || '',
					title: subsqaureRes?.title || getProposalTypeTitle(ProposalType.BOUNTIES) || ''
				};
			}

			await Promise.allSettled(bountiesDataPromises);
			return submission;
		});

		const resultRes = await Promise.allSettled(resultsPromises);

		const results: IChildBountySubmission[] = [];

		resultRes.map((promise) => {
			if (promise?.status == 'fulfilled') {
				results?.push(promise.value);
			}
		});

		return res.status(200).json(results);
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
