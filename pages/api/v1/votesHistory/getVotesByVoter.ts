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
import { network as AllNetworks } from '~src/global/networkConstants';
import { GET_VOTE_HISTORY_IN_PROFILE } from '~src/queries';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType } from '~src/global/proposalType';
import { noTitle } from '~src/global/noTitle';
export interface IVerificationResponse {
	message: VerificationStatus;
}

interface Props {
	page: number;
	voterAddresses: string[];
	orderBy: string[];
	type?: string;
}

export interface IProfileVoteHistoryRespose {
	decision: 'yes' | 'no';
	balance: string;
	lockPeriod: number | string;
	isDelegatedVote: boolean;
	delegatedVotingPower?: string;
	delegatedTo?: string;
	voter: string;
	proposal: {
		createdAt: Date;
		id: number | string;
		proposer: string;
		status: string;
		title?: string;
		statusHistory?: string[];
	};
}

const getIsSwapStatus = (statusHistory: string[]) => {
	const index = statusHistory.findIndex((v: any) => v.status === 'DecisionDepositPlaced');
	if (index >= 0) {
		const decidingIndex = statusHistory.findIndex((v: any) => v.status === 'Deciding');
		if (decidingIndex >= 0) {
			const obj = statusHistory[index];
			statusHistory.splice(index, 1);
			statusHistory.splice(decidingIndex, 0, obj);
			return true;
		}
	}
	return false;
};

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	const { voterAddresses, page = 1, orderBy = ['proposalIndex_DESC'], type } = req.body as unknown as Props;

	const network = String(req.headers['x-network']);
	if (network === 'undefined' || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const numPage = Number(page);
	if (isNaN(numPage) || numPage <= 0) {
		return res.status(400).json({ message: `Invalid page "${page}"` });
	}
	const encodeAddresses = [...voterAddresses]?.map((address: string) => (address ? getEncodedAddress(String(address), network) : address));

	const postVariables: any = {
		offset: LISTING_LIMIT * (numPage - 1),
		orderBy,
		type_eq: type,
		voter_in: encodeAddresses
	};
	let query = '';
	if ([AllNetworks.KUSAMA, AllNetworks.POLKADOT].includes(network)) {
		query = GET_VOTE_HISTORY_IN_PROFILE;
	}

	const profileVotes = await fetchSubsquid({
		network,
		query,
		variables: postVariables
	});

	const totalCount = profileVotes['data'].flattenedConvictionVotesConnection.totalCount || 0;

	const voteData: IProfileVoteHistoryRespose[] = profileVotes['data'].flattenedConvictionVotes?.map((vote: any) => {
		const { createdAt, index: id, proposer, statusHistory } = vote.proposal;

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
			isDelegatedVote: vote?.isDelegated,
			lockPeriod: Number(vote?.lockPeriod) || 0,
			proposal: {
				createdAt,
				id,
				proposer,
				status
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
				return {
					...vote,
					proposal: {
						...vote?.proposal,
						title: postData?.title || noTitle
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
