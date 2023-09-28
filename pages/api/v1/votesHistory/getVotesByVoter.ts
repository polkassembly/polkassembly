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
import { GET_PROFILE_CONVICTION_VOTES_FROM_VOTER_ADDRESS, GET_PROFILE_DELEGATED_VOTES_FROM_VOTER_ADDRESS } from '~src/queries';
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
}

export interface IProfileVoteHistoryRespose {
	decision: 'yes' | 'no';
	balance: string;
	delegatedVotes: any[];
	delegatedVotingPower: string;
	selfVotingPower: string;
	totalVotingPower: string;
	lockPeriod: number | string;
	isDelegatedVote: boolean;
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
	const { voterAddresses, page = 1, orderBy = ['proposalIndex_DESC'] } = req.body as unknown as Props;

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
		voter_in: encodeAddresses
	};
	let convictionVoteQuery = '';
	let delegatedVoteQuery = '';
	if ([AllNetworks.KUSAMA, AllNetworks.POLKADOT].includes(network)) {
		convictionVoteQuery = GET_PROFILE_CONVICTION_VOTES_FROM_VOTER_ADDRESS;
		delegatedVoteQuery = GET_PROFILE_DELEGATED_VOTES_FROM_VOTER_ADDRESS;
	}
	const convictionVotes = await fetchSubsquid({
		network,
		query: convictionVoteQuery,
		variables: postVariables
	});
	const delegatedVotes = await fetchSubsquid({
		network,
		query: delegatedVoteQuery,
		variables: postVariables
	});
	const convictionVotesTotalCount = convictionVotes['data']?.convictionVotesConnection?.totalCount;
	const delegatesVotesTotalCount = convictionVotes['data']?.convictionDelegatedVotesConnection?.totalCount;

	let voteData: IProfileVoteHistoryRespose[] = convictionVotes['data'].convictionVotes?.map((vote: any) => {
		const { createdAt, index: id, proposer } = vote.proposal;

		let status = vote?.proposal.status;

		if (status === 'DecisionDepositPlaced') {
			status = 'Deciding';
		}
		return {
			balance: vote?.balance?.value || '0',
			decision: vote?.decision || null,
			delegatedVotes: vote?.delegatedVotes || [],
			delegatedVotingPower: vote?.delegatedVotingPower,
			isDelegatedVote: false,
			lockPeriod: Number(vote?.lockPeriod) || 0,
			proposal: {
				createdAt,
				id,
				proposer,
				status
			},
			selfVotingPower: vote?.selfVotingPower,
			totalVotingPower: vote?.totalVotingPower,
			voter: vote?.voter
		};
	});
	if (delegatedVotes['data']?.convictionDelegatedVotes?.length) {
		voteData = [
			...voteData,
			...(delegatedVotes['data']?.convictionDelegatedVotes.map((vote: any) => {
				const { createdAt, index: id, proposer, statusHistory } = vote.delegatedTo.proposal;
				let status = vote?.delegatedTo?.proposal?.status;

				const isSwap: boolean = getIsSwapStatus(statusHistory);

				if (isSwap) {
					if (status === 'DecisionDepositPlaced') {
						status = 'Deciding';
					}
				}

				return {
					balance: vote?.balance?.value || '0',
					decision: vote?.decision || null,
					delegatedVotes: vote?.delegatedVotes || [],
					delegatedVotingPower: 0,
					isDelegatedVote: true,
					lockPeriod: Number(vote?.lockPeriod) || 0,
					proposal: {
						createdAt,
						id,
						proposer,
						status
					},
					selfVotingPower: vote?.votingPower,
					totalVotingPower: 0,
					voter: vote?.voter
				};
			}) || [])
		];
	}
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
	return res.status(200).json({ data: votesResults, totalCount: convictionVotesTotalCount || 0 + delegatesVotesTotalCount || 0 });
};

export default withErrorHandling(handler);
