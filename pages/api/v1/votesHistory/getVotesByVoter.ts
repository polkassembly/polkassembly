// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
import { VerificationStatus } from '~src/types';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_VOTE_HISTORY_IN_PROFILE } from '~src/queries';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType } from '~src/global/proposalType';
import { noTitle } from '~src/global/noTitle';
import { isSupportedNestedVoteNetwork } from '~src/components/Post/utils/isSupportedNestedVotes';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getIsSwapStatus } from '~src/util/getIsSwapStatus';
export interface IVerificationResponse {
	message: VerificationStatus;
}

interface Props {
	page: number;
	voterAddresses: string[];
	orderBy: string[];
	type?: string;
	listingLimit?: number;
}

export interface IProfileVoteHistoryRespose {
	createdAt: Date;
	decision: 'yes' | 'no';
	balance: string;
	lockPeriod: number | string;
	isDelegatedVote: boolean;
	delegatedVotingPower?: string;
	delegatedTo?: string;
	voter: string;
	extrinsicIndex: string;
	proposal: {
		createdAt: Date;
		id: number | string;
		proposer: string;
		status: string;
		title?: string;
		description?: string;
		statusHistory?: any[];
		type: string;
		trackNumber?: number;
	};
	selfVotingPower?: string;
	delegatedVotes?: any[];
}
export interface IVotesData extends IProfileVoteHistoryRespose {
	delegatorsCount?: number;
	delegateCapital?: string;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { voterAddresses, page = 1, orderBy = ['proposalIndex_DESC'], type, listingLimit = LISTING_LIMIT } = req.body as unknown as Props;

	const network = String(req.headers['x-network']);
	if (network === 'undefined' || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const numPage = Number(page);
	if (isNaN(numPage) || numPage <= 0) {
		return res.status(400).json({ message: `Invalid page "${page}"` });
	}
	const encodeAddresses = [...voterAddresses]?.map((address: string) => (address ? getEncodedAddress(String(address), network) : address));

	const postVariables: any = {
		limit: listingLimit,
		offset: listingLimit * (numPage - 1),
		orderBy,
		type_eq: type,
		voter_in: encodeAddresses
	};
	let query = '';
	if (isSupportedNestedVoteNetwork(network)) {
		query = GET_VOTE_HISTORY_IN_PROFILE;
	}

	const profileVotes = await fetchSubsquid({
		network,
		query,
		variables: postVariables
	});

	const totalCount = profileVotes['data'].flattenedConvictionVotesConnection.totalCount || 0;

	const voteData: IProfileVoteHistoryRespose[] = profileVotes['data'].flattenedConvictionVotes?.map((vote: any) => {
		const { createdAt, index: id, proposer, statusHistory, type, trackNumber } = vote.proposal;

		let status = vote?.proposal.status;

		const isSwap: boolean = getIsSwapStatus(statusHistory);

		if (isSwap) {
			if (status === 'DecisionDepositPlaced') {
				status = 'Deciding';
			}
		}
		return {
			balance: vote?.balance?.value || vote?.balance?.abstain || '0',
			decision: vote?.decision || null,
			delegatedTo: vote?.delegatedTo || '',
			delegatedVotingPower: !vote?.isDelegated ? vote.parentVote?.delegatedVotingPower : 0,
			extrinsicIndex: vote?.parentVote?.extrinsicIndex,
			isDelegatedVote: vote?.isDelegated,
			lockPeriod: Number(vote?.lockPeriod) || 0.1,
			proposal: {
				createdAt,
				description: '',
				id,
				proposer,
				status,
				statusHistory,
				title: '',
				trackNumber,
				type
			},
			voter: vote?.voter
		};
	});

	let votesResults: IProfileVoteHistoryRespose[] = voteData;
	if (voteData.length > 0) {
		const votesPromise = voteData.map(async (vote) => {
			const postDocRef = postsByTypeRef(network, ProposalType.REFERENDUM_V2).doc(String(vote?.proposal?.id));
			const postData: any = (await postDocRef.get()).data();
			if (postData) {
				let postTitle;
				if (!postData?.title) {
					const res = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, vote?.proposal?.id);
					postTitle = res?.title;
				}
				return {
					...vote,
					proposal: {
						...vote?.proposal,
						description: postData?.description || '',
						title: postData?.title || postTitle || noTitle
					}
				};
			} else {
				return vote;
			}
		});
		const results = await Promise.allSettled(votesPromise);
		votesResults = results.reduce((prev, post) => {
			if (post && post.status === 'fulfilled') {
				prev.push(post.value);
			}
			return prev;
		}, [] as IProfileVoteHistoryRespose[]);
	}
	return res.status(200).json({ data: votesResults, totalCount });
};

export default withErrorHandling(handler);
