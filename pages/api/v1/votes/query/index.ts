// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const GET_CONVICTION_VOTES_FOR_ADDRESS_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX = `
query ConvictionVotesForAddressWithTxnHashListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "",) {
  convictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true, voter_eq: $voter_eq}) {
    totalCount
  }
  convictionVotes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true, voter_eq: $voter_eq}, limit: $limit, offset: $offset) {
    decision
    voter
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
    txnHash
  }
}`;

export const GET_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX = `
query ConvictionVotesListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
    convictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}) {
        totalCount
      }
      convictionVotes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}, limit: $limit, offset: $offset) {
        id
        decision
        voter
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
        createdAt
        lockPeriod
        selfVotingPower
        totalVotingPower
        delegatedVotingPower
        delegatedVotes(limit: 10, orderBy: votingPower_DESC) {
          decision
          lockPeriod
          voter
          votingPower
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
        }
      }
}
`;

export const GET_DELEGATED_CONVICTION_VOTES_LISTING_BY_VOTE_ID = `
query ConvictionVotesListingByTypeAndIndex(
  $index_eq: Int = 264,
  $type_eq: VoteType = ReferendumV2,
  $limit: Int = 10,
  $offset: Int = 0,
  $decision: VoteDecision = yes,
  $voter_eq: String = "") {
    convictionVotes(
      where: {
        type_eq: $type_eq,
          proposal: {
            index_eq: $index_eq
          },
        removedAtBlock_isNull: true,
        voter_eq: $voter_eq
      },
      limit: 1) {
      delegatedVotes(limit: $limit, orderBy: votingPower_DESC, offset: $offset, where:{
        decision_eq: $decision
        delegatedTo:{
          removedAtBlock_isNull: true
        }
      }) {
        decision
        lockPeriod
        voter
        votingPower
        balance {
          ... on StandardVoteBalance {
            value
          }
          ... on SplitVoteBalance {
            aye
            nay
          }
        }
        proposalIndex
        delegatedTo {
          voter
        }
      }
    }
    convictionDelegatedVotesConnection(orderBy: id_ASC,
      where: {
        decision_eq: $decision,
        proposalIndex_eq: $index_eq,
        removedAtBlock_isNull: true,
          delegatedTo:{
            voter_eq: $voter_eq,
            removedAtBlock_isNull: true
          }
      }) {
      totalCount
    }
  }
`;

export const GET_CONVICTION_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX = `
query ConvictionVotesListingForAddressByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
  convictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true, voter_eq: $voter_eq}) {
    totalCount
  }
  convictionVotes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true, voter_eq: $voter_eq}, limit: $limit, offset: $offset) {
    decision
    voter
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
  }
}
`;

export const GET_CONVICTION_VOTES_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX = `
query ConvictionVotesWithTxnHashListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
  convictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}) {
    totalCount
  }
  convictionVotes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}, limit: $limit, offset: $offset) {
    decision
    voter
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
    txnHash
  }
}
`;

export const GET_VOTES_LISTING_BY_TYPE_AND_INDEX = `
query VotesListingByTypeAndIndex($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
  votesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}}) {
    totalCount
  }
  votes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}}, limit: $limit, offset: $offset) {
    decision
    voter
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
  }
}
`;

export const GET_VOTES_LISTING_BY_TYPE_AND_INDEX_WITH_REMOVED_AT_BLOCK_ISNULL_TRUE = `
query VotesListingByTypeAndIndex_With_RemovedAtBlockIsNull_True($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
  votesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}) {
    totalCount
  }
  votes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}, limit: $limit, offset: $offset) {
    decision
    voter
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
  }
}
`;

export const GET_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX = `
query VotesListingForAddressByTypeAndIndex($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
  votesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, voter_eq: $voter_eq}) {
    totalCount
  }
  votes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, voter_eq: $voter_eq}, limit: $limit, offset: $offset) {
    decision
    voter
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
  }
}`;

export const GET_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX_WITH_REMOVED_AT_BLOCK_ISNULL_TRUE = `
query VotesListingForAddressByTypeAndIndex_With_RemovedAtBlockIsNull_True($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
  votesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, voter_eq: $voter_eq, removedAtBlock_isNull: true}) {
    totalCount
  }
  votes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, voter_eq: $voter_eq, removedAtBlock_isNull: true}, limit: $limit, offset: $offset) {
    decision
    voter
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
  }
}`;

export const GET_DELEGATED_CONVICTION_VOTES_COUNT = `
query ConvictionDelegatedVotesCountAndBalance(
  $index_eq: Int = 253,
  $decision: VoteDecision = yes,
  $voter_eq: String = "HqRcfhH8VXMhuCk5JXe28WMgDDuW9MVDVNofe1nnTcefVZn") {
    convictionVotes(orderBy: id_ASC,
      where: {
        decision_eq: $decision,
        proposalIndex_eq: $index_eq,
        removedAtBlock_isNull: true,
        voter_eq: $voter_eq,
      }) {
    delegatedVotes {
      lockPeriod
      votingPower
      balance {
        ... on StandardVoteBalance {
          value
        }
        ... on SplitVoteBalance {
          aye
          nay
        }
      }
    }
  }
    convictionDelegatedVotesConnection(orderBy: id_ASC,
      where: {
        decision_eq: $decision,
        proposalIndex_eq: $index_eq,
        removedAtBlock_isNull: true,
          delegatedTo:{
            voter_eq: $voter_eq,
            removedAtBlock_isNull: true
          }
      }) {
      totalCount
    }
}
`;
