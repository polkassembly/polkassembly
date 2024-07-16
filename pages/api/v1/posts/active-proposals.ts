// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType, getFirestoreProposalType, getStatusesFromCustomStatus, getSubsquidProposalType } from '~src/global/proposalType';

import fetchSubsquid from '~src/util/fetchSubsquid';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { ACTIVE_PROPOSALS_FOR_TRACK } from '~src/queries';
import messages from '~src/auth/utils/messages';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { IBeneficiary } from '~src/types';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import { network as AllNetworks } from '~src/global/networkConstants';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { IPostResponse } from './on-chain-post';

interface Args {
	network: string;
	trackNumber: number;
	proposalType: ProposalType;
	isExternalApiCall?: boolean;
}

const getIsSwapStatus = (statusHistory: string[]) => {
	const index = statusHistory.findIndex((v: any) => v.status === 'DecisionDepositPlaced');
	if (index >= 0) {
		const decidingIndex = statusHistory.findIndex((v: any) => v.status === 'Deciding');
		if (decidingIndex >= 0) {
			const obj = statusHistory[index];
			statusHistory.splice(index, 1);
			statusHistory.splice(decidingIndex, 0, obj);
			return { isSwap: true, statusHistory };
		}
	}
	return { isSwap: false, statusHistory };
};

export const getTopicFromFirestoreData = (data: any, proposalType: ProposalType) => {
	if (data) {
		const topic = data.topic;
		const topic_id = data.topic_id;
		return topic
			? topic
			: isTopicIdValid(topic_id)
			? {
					id: topic_id,
					name: getTopicNameFromTopicId(topic_id)
			  }
			: getTopicFromType(proposalType);
	}
	return null;
};

export const getUpdatedAt = (data: any) => {
	if (data) {
		if (data?.last_edited_at) {
			return data?.last_edited_at?.toDate ? data?.last_edited_at?.toDate() : data?.last_edited_at;
		} else if (data.updated_at) {
			return data.updated_at?.toDate ? data.updated_at?.toDate() : data.updated_at;
		}
	}
};

