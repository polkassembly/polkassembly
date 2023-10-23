// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const GET_CURVE_DATA_BY_INDEX = `
query CurveDataByIndex($index_eq: Int, $limit: Int = 1000) {
  curveData(limit: $limit, where: {index_eq: $index_eq}, orderBy: block_ASC) {
    approvalPercent
    block
    id
    index
    supportPercent
    timestamp
  }
}
`;

export const GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY = `
query ProposalsListingByType($limit: Int, $index_in: [Int!]) {
  proposals(where: {index_in: $index_in, type_eq: Bounty}, limit: $limit) {
    curator
    preimage {
      proposer
    }
    proposer
    index
  }
}`;

export const GET_LATEST_PREIMAGES = `
query MyQuery($hash_eq: String = "") {
  preimages(limit: 1, orderBy: createdAt_DESC, where: {status_eq: Noted, hash_eq: $hash_eq}) {
    hash
    deposit
    createdAtBlock
    length
    method
    proposedCall {
      args
      description
      method
      section
    }
    proposer
    section
    status
    updatedAt
    updatedAtBlock
    createdAt
  }
}
`;

export const GET_PROPOSALS_LISTING_COUNT_BY_TYPE = `
query ProposalsListingByType($type_in: [ProposalType!], $trackNumber_in: [Int!], $status_in: [ProposalStatus!]) {
  proposalsConnection(orderBy: id_ASC, where: {type_in: $type_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    totalCount
  }
}
`;

export const GET_PROPOSALS_LISTING_BY_TYPE_FOR_COLLECTIVES = `
query ProposalsListingByType($type_in: [ProposalType!], $orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC, $limit: Int = 10, $offset: Int = 0, $index_in: [Int!], $hash_in: [String!], $trackNumber_in: [Int!], $status_in: [ProposalStatus!]) {
  proposalsConnection(orderBy: id_ASC, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    totalCount
  }
  proposals(orderBy: $orderBy, limit: $limit, offset: $offset, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    proposer
    curator
    createdAt
    updatedAt
    status
    statusHistory {
      id
    }
    tally {
      ayes
      nays
      support
     
    }
    preimage {
      method
      proposer
    }
    index
    end
    hash
    description
    type
    origin
    trackNumber
    proposalArguments {
      method
      description
    }
    parentBountyIndex
    statusHistory {
      block
      status
      timestamp
    }
  }
}
`;

export const GET_PROPOSALS_LISTING_BY_TYPE = `
query ProposalsListingByType($type_in: [ProposalType!], $orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC, $limit: Int = 10, $offset: Int = 0, $index_in: [Int!], $hash_in: [String!], $trackNumber_in: [Int!], $status_in: [ProposalStatus!]) {
  proposalsConnection(orderBy: id_ASC, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    totalCount
  }
  proposals(orderBy: $orderBy, limit: $limit, offset: $offset, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    proposer
    curator
    createdAt
    updatedAt
    status
    statusHistory {
      id
    }
    tally {
      ayes
      nays
      support
    }
    preimage {
      method
      proposer
      proposedCall {
        args
        description
        method
        section
      }
    }
    index
    end
    hash
    description
    type
    origin
    trackNumber
    group {
      proposals(limit: 10, orderBy: createdAt_ASC) {
       type
        statusHistory(limit: 10, orderBy: timestamp_ASC) {
          status
          timestamp
          block
        }
        index
        createdAt
        proposer
        preimage {
          proposer
        }
        hash
      }
    }
    proposalArguments {
      method
      description
    }
    parentBountyIndex
    statusHistory {
      block
      status
      timestamp
    }
  }
}
`;
export const GET_PROPOSALS_LISTING_FOR_POLYMESH = `
query PolymeshPrposalsQuery($type_in: [ProposalType!], $limit: Int = 10, $offset: Int = 0) {
  proposals(orderBy: createdAt_DESC, limit: $limit, offset: $offset, where: {type_in: $type_in}) {
    createdAt
    createdAtBlock
    deposit
    endedAtBlock
    endedAt
    hash
    fee
    description
    proposer
    index
    status
    identity
    statusHistory {
      id
    }
    tally {
      ayes
      nays
    }
    updatedAt
    updatedAtBlock
    type
  }
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {type_in: $type_in}) {
    totalCount
  }
}
`;

export const GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES = `query ProposalsListingByTypeAndIndexes($type_eq: ProposalType, $limit: Int = 10, $index_in: [Int!]) {
  proposals(where: {type_eq: $type_eq, index_in: $index_in}, limit: $limit) {
    proposer
    curator
    createdAt
    updatedAt
    preimage {
      method
      proposer
    }
    index
    end
    hash
    description
    type
    origin
    statusHistory {
      id
    }
    tally {
      ayes
      nays
      support
    }
    trackNumber
    group {
      proposals(limit: 10, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 10, orderBy: timestamp_ASC) {
          status
          timestamp
          block
        }
        index
        createdAt
        proposer
        preimage {
          proposer
        }
        hash
      }
    }
    proposalArguments {
      method
      description
    }
    parentBountyIndex
    statusHistory {
      block
      status
      timestamp
    }
    status
  }
}`;

export const GET_POLYMESH_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES = `query PolymeshPrposalsQuery($type_eq: ProposalType, $index_in: [Int!], $limit: Int = 10, $offset: Int = 0,$orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC) {
  proposals(orderBy: $orderBy, limit: $limit, offset: $offset, where: {type_eq: $type_eq, index_in: $index_in}) {
    createdAt
    createdAtBlock
    deposit
    endedAtBlock
    endedAt
    hash
    identity
    fee
    description
    proposer
    index
    status
    statusHistory {
      id
    }
    tally {
      ayes
      nays
    }
    updatedAt
    updatedAtBlock
    type
  }
  proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, index_in: $index_in}) {
    totalCount
  }
}
`;

export const GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING = `
query ProposalByIndexAndTypeForLinking($index_eq: Int, $hash_eq: String, $type_eq: ProposalType = DemocracyProposal) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    curator
    description
    hash
    index
    preimage {
      method
      proposer
      proposedCall {
        args
        description
        method
        section
      }
    }
    proposer
    type
    createdAtBlock
    createdAt
    group {
      proposals(limit: 10, orderBy: createdAt_ASC) {
        curator
        description
        hash
        index
        preimage {
          method
          proposer
          proposedCall {
            args
            description
            method
            section
          }
        }
        proposer
        type
        createdAtBlock
        statusHistory(limit: 10, orderBy: timestamp_ASC) {
          status
          block
          timestamp
        }
      }
    }
    statusHistory(limit: 10) {
      status
      timestamp
      block
    }
  }
}
`;

export const GET_PROPOSAL_BY_INDEX_AND_TYPE = `
query ProposalByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType = DemocracyProposal, $voter_eq: String = "", $vote_type_eq: VoteType = Motion) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    index
    proposer
    status
    preimage {
      proposer
      method
      hash
      proposedCall {
        method
        args
        description
        section
      }
    }
    description
    parentBountyIndex
    hash
    curator
    type
    threshold {
      ... on MotionThreshold {
        __typename
        value
      }
      ... on ReferendumThreshold {
        __typename
        type
      }
    }
    origin
    trackNumber
    end
    createdAt
    updatedAt
    delay
    endedAt
    deposit
    bond
    reward
    payee
    fee
    curatorDeposit
    proposalArguments {
      method
      args
      description
      section
    }
    voting(limit: 1, where: {voter_eq: $voter_eq}) {
      decision
    }
    group {
      proposals(limit: 10, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 10, orderBy: timestamp_ASC) {
          status
          timestamp
          block
        }
        index
        createdAt
        proposer
        preimage {
          proposer
        }
        hash
      }
    }
    statusHistory(limit: 10) {
      timestamp
      status
      block
    }
    tally {
      ayes
      bareAyes
      nays
      support
    }
    enactmentAfterBlock
    enactmentAtBlock
    decisionDeposit {
      amount
      who
    }
    submissionDeposit {
      amount
      who
    }
    deciding {
      confirming
      since
    }
  }
  tippersConnection(orderBy: createdAt_DESC, where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}) {
    totalCount
    edges {
      node {
        value
        tipper
        createdAt
        hash
        createdAtBlock
      }
    }
  }
  votesConnection(orderBy: blockNumber_DESC, where: {type_eq: $vote_type_eq, proposal: {index_eq: $index_eq, type_eq: $type_eq}}) {
    totalCount
    edges {
      node {
        voter
        decision
      }
    }
  }
}`;

export const GET_POLYMESH_PROPOSAL_BY_INDEX_AND_TYPE = `query PolymeshProposalByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType) {
  proposals(limit: 1, where: {index_eq: $index_eq, hash_eq: $hash_eq, type_eq: $type_eq}) {
    index
    proposer
    status
    description
    identity
    hash
    type
    threshold {
      ... on MotionThreshold {
        __typename
        value
      }
      ... on ReferendumThreshold {
        __typename
        type
      }
    }
    end
    createdAt
    updatedAt
    delay
    endedAt
    deposit
    bond
    fee
    proposalArguments {
      method
      args
      description
      section
    }
    voting (where: {removedAtBlock_isNull: true}){
      decision
      identityId
      balance {
        ... on StandardVoteBalance {
          value
        }
      }
      voter
    }
    statusHistory(limit: 10) {
      timestamp
      status
      block
    }
    tally {
      ayes
      bareAyes
      nays
      totalSeats
    }
  }
  votesConnection(orderBy: blockNumber_DESC, where:{proposal:{type_eq:$type_eq, index_eq:$index_eq}}) {
    totalCount
    edges {
      node {
        voter
        decision
      }
    }
  }
}
`;

export const GET_CHILD_BOUNTIES_BY_PARENT_INDEX = `
query ChildBountiesByParentIndex($parentBountyIndex_eq: Int = 11, $limit: Int, $offset: Int) {
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq}) {
    totalCount
  }  
	proposals(orderBy: createdAtBlock_DESC, limit: $limit, offset: $offset, where: {parentBountyIndex_eq: $parentBountyIndex_eq}) {
    description
    index
    status
  }
}

