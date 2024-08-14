// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const GET_ACTIVE_VOTER = `query ActiveVoterQuery($voterAddresses: [String!], $startDate: DateTime!) {
        flattenedConvictionVotes(
            where: { voter_in: $voterAddresses, removedAtBlock_isNull: true, createdAt_gte: $startDate }
        ) {
            balance {
                ... on StandardVoteBalance {
                    value
                }
                ... on SplitVoteBalance {
                    aye
                    nay
                    abstain
                }
            }
            lockPeriod
            proposalIndex
            createdAt
        }
    }`;

export const GET_POPULAR_DELEGATE = `query PopularDelegateQuery($delegateAddresses: [String!]) {
        votingDelegations(where: { to_in: $delegateAddresses}) {
            to
            type
            balance
        }
    }`;

export const GET_PROPOSAL_COUNT = `query ProposalCountQuery($startDate: DateTime!) {
    proposalsConnection(where: { createdAt_gte: $startDate, type_in: [ReferendumV2, Referendum] }, orderBy: id_DESC) {
        totalCount
    }
}`;

export const badgeNames = ['Decentralised Voice', 'Fellow', 'Council Member', 'Active Voter', 'Whale', 'Steadfast Commentor', 'GM Voter', 'Popular Delegate'];