export const getActiveProposalsForTrack = async ({ network, proposalType, trackNumber, isExternalApiCall }: Args) => {
	if (!network || !Object.values(AllNetworks).includes(network)) {
		throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);
	}

	const strProposalType = String(proposalType);
	if (!isProposalTypeValid(strProposalType) || (trackNumber !== null && isNaN(trackNumber))) {
		throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);
	}
	const query = ACTIVE_PROPOSALS_FOR_TRACK;

	const variables: any = {
		status_in: getStatusesFromCustomStatus(CustomStatus.Active),
		type_eq: getSubsquidProposalType(proposalType as any)
	};

	if (trackNumber !== null) {
		variables.track_eq = trackNumber;
	}

	const subsquidRes = await fetchSubsquid({
		network,
		query,
		variables
	});
	const subsquidData = subsquidRes?.['data']?.proposals || [];

	if (!subsquidData.length) {
		return { data: [], error: null };
	} else {
		const activeProposalIds = subsquidData.map((proposal: any) => (isNaN(proposal?.index) ? null : proposal?.index));

		const postsSnapshot = await postsByTypeRef(network, (getFirestoreProposalType(proposalType) as ProposalType) || proposalType)
			.where(
				'id',
				'in',
				activeProposalIds.filter((item: string | null) => !!item)
			)
			.get();

		if (postsSnapshot.empty) {
			return { data: subsquidData, error: null };
		} else {
			const results: any[] = [];

			const postsDocs = postsSnapshot.docs;
			const subsquidDataPromises = subsquidData.map(async (subsquidPost: any) => {
				const firebasePostDoc = postsDocs.find((doc) => doc.id == subsquidPost.index);

				const preimage = subsquidPost?.preimage;
				const proposedCall = preimage?.proposedCall;
				const proposalArguments = subsquidData?.proposalArguments || subsquidData?.callData;
				let requested = BigInt(0);
				const beneficiaries: IBeneficiary[] = [];
				let assetId: null | string = null;

				if (proposedCall?.args) {
					if (proposedCall?.args?.assetKind?.assetId?.value?.interior) {
						const call = proposedCall?.args?.assetKind?.assetId?.value?.interior?.value;
						assetId = (call?.length ? call?.find((item: { value: number; __kind: string }) => item?.__kind == 'GeneralIndex')?.value : null) || null;
					}
					proposedCall.args = convertAnyHexToASCII(proposedCall.args, network);

					if (proposedCall?.args?.beneficiary?.value?.interior?.value?.id) {
						proposedCall.args.beneficiary.value.interior.value.id = convertAnyHexToASCII(proposedCall?.args?.beneficiary?.value?.interior?.value?.id, network);
					}

					if (proposedCall.args.amount) {
						requested = proposedCall.args.amount;
						if (proposedCall.args.beneficiary) {
							beneficiaries.push({
								address: proposedCall.args.beneficiary as string,
								amount: proposedCall.args.amount
							});
						}
					} else {
						const calls = proposedCall.args.calls;
						if (calls && Array.isArray(calls) && calls.length > 0) {
							calls.forEach((call) => {
								if (call && call.amount) {
									requested += BigInt(call.amount);
									if (call.beneficiary) {
										beneficiaries.push({
											address: call.beneficiary as string,
											amount: call.amount
										});
									}
								}
							});
						}
					}
				}

				const payload: any = {
					assetId: assetId || null,
					beneficiaries: beneficiaries || [],
					comments: [],
					content: '',
					created_at: subsquidPost?.createdAt?.toDate ? subsquidPost?.createdAt?.toDate() : subsquidPost?.createdAt || null,
					gov_type: ProposalType.OPEN_GOV === proposalType ? 'open_gov' : 'gov_1',
					id: subsquidPost.index,
					last_edited_at: subsquidPost?.createdAt?.toDate ? subsquidPost?.createdAt?.toDate() : subsquidPost?.createdAt || null,
					method: preimage?.method || proposedCall?.method || proposalArguments?.method,
					preimageHash: preimage.hash,
					proposedCall: proposedCall,
					proposer: subsquidPost?.proposer || '',
					requested: requested.toString() || '0',
					status: subsquidPost?.status,
					statusHistory: subsquidPost?.statusHistory || [],
					summary: '',
					tags: [],
					tally: subsquidPost.tally,
					title: '',
					track_number: trackNumber,
					type: subsquidPost.type
				};

				if (firebasePostDoc?.exists) {
					const firebasePost = firebasePostDoc?.data();

					const { statusHistory, isSwap } = getIsSwapStatus(subsquidPost?.statusHistory);

					// payload.last_edited_at = getUpdatedAt(firebasePost).toDate() || null;
					payload.statusHistory = statusHistory;
					payload.summary = firebasePost?.summary || '';
					payload.tags = firebasePost?.tags || [];
					payload.title = firebasePost?.title || '';
					payload.topic = getTopicFromFirestoreData(firebasePost, getFirestoreProposalType(proposalType) as ProposalType);

					if (isSwap) {
						if (payload.status === 'DecisionDepositPlaced') {
							payload.status = 'Deciding';
						}
					}

					await getContentSummary(firebasePost, network, isExternalApiCall);
					results.push(payload);
				} else {
					results.push(payload);
				}
			});

			await Promise.allSettled(subsquidDataPromises);

			return { data: results, error: null };
		}
	}
};
const handler: NextApiHandler<IPostResponse[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	// const { proposalType, trackNumber = null } = req.body;
	const network = String(req.headers['x-network']);

	const { data, error } = await getActiveProposalsForTrack({
		isExternalApiCall: true,
		network: network,
		proposalType: ProposalType.REFERENDUM_V2,
		trackNumber: 33
	});

	if (error || !data) {
		return res.status(400).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		if (data.summary) {
			delete data.summary;
		}
		return res.status(200).json(data);
	}
};

export default withErrorHandling(handler);