`;

export const GET_PROPOSAL_BY_INDEX_AND_TYPE_V2 = `
query ProposalByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType = DemocracyProposal, $voter_eq: String = "") {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    index
    proposer
    status
    preimage {
      proposer
      method
      hash
      proposedCall {
        method
        args
        description
        section
      }
    }
    description
    parentBountyIndex
    hash
    curator
    type
    threshold {
      ... on MotionThreshold {
        __typename
        value
      }
      ... on ReferendumThreshold {
        __typename
        type
      }
    }
    origin
    trackNumber
    end
    createdAt
    updatedAt
    delay
    endedAt
    deposit
    bond
    reward
    payee
    fee
    curatorDeposit
    proposalArguments {
      method
      args
      description
      section
    }
    voting(limit: 1, where: {voter_eq: $voter_eq}) {
      decision
    }
    group {
      proposals(limit: 10, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 10, orderBy: timestamp_ASC) {
          status
          timestamp
          block
        }
        index
        createdAt
        proposer
        preimage {
          proposer
        }
        hash
      }
    }
    statusHistory(limit: 10) {
      timestamp
      status
      block
    }
    tally {
      ayes
      bareAyes
      nays
      support
    }
  }
  tippersConnection(orderBy: createdAt_DESC, where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}) {
    totalCount
    edges {
      node {
        value
        tipper
        createdAt
        hash
        createdAtBlock
      }
    }
  }
  votesConnection(orderBy: blockNumber_DESC, where: {type_eq: Motion, proposal: {index_eq: $index_eq, type_eq: $type_eq}}) {
    totalCount
    edges {
      node {
        voter
        decision
      }
    }
  }
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $index_eq}) {
    totalCount
    edges {
      node {
        description
        index
        status
      }
    }
  }
}`;

export const GET_TOTAL_VOTES_COUNT = `
query TotalVotesCount($index_eq: Int = 0, $type_eq: VoteType = Referendum) {
  votesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, proposal: {index_eq: $index_eq}}) {
    totalCount
  }
}
`;

export const GET_TOTAL_CONVICTION_VOTES_COUNT = `
query TotalConvictionVotesCount($index_eq: Int = 50, $type_eq: VoteType = Referendum) {
  convictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, proposal: {index_eq: $index_eq}}) {
    totalCount
  }
}
`;

export const GET_VOTES_WITH_LIMIT = `
query VotesWithLimit($index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 100) {
  votes(where: {type_eq: $type_eq, proposal: {index_eq: $index_eq}}, limit: $limit, offset: 0) {
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

export const GET_VOTES_WITH_LIMIT_IS_NULL_TRUE = `
query VotesWithLimit($index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 100) {
  votes(where: {type_eq: $type_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}, limit: $limit, offset: 0) {
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

export const GET_CONVICTION_VOTES_WITH_REMOVED_IS_NULL = `
query ConvictionVotesWithRemovedIsNull($index_eq: Int = 0, $type_eq: VoteType = Referendum) {
  convictionVotes(where: {type_eq: $type_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true}, offset: 0) {
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

export const GET_PROPOSALS_BY_PROPOSER_ADDRESS = `
query ProposalsByProposerAddress($proposer_eq: String = "") {
  proposalsConnection(orderBy: id_ASC, where: {proposer_eq: $proposer_eq, type_in: [DemocracyProposal, TreasuryProposal]}) {
    edges {
      node {
        status
        createdAt
        index
        type
      }
    }
  }
}

`;

export const GET_ONCHAIN_POSTS_BY_PROPOSER_ADDRESSES = `
query ProposalsByProposerAddress($proposer_in: [String!]) {
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {proposer_in: $proposer_in}) {
    edges {
      node {
        status
        createdAt
        index
        type
        curator
        proposer
        preimage {
          method
          proposer
        }
        description
        proposalArguments {
          description
        }
        hash
        trackNumber
      }
    }
  }
}`;

export const GET_PREIMAGES_TABLE_QUERY = `query GetPreimages($limit: Int = 10, $offset: Int = 0) {
  preimagesConnection(orderBy: createdAtBlock_DESC) {
    totalCount
  }
  preimages(limit: $limit, offset: $offset, orderBy: createdAtBlock_DESC) {
    hash
    id
    length
    method
    section
    deposit
    proposedCall {
      args
      description
      method
      section
    }
    proposer
    status
    updatedAt
    updatedAtBlock
    createdAtBlock
    createdAt
  }
}
`;

export const VOTING_HISTORY_BY_VOTER_ADDRESS = `
query VotingHistoryByVoterAddress($offset: Int = 0, $limit: Int = 10, $voter_eq: String) {
  votes(limit: $limit, offset: $offset, orderBy: proposal_index_DESC, where: {voter_eq: $voter_eq}) {
    decision
    type
    blockNumber
    proposal {
      index
      type
    }
  }
  votesConnection(where: {voter_eq: $voter_eq}, orderBy: proposal_index_DESC) {
    totalCount
  }
}
`;

export const CONVICTION_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX = `
query ConvictionVotingHistoryByVoterAddressAndProposalTypeAndProposalIndex($offset: Int = 0, $limit: Int = 10, $voter_eq: String, $type_eq: ProposalType, $index_eq: Int) {
  convictionVotes(limit: $limit, offset: $offset, where: {voter_eq: $voter_eq, proposal: {type_eq: $type_eq, index_eq: $index_eq}, removedAt_isNull: true}, orderBy: createdAt_DESC) {
    type
    balance {
      ... on StandardVoteBalance {
        value
      }
      ... on SplitVoteBalance {
        nay
        aye
        abstain
      }
    }
    createdAt
    createdAtBlock
    decision
    lockPeriod
    voter
    delegatedVotes(limit: 1) {
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
  convictionVotesConnection(where: {voter_eq: $voter_eq, proposal: {type_eq: $type_eq, index_eq: $index_eq},removedAt_isNull: true}, orderBy: createdAt_DESC) {
    totalCount
  }
}
`;

export const VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX = `
query VotingHistoryByVoterAddressAndProposalTypeAndProposalIndex($offset: Int = 0, $limit: Int = 10, $voter_eq: String, $type_eq: ProposalType, $index_eq: Int) {
  votes(limit: $limit, offset: $offset, where: {voter_eq: $voter_eq, proposal: {type_eq: $type_eq, index_eq: $index_eq}}, orderBy: blockNumber_DESC) {
    type
    balance {
      ... on StandardVoteBalance {
        value
      }
      ... on SplitVoteBalance {
        nay
        aye
        abstain
      }
    }
    blockNumber
    decision
    lockPeriod
    timestamp
    voter
    proposal {
      index
      type
    }
  }
  votesConnection(where: {voter_eq: $voter_eq, proposal: {type_eq: $type_eq, index_eq: $index_eq}}, orderBy: blockNumber_DESC) {
    totalCount
  }
}
`;

export const MOONBEAM_VOTING_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_TYPE_AND_PROPOSAL_INDEX = `
query MoonbeamVotingHistoryByVoterAddressAndProposalTypeAndProposalIndex($offset: Int = 0, $limit: Int = 10, $voter_eq: String, $type_eq: ProposalType, $index_eq: Int) {
  votes(limit: $limit, offset: $offset, where: {voter_eq: $voter_eq, removedAtBlock_isNull: true, proposal: {type_eq: $type_eq, index_eq: $index_eq}}, orderBy: blockNumber_DESC) {
    type
    balance {
      ... on StandardVoteBalance {
        value
      }
      ... on SplitVoteBalance {
        nay
        aye
        abstain
      }
    }
    blockNumber
    decision
    lockPeriod
    timestamp
    voter
    proposal {
      index
      type
    }
  }
  votesConnection(where: {voter_eq: $voter_eq, removedAtBlock_isNull: true, proposal: {type_eq: $type_eq, index_eq: $index_eq}}, orderBy: blockNumber_DESC) {
    totalCount
  }
}
`;

export const VOTING_HISTORY_BY_VOTER_ADDRESS_MOONBEAM = `
query VotingHistoryByVoterAddressMoonbeam($offset: Int = 0, $limit: Int = 10, $voter_eq: String, $index_eq: Int, $type_eq: ProposalType) {
  convictionVotes(limit: $limit, offset: $offset, orderBy: proposal_index_DESC, where: {voter_eq: $voter_eq, removedAtBlock_isNull: true, proposal: {index_eq: $index_eq, type_eq: $type_eq}}) {
    decision
    type
    createdAtBlock
    createdAt
    isDelegated
    lockPeriod
    proposal {
      index
      type
    }
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
  convictionVotesConnection(where: {voter_eq: $voter_eq, removedAtBlock_isNull: true, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: proposal_index_DESC) {
    totalCount
  }
}
`;

export const ACTIVE_DELEGATIONS_TO_OR_FROM_ADDRESS_FOR_TRACK = `
query ActiveDelegationsToOrFromAddressForTrack($track_eq: Int = 0, $address: String = "") {
  votingDelegations(orderBy: createdAt_DESC, where: {track_eq: $track_eq, endedAtBlock_isNull: true, AND: {from_eq: $address, OR: {to_eq: $address}}}) {
    track
    to
    from
    lockPeriod
    balance
    createdAt
  }
  proposalsConnection(orderBy: id_ASC, where: {type_eq: ReferendumV2, status_in: [DecisionDepositPlaced, Submitted, Deciding, ConfirmStarted, ConfirmAborted], trackNumber_eq: $track_eq}) {
    totalCount
  }
}`;

export const RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS = `
query ReceivedDelgationsAndVotesCountForAddress($address: String = "", $createdAt_gte: DateTime) {
  votingDelegationsConnection(orderBy: createdAt_ASC, where: {to_eq: $address, endedAtBlock_isNull: true}) {
    totalCount
  }
  convictionVotesConnection(orderBy: id_ASC, where: {voter_eq: $address, proposal: {type_eq: ReferendumV2, createdAt_gte: $createdAt_gte}}) {
    totalCount
  }
}`;

// Alliance
export const GET_ALLIANCE_LATEST_ACTIVITY = `
query getAllianceLatestActivity($limit: Int = 10, $offset: Int = 0) {
  proposals(orderBy: createdAt_DESC, limit: $limit, offset: $offset) {
    id
    type
    createdAt
    status
    proposer
    hash
    index
    callData {
      method
    }
    statusHistory {
      block
      status
      timestamp
    }
  }
  proposalsConnection(orderBy: createdAt_DESC) {
    totalCount
  }
}
`;

export const GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE = `
query AlliancePostByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType = AllianceMotion, $voter_eq: String = "") {
  votesConnection(orderBy: blockNumber_DESC, where: {voter_eq: $voter_eq}) {
    totalCount
    edges {
      node {
        voter
        decision
      }
    }
  }
  proposalsConnection(orderBy: createdAtBlock_DESC) {
    totalCount
    edges {
      node {
        description
        index
        status
        proposalArgumentHash
      }
    }
  }
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    index
    proposer
    status
    description
    hash
    type
    threshold {
      ... on MotionThreshold {
        __typename
        value
      }
      ... on ReferendumThreshold {
        __typename
        type
      }
    }
    end
    createdAt
    updatedAt
    endedAt
    deposit
    voting {
      decision
      voter
    }
    tally {
      ayes
      bareAyes
      nays
      support
    }
    statusHistory {
      status
      timestamp
      block
    }
    callData {
      method
      args
      description
      section
    }
    announcement {
      statusHistory {
        id
        status
        timestamp
      }
      cid
      hash
      type
      createdAt
    }
  }
}
`;

export const GET_COLLECTIVE_FELLOWSHIP_POST_BY_INDEX_AND_PROPOSALTYPE = `query ProposalByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType = FellowshipReferendum, $vote_type_eq: VoteType = Fellowship) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    index
    proposer
    status
    preimage {
      proposer
      method
      hash
      proposedCall {
        method
        args
        description
        section
      }
    }
    description
    hash
    type
    threshold {
      ... on MotionThreshold {
        __typename
        value
      }
      ... on ReferendumThreshold {
        __typename
        type
      }
    }
    origin
    trackNumber
    end
    createdAt
    updatedAt
    delay
    endedAt
    deposit
    bond
    reward
    payee
    fee
    proposalArguments {
      method
      args
      description
      section
    }
    statusHistory(limit: 10) {
      timestamp
      status
      block
    }
    tally {
      ayes
      bareAyes
      nays
      support
    }
    enactmentAfterBlock
    enactmentAtBlock
    decisionDeposit {
      amount
      who
    }
    submissionDeposit {
      amount
      who
    }
    deciding {
      confirming
      since
    }
  }
  votesConnection(orderBy: blockNumber_DESC, where: {type_eq: $vote_type_eq, proposal: {index_eq: $index_eq, type_eq: $type_eq}}) {
    totalCount
    edges {
      node {
        voter
        decision
      }
    }
  }
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $index_eq}) {
    totalCount
    edges {
      node {
        description
        index
        status
      }
    }
  }
}
`;

export const GET_ALLIANCE_ANNOUNCEMENTS = `
query getAllianceAnnouncements( $limit: Int = 10, $offset: Int = 0 ) {
  announcements(limit: $limit, offset: $offset) {
    id
    code
    codec
    createdAt
    createdAtBlock
    hash
    index
    proposer
    type
    updatedAt
    version
    cid
    status
  }
  announcementsConnection(orderBy: id_ASC) {
    totalCount
  }
}
`;

export const GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE = `
query AllianceAnnouncementByCidAndType($cid_eq: String) {
  announcements(where: {cid_eq: $cid_eq}) {
    cid
    code
    codec
    version
    proposer
    index
    hash
    updatedAt
    proposal {
      index
      proposer
      status
      description
      hash
      type
      threshold {
        ... on MotionThreshold {
          __typename
          value
        }
        ... on ReferendumThreshold {
          __typename
          type
        }
      }
      end
      createdAt
      updatedAt
      endedAt
      deposit
      voting {
        decision
        voter
      }
      tally {
        ayes
        bareAyes
        nays
        support
      }
      statusHistory {
        status
        timestamp
        block
      }
    }
    status
    statusHistory {
      id
      status
      timestamp
    }
    createdAt
    type
    version
  }
}
`;

export const GET_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX = `
query ConvictionVotesListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 10, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
    isDelegated
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
    isDelegated
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
    isDelegated
    txnHash
  }
}
`;

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
    isDelegated
    txnHash
  }
}`;

export const GET_NESTED_CONVICTION_VOTES_FOR_ADDRESS_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX = `
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

export const GET_NESTED_CONVICTION_VOTES_LISTING_BY_TYPE_AND_INDEX = `
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
        delegatedVotes(limit: 5, orderBy: votingPower_DESC, where: {
          removedAtBlock_isNull: true
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
              abstain
            }
          }
        }
      }
}
`;

export const GET_NESTED_DELEGATED_CONVICTION_VOTES_LISTING_BY_VOTE_ID = `
query ConvictionVotesListingByTypeAndIndex(
  $index_eq: Int = 264,
  $type_eq: VoteType = ReferendumV2,
  $limit: Int = 10,
  $offset: Int = 0,
  $decision: VoteDecision = yes,
  $orderBy: [ConvictionDelegatedVotesOrderByInput!] = votingPower_DESC,
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
      delegatedVotes(limit: $limit, orderBy: $orderBy, offset: $offset, where:{
        removedAtBlock_isNull: true
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
        type_eq: $type_eq,
          delegatedTo:{
            voter_eq: $voter_eq,
            removedAtBlock_isNull: true
          }
      }) {
      totalCount
    }
  }
`;

export const GET_NESTED_CONVICTION_VOTES_LISTING_FOR_ADDRESS_BY_TYPE_AND_INDEX = `
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

export const GET_NESTED_CONVICTION_VOTES_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX = `
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

export const GET_DELEGATED_CONVICTION_VOTES_COUNT = `
query ConvictionDelegatedVotesCountAndBalance(
  $index_eq: Int = 109, 
  $decision: VoteDecision = yes, 
  $voter_eq: String = "", 
  $type_eq: VoteType) {
  convictionVotes(orderBy: id_ASC, where: {
    decision_eq: $decision, proposalIndex_eq: $index_eq,
    removedAtBlock_isNull: true, voter_eq: $voter_eq, type_eq: $type_eq}) {
    delegatedVotes(where: {removedAtBlock_isNull: true}) {
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
  convictionDelegatedVotesConnection(orderBy: id_ASC, where: {
    decision_eq: $decision, proposalIndex_eq: $index_eq, 
    removedAtBlock_isNull: true, delegatedTo: {
    voter_eq: $voter_eq, removedAtBlock_isNull: true, type_eq: $type_eq
  }}) {
    totalCount
  }
}
`;

export const GET_VOTE_HISTORY_IN_PROFILE = `
query VotesHistoryByVoter($type_eq: VoteType = ReferendumV2, $voter_in: [String!] , $limit: Int = 10, $offset: Int = 0, $orderBy: [FlattenedConvictionVotesOrderByInput!]) {
  flattenedConvictionVotes(where: {type_eq: $type_eq, voter_in: $voter_in, removedAtBlock_isNull: true}, limit: $limit, offset: $offset, orderBy: $orderBy) {
    type
    voter
    lockPeriod
    decision
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
    proposal {
      description
      createdAt
      index
      proposer
      status
      statusHistory {
        id
        status
      }
    }
    proposalIndex
    delegatedTo
    isDelegated
    parentVote {
      selfVotingPower
      type
      voter
      lockPeriod
      delegatedVotingPower
      delegatedVotes(where: {removedAtBlock_isNull: true}) {
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
        votingPower
      }
    }
  }
  flattenedConvictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, voter_in: $voter_in, removedAtBlock_isNull: true}) {
    totalCount
  }
}
`;
