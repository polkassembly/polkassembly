// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const GET_CURVE_DATA_BY_INDEX = `
query CurveDataByIndex($index_eq: Int, $block_gte: Int, $limit: Int = 1000) {
  curveData(limit: $limit, where: {index_eq: $index_eq, block_gte: $block_gte}, orderBy: block_ASC) {
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
query ProposalsListingByType($type_in: [ProposalType!], $orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC, $limit: Int = 25, $offset: Int = 0, $index_in: [Int!], $hash_in: [String!], $trackNumber_in: [Int!], $status_in: [ProposalStatus!]) {
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
query ProposalsListingByType($type_in: [ProposalType!], $orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC, $limit: Int = 25, $offset: Int = 0, $index_in: [Int!], $hash_in: [String!], $trackNumber_in: [Int!], $status_in: [ProposalStatus!], $section_eq: String ) {
  proposalsConnection(orderBy: id_ASC, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in, preimage: {section_eq: $section_eq}}) {
    totalCount
  }
  proposals(orderBy: $orderBy, limit: $limit, offset: $offset, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in, preimage: {section_eq: $section_eq}}) {
    proposer
    curator
    createdAt
    updatedAt
    status
    statusHistory {
      id
    }
    proposalArguments{
      section
      method
      args
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
    reward
    trackNumber
    group {
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
export const GET_PROPOSALS_LISTING_BY_TYPE_FOR_ZEITGEIST = `
query ProposalsListingByType($type_in: [ProposalType!], $orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC, $limit: Int = 25, $offset: Int = 0, $index_in: [Int!], $hash_in: [String!], $trackNumber_in: [Int!], $status_in: [ProposalStatus!]) {
  proposalsConnection(orderBy: id_ASC, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    totalCount
  }
  proposals(orderBy: $orderBy, limit: $limit, offset: $offset, where: {type_in: $type_in, index_in: $index_in, hash_in: $hash_in, trackNumber_in: $trackNumber_in, status_in: $status_in}) {
    proposer
    proposalHashBlock
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
       type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
query PolymeshPrposalsQuery($type_in: [ProposalType!], $limit: Int = 25, $offset: Int = 0) {
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

export const GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES = `query ProposalsListingByTypeAndIndexes($type_eq: ProposalType, $limit: Int = 25, $index_in: [Int!], $status_in: [ProposalStatus!], $section_eq: String) {
  proposals(where: {type_eq: $type_eq, preimage: {section_eq: $section_eq}, index_in: $index_in, status_in: $status_in}, limit: $limit) {
    proposer
    curator
    createdAt
    updatedAt
    proposalArguments{
method
    section
    args}
    preimage {
      method
      proposer
      proposedCall {
        args
      }
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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

export const GET_PARENT_BOUNTY_REQUESTED_AMOUNT_FOR_CHILD_BOUNTY = `query ProposalsListingByTypeAndIndexes($type_eq: ProposalType = Bounty, $index_eq: Int!) {
proposals(where:{index_eq:$index_eq, type_eq:$type_eq }){
  reward
  index
}
}`;

export const GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES_FOR_ZEITGEIST = `query ProposalsListingByTypeAndIndexes($type_eq: ProposalType, $limit: Int = 25, $index_in: [Int!], $status_in: [ProposalStatus!]) {
  proposals(where: {type_eq: $type_eq, index_in: $index_in, status_in: $status_in}, limit: $limit) {
    proposer
    proposalHashBlock
    curator
    createdAt
    updatedAt
    preimage {
      method
      proposer
      proposedCall {
        args
      }
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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

export const GET_POLYMESH_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES = `query PolymeshPrposalsQuery($type_eq: ProposalType, $index_in: [Int!], $limit: Int = 25, $offset: Int = 0,$orderBy: [ProposalOrderByInput!] = createdAtBlock_DESC) {
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
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
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
          status
          block
          timestamp
        }
      }
    }
    statusHistory(limit: 25) {
      status
      timestamp
      block
    }
  }
}
`;

export const GET_PROPOSAL_BY_INDEX_AND_TYPE = `
query ProposalByIndexAndType($index_eq: Int, $hash_eq: String, $type_eq: ProposalType, $voter_eq: String = "", $vote_type_eq: VoteType) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, hash_eq: $hash_eq}) {
    index
    proposer
    status
    proposalArguments{
      args
      section
      method
    }
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
    statusHistory(limit: 25) {
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
}
`;

export const GET_PROPOSAL_BY_INDEX_FOR_ADVISORY_COMMITTEE = `query ProposalByIndexAndType($index_eq: Int, $proposalHashBlock_eq: String, $type_eq: ProposalType = DemocracyProposal, $voter_eq: String = "", $vote_type_eq: VoteType = Motion) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq, proposalHashBlock_eq: $proposalHashBlock_eq}) {
    index
    proposer
    status
    marketMetadata
    proposalHashBlock
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
    statusHistory(limit: 25) {
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
  tippersConnection(orderBy: createdAt_DESC, where: {proposal: {proposalHashBlock_eq: $proposalHashBlock_eq, type_eq: $type_eq}}) {
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
  votesConnection(orderBy: blockNumber_DESC, where: {type_eq: $vote_type_eq, proposal: {type_eq: $type_eq, AND: {index_eq: $index_eq, OR:{proposalHashBlock_eq:$proposalHashBlock_eq}}}}) {
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
    statusHistory(limit: 25) {
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
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty}) {
    totalCount
  }  
	proposals(orderBy: createdAtBlock_DESC, limit: $limit, offset: $offset, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty}) {
    description
    index
    status
    reward
  }
}
`;

export const GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX = `query ChildBountiesByParentIndex($parentBountyIndex_eq: Int, $curator_eq: String, $status_eq: ProposalStatus ) {
  proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty, curator_eq: $curator_eq, status_eq: $status_eq}) {
    totalCount
  }  
	proposals(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty, curator_eq: $curator_eq, status_eq: $status_eq}) {
    description
    index
    status
    reward
    createdAt
    curator
    payee
  }
}`;

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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
    statusHistory(limit: 25) {
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
query VotesListingByTypeAndIndex($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
query VotesListingByTypeAndIndex_With_RemovedAtBlockIsNull_True($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
query VotesListingForAddressByTypeAndIndex($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
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
query VotesListingForAddressByTypeAndIndex_With_RemovedAtBlockIsNull_True($orderBy: [VoteOrderByInput!] = timestamp_DESC, $index_eq: Int = 0, $type_eq: VoteType = Referendum, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
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
         group {
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
          status
          timestamp
          block
        }
        index
        createdAt
        proposer
        preimage {
        method
          proposer
          proposedCall{
          method
            args
          }
        }
        hash
      }
    }
        statusHistory {
          status
          block
          timestamp
        }
        createdAt
        index
        type
        curator
        proposer
        preimage {
          method
          proposer
           proposedCall{
            args
            method
          }
        }
        description
        proposalArguments {
          description
        }
        hash
        trackNumber
        tally {
          ayes
          bareAyes
          nays
          support
        }
      }
    }
  }
}`;

export const GET_PREIMAGES_TABLE_QUERY = `query GetPreimages($limit: Int = 25, $offset: Int = 0, $hash_contains:String) {
  preimagesConnection(orderBy: createdAtBlock_DESC, where: {hash_contains: $hash_contains}) {
    totalCount
  }
  preimages(limit: $limit, offset: $offset, orderBy: createdAtBlock_DESC, where: {hash_contains: $hash_contains}) {
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
export const GET_STATUS_HISTORY_BY_PREIMAGES_HASH = `
query GetStatusHistoryByPreImages($hash_in:[String!]) {
  statusHistories(where: {preimage_isNull: false, preimage: {hash_in: $hash_in}}) {
    extrinsicIndex
    preimage {
      hash
    }
    status
  }
}
`;

export const VOTING_HISTORY_BY_VOTER_ADDRESS = `
query VotingHistoryByVoterAddress($offset: Int = 0, $limit: Int = 25, $voter_eq: String) {
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
query ConvictionVotingHistoryByVoterAddressAndProposalTypeAndProposalIndex($offset: Int = 0, $limit: Int = 25, $voter_eq: String, $type_eq: ProposalType, $index_eq: Int) {
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
query VotingHistoryByVoterAddressAndProposalTypeAndProposalIndex($offset: Int = 0, $limit: Int = 25, $voter_eq: String, $type_eq: ProposalType, $index_eq: Int) {
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
query MoonbeamVotingHistoryByVoterAddressAndProposalTypeAndProposalIndex($offset: Int = 0, $limit: Int = 25, $voter_eq: String, $type_eq: ProposalType, $index_eq: Int) {
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
query VotingHistoryByVoterAddressMoonbeam($offset: Int = 0, $limit: Int = 25, $voter_eq: String, $index_eq: Int, $type_eq: ProposalType) {
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

export const ACTIVE_DELEGATIONS_TO_OR_FROM_ADDRESS_FOR_TRACK = `query ActiveDelegationsToOrFromAddressForTrack($track_eq: Int = 0, $address: String) {
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

export const RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS = `query ReceivedDelgationsAndVotesCountForAddress($address: String = "", $createdAt_gte: DateTime) {
  votingDelegations(orderBy: createdAt_ASC, where: {to_eq: $address, endedAtBlock_isNull: true}) {
    to 
    from
  }
  convictionVotesConnection(orderBy: id_ASC, where: {voter_eq: $address, proposal: {type_eq: ReferendumV2, createdAt_gte: $createdAt_gte}}) {
    totalCount
  }
}`;

// Alliance
export const GET_ALLIANCE_LATEST_ACTIVITY = `
query getAllianceLatestActivity($limit: Int = 25, $offset: Int = 0) {
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
    statusHistory(limit: 25) {
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
query getAllianceAnnouncements( $limit: Int = 25, $offset: Int = 0 ) {
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
query ConvictionVotesListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
query ConvictionVotesListingForAddressByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
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
query ConvictionVotesWithTxnHashListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
query ConvictionVotesForAddressWithTxnHashListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "",) {
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
query ConvictionVotesForAddressWithTxnHashListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "",) {
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
query ConvictionVotesListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
  $limit: Int = 25,
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
query ConvictionVotesListingForAddressByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes, $voter_eq: String = "") {
  convictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true, voter_eq: $voter_eq}) {
    totalCount
  }
  convictionVotes(orderBy: $orderBy, where: {type_eq: $type_eq, decision_eq: $decision_eq, proposal: {index_eq: $index_eq}, removedAtBlock_isNull: true, voter_eq: $voter_eq}, limit: $limit, offset: $offset) {
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

export const GET_NESTED_CONVICTION_VOTES_WITH_TXN_HASH_LISTING_BY_TYPE_AND_INDEX = `
query ConvictionVotesWithTxnHashListingByTypeAndIndex($orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC, $index_eq: Int = 0, $type_eq: VoteType = ReferendumV2, $limit: Int = 25, $offset: Int = 0, $decision_eq: VoteDecision = yes) {
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
query VotesHistoryByVoter($type_eq: VoteType = ReferendumV2, $voter_in: [String!] , $limit: Int = 25, $offset: Int = 0, $orderBy: [FlattenedConvictionVotesOrderByInput!]) {
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
    createdAt
    createdAtBlock
    proposal {
      description
      createdAt
      index
      proposer
      status
      type
      trackNumber
      statusHistory {
        id
        status
      }
    }
    proposalIndex
    delegatedTo
    isDelegated
    parentVote {
      extrinsicIndex
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

export const GET_VOTE_HISTORY_BY_VOTER_ADDRESS_AND_PROPOSAL_INDEX = `
query VotesHistoryByVoter($type_eq: VoteType = ReferendumV2, $voter_eq: String!, $proposalIndex: Int!, $limit: Int = 25, $offset: Int = 0, $orderBy: [FlattenedConvictionVotesOrderByInput!]) {
  flattenedConvictionVotes(where: {type_eq: $type_eq, voter_eq: $voter_eq, removedAtBlock_isNull: true, proposalIndex_eq: $proposalIndex}, limit: $limit, offset: $offset, orderBy: $orderBy) {
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
    createdAt
    createdAtBlock
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
  flattenedConvictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, voter_eq: $voter_eq, removedAtBlock_isNull: true, proposalIndex_eq: $proposalIndex}) {
    totalCount
  }
}
`;

// get similar proposals
export const GET_PROPOSAL_BY_STATUS_AND_TYPE = `query ProposalByStatusAndType($type_eq:ProposalType) {
  proposals(where: {type_eq: $type_eq, status_in: [Started,Deciding,Submitted, DecisionDepositPlaced, Active ]}, limit: 50) {
    index
    proposer
    status
    statusHistory {
      id
      status
    }
    type
    createdAt
    updatedAt
    trackNumber
  }
}`;

export const GET_PROPOSAL_ALLIANCE_ANNOUNCEMENT = `query getAllianceAnnouncements( $limit: Int = 50, $offset: Int = 0, $type_eq: AnnouncementType!, $index_not_eq: Int) {
  announcements(limit: $limit, offset: $offset, where:{status_not_in:[Rejected,Executed,TimedOut, Approved, Cancelled,ConfirmStarted, ConfirmAborted], type_eq: $type_eq, index_not_eq: $index_not_eq }, orderBy: createdAtBlock_DESC) {
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
    statusHistory {
      id
      status
    }
  }
}`;

export const GET_POSTS_LISTING_BY_TYPE_FOR_COLLECTIVE = `query ProposalsListingByType($limit: Int = 50, $offset: Int = 0,  $type_eq: ProposalType!, $index_not_eq: Int) {
  proposals(limit: $limit, offset: $offset, where: {status_not_in:[Rejected,Executed,TimedOut, Approved], type_deq: $type_eq, index_not_eq: $index_not_eq}, orderBy: createdAtBlock_DESC) {
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
}`;

export const GET_POSTS_LISTING_BY_TYPE = `query ProposalsListingByType( $limit: Int = 50, $type_eq: ProposalType!, $index_not_eq: Int) {
  proposals(limit: $limit, where:{status_in:[Started,Submitted,Deciding, DecisionDepositPlaced, ConfirmStarted, ConfirmAborted], type_eq:$type_eq, index_not_eq: $index_not_eq}, orderBy: createdAtBlock_DESC) {
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
     group {
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
    index
    end
    hash
    description
    type
    trackNumber
    statusHistory {
      status
    }
  }
}`;

export const GET_POSTS_LISTING_FOR_POLYMESH = `query PolymeshPrposalsQuery($type_eq: ProposalType, $limit: Int = 50, $index_not_eq: Int) {
  proposals(limit: $limit, where:{type_eq:$type_eq, status_in:[Proposed, Scheduled], index_not_eq: $index_not_eq}, orderBy: createdAtBlock_DESC) {
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
}`;

export const GET_AYE_NAY_TOTAL_COUNT = `query getAyeNayTotalCount($type_eq: ProposalType, $proposalIndex_eq: Int= 291) {
  aye: flattenedConvictionVotesConnection(orderBy: id_ASC, where: {
    decision_eq: yes, removedAtBlock_isNull: true,proposalIndex_eq:  $proposalIndex_eq,  proposal:{type_eq:$type_eq} }
  ) {
    totalCount
  }
  nay: flattenedConvictionVotesConnection(orderBy: id_ASC, where: {
    decision_eq: no, removedAtBlock_isNull: true, proposalIndex_eq:$proposalIndex_eq,  proposal:{type_eq:$type_eq}  }
  ) {
    totalCount
  }
  abstain: flattenedConvictionVotesConnection(orderBy: id_ASC, where: {
    decision_eq: abstain, removedAtBlock_isNull: true,  proposalIndex_eq:$proposalIndex_eq, proposal:{type_eq:$type_eq} }
  ) {
    totalCount
  }
}`;

export const TOTAL_PROPOSALS_AND_VOTES_COUNT_BY_ADDRESSES = `query MyQuery($addresses: [String!]) {
 totalVotes:flattenedConvictionVotesConnection(orderBy: id_ASC, where: {voter_in: $addresses, removedAtBlock_isNull: true}) {
    totalCount
},
  totalProposals: proposalsConnection(orderBy: createdAtBlock_DESC, where: {proposer_in: $addresses}) {
    totalCount
  }
}
`;

export const TOTAL_DELEGATATION_STATS = `query DelegationStats ($type_eq:DelegationType!=OpenGov){
 totalDelegatedVotes: convictionDelegatedVotesConnection(orderBy: id_ASC, where: {removedAtBlock_isNull: true}) {
    totalCount
  }
  votingDelegations(where: {endedAtBlock_isNull: true, type_eq:$type_eq}) {
    from
    to
    balance
    track
  }
}
`;

export const TOTAL_DELEGATE_BALANCE = `query DelegateBalance ($type_eq:DelegationType!= OpenGov, $to_in: [String!], $track_eq: Int!){
  votingDelegations(where: {endedAtBlock_isNull: true, type_eq:$type_eq, to_in: $to_in, track_eq: $track_eq}) {
    to
    balance
    lockPeriod
     }
}`;

export const GET_TOTAL_VOTES_FOR_PROPOSAL = `
query AllVotesForProposalIndex($type_eq: VoteType = ReferendumV2, $index_eq: Int  ) {
  flattenedConvictionVotes(where: {type_eq: $type_eq, proposalIndex_eq: $index_eq, removedAtBlock_isNull: true}, orderBy: voter_DESC) {
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
    createdAt
    createdAtBlock
    proposalIndex
    delegatedTo
    isDelegated
    parentVote {
      extrinsicIndex
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
  flattenedConvictionVotesConnection(orderBy: id_ASC, where: {type_eq: $type_eq, proposalIndex_eq: $index_eq, removedAtBlock_isNull: true}) {
    totalCount
  }
}`;

export const GET_NETWORK_TRACK_ACTIVE_PROPOSALS_COUNT = `query getNetworkTrackActiveProposalsCount {
  proposals(where:{type_eq:ReferendumV2, status_in:[Started, DecisionDepositPlaced, Deciding,Submitted, ConfirmStarted]}){
    trackNumber
  } 
  all: proposalsConnection(where:{type_eq:ReferendumV2, status_in:[Started, DecisionDepositPlaced, Deciding,Submitted, ConfirmStarted]} , orderBy:id_ASC){
    totalCount
  }
 bountiesCount: proposalsConnection(where:{type_in:Bounty, status_in:[Active, Proposed, Extended]}, orderBy:id_ASC) {
    totalCount
  }
   childBountiesCount: proposalsConnection(where:{type_eq:ChildBounty, status_in:[Awarded,Added, Active]}, orderBy:id_ASC) {
    totalCount
  }
}
`;

export const GOV1_NETWORK_ACTIVE_PROPOSALS_COUNT = `query gov1ActiveProposalsCount {
 bounties: proposalsConnection(where:{type_in:Bounty, status_in:[Active, Proposed, Extended]}, orderBy:id_ASC) {
    totalCount
  }
   childBounties: proposalsConnection(where:{type_eq:ChildBounty, status_in:[Awarded,Added, Active]}, orderBy:id_ASC) {
    totalCount
  }
  councilMotions: proposalsConnection(where:{type_eq:CouncilMotion, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  democracyProposals:proposalsConnection(where:{type_eq:DemocracyProposal, status_in:[Proposed ]}, orderBy:id_ASC) {
    totalCount
  }
  referendums:proposalsConnection(where:{type_eq:Referendum, status_in:[Submitted, Started, ConfirmStarted,Deciding]}, orderBy:id_ASC) {
    totalCount
  }
  tips: proposalsConnection(where:{type_eq:Tip, status_in:[Opened]}, orderBy:id_ASC) {
    totalCount
  }
  treasuryProposals: proposalsConnection(where:{type_eq:TreasuryProposal, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  techCommetteeProposals: proposalsConnection(where:{type_eq:TechCommitteeProposal, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  } 
}`;

export const ZEITGEIST_NETWORK_ACTIVE_PROPOSALS_COUNT = `
query zeitgeistActiveProposalsCount {
  councilMotions: proposalsConnection(where:{type_eq:CouncilMotion, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  democracyProposals:proposalsConnection(where:{type_eq:DemocracyProposal, status_in:[Proposed ]}, orderBy:id_ASC) {
    totalCount
  }
  referendums:proposalsConnection(where:{type_eq:Referendum, status_in:[Submitted, Started, ConfirmStarted,Deciding]}, orderBy:id_ASC) {
    totalCount
  }
  tips: proposalsConnection(where:{type_eq:Tip, status_in:[Opened]}, orderBy:id_ASC) {
    totalCount
  }
  treasuryProposals: proposalsConnection(where:{type_eq:TreasuryProposal, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  techCommitteeProposals:  proposalsConnection(where:{type_eq:TechCommitteeProposal, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  advisoryCommitteeMotions:proposalsConnection(where:{type_eq:AdvisoryCommittee, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
}`;

export const POLYMESH_NETWORK_ACTIVE_PROPOSALS_COUNT = `
query polymeshActiveProposalsCount {
  communityPips: proposalsConnection(where:{type_eq:Community, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  technicalPips: proposalsConnection(where:{type_eq:TechnicalCommittee, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
  upgradePips: proposalsConnection(where:{type_eq:UpgradeCommittee, status_in:[Proposed]}, orderBy:id_ASC) {
    totalCount
  }
}
`;
export const GET_TRACK_LEVEL_ANALYTICS_STATS = `
query getTrackLevelAnalyticsStats($track_num: Int! = 0, $before: DateTime) {
diffActiveProposals: proposalsConnection(where: { trackNumber_eq: $track_num, status_not_in: [Cancelled, TimedOut, Confirmed, Approved, Rejected, Executed, Killed, ExecutionFailed], createdAt_gt:$before }, orderBy: id_ASC){
    totalCount
}
  diffProposalCount:  proposalsConnection(where: { trackNumber_eq: $track_num, createdAt_gt: $before}, orderBy: id_ASC){
    totalCount
}
  totalActiveProposals: proposalsConnection(where: { trackNumber_eq: $track_num, status_not_in: [Cancelled, TimedOut, Confirmed, Approved, Rejected, Executed, Killed, ExecutionFailed] }, orderBy: id_ASC){
    totalCount
}
  totalProposalCount:  proposalsConnection(where: { trackNumber_eq: $track_num}, orderBy: id_ASC){
    totalCount
}
}`;
export const GET_ALL_TRACK_LEVEL_ANALYTICS_STATS = `
query getTrackLevelAnalyticsStats($before: DateTime ="2024-02-01T13:21:30.000000Z") {
diffActiveProposals: proposalsConnection(where: { status_not_in: [Cancelled, TimedOut, Confirmed, Approved, Rejected, Executed, Killed, ExecutionFailed], createdAt_gt:$before, type_eq: ReferendumV2 }, orderBy: id_ASC){
    totalCount
}
  diffProposalCount:  proposalsConnection(where: {  createdAt_gt: $before, type_eq: ReferendumV2}, orderBy: id_ASC ){
    totalCount
}
  totalActiveProposals: proposalsConnection(where: {status_not_in: [Cancelled, TimedOut, Confirmed, Approved, Rejected, Executed, Killed, ExecutionFailed], type_eq: ReferendumV2  }, orderBy: id_ASC){
    totalCount
}
  totalProposalCount:  proposalsConnection( orderBy: id_ASC,where:{ type_eq: ReferendumV2} ){
    totalCount
}
}`;

export const GET_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA = `
query DelegationStats ($track_num:Int!){
  votingDelegations(where: {endedAtBlock_isNull: true, type_eq:OpenGov, track_eq: $track_num}) {
    from
    to
    balance
    lockPeriod
  }
}`;

export const GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA = `query DelegationStats($address: String){
  votingDelegations(where: {endedAtBlock_isNull: true, type_eq:OpenGov, to_eq: $address}) {
    from
    to
    balance
    lockPeriod
    track
  }
}
`;

export const GET_TALLY_FOR_POST = `
query MyQuery($index_eq:Int!, $type: ProposalType = ReferendumV2) {
  proposals(where:{index_eq:$index_eq, type_eq: $type }){
    tally{
      ayes
      nays
      support
      bareAyes
    }
  }
}
`;

export const GET_TOTAL_APPROVED_PROPOSALS = `
query MyQuery {
  proposalsConnection(where: {status_in:[Confirmed,Executed,Approved], type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount
  }
}
`;

export const GET_TOTAL_CATEGORY_PROPOSALS = `
query MyQuery ($Indexes: [Int!]){
  count:proposalsConnection(where: {trackNumber_in:$Indexes, type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount
  }
}
`;

export const GET_STATUS_WISE_REF_OUTCOME = `
query MyQuery ($trackNo: Int){
  timeout:proposalsConnection(where: {status_in:[TimedOut], trackNumber_eq: $trackNo, type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount
  }
  ongoing:proposalsConnection(where: {status_in:[DecisionDepositPlaced,Deciding,ConfirmAborted,ConfirmStarted, Submitted], trackNumber_eq: $trackNo, type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount
  }
   approved:proposalsConnection(where: {status_in:[Executed,Approved, Confirmed], trackNumber_eq: $trackNo, type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount

  }
   rejected:proposalsConnection(where: {status_in:[Rejected,Killed,ExecutionFailed], trackNumber_eq: $trackNo, type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount

  }
  cancelled:proposalsConnection(where: {status_in:[Cancelled, ConfirmAborted], trackNumber_eq: $trackNo, type_eq: ReferendumV2}, orderBy: id_ASC){
    totalCount

  }
}
`;

export const GET_ACTIVE_BOUNTIES_WITH_REWARDS = `
  query Rewards {
    proposals(where: {type_eq: Bounty, status_in: [Active, CuratorUnassigned, Extended]}) {
      index
      reward
    }
  }
`;

export const GET_AWARDED_CHILD_BOUNTIES_REWARDS_FOR_PARENT_BOUNTY_INDICES = `
query AwardedChildBounties($parentBountyIndex_in: [Int!]) {
		proposals(where: {type_eq: ChildBounty, parentBountyIndex_in: $parentBountyIndex_in, statusHistory_some: {status_eq: Awarded}}) {
			reward
		}
	}
`;

export const GET_CLAIMED_CHILD_BOUNTIES_PAYEES_AND_REWARD_FOR_PARENT_BOUNTY_INDICES = `
query ClaimedChildBountiesForParentBountyIndices($parentBountyIndex_in: [Int!]) {
  proposals(where: {type_eq: ChildBounty, parentBountyIndex_in: $parentBountyIndex_in, statusHistory_some: {status_eq: Claimed}}, orderBy: id_DESC, limit: 25) {
    payee
    reward
    statusHistory(where: {status_eq: Claimed}) {
      timestamp
    }
  }
}
`;

export const GET_BOUNTY_PROPOSER_BY_INDEX = `
query MyQuery($index_eq: Int!) {
  proposals(where: {type_eq: Bounty, index_eq: $index_eq}) {
    proposer
    reward
  }
}
`;

export const GET_BOUNTY_PROPOSALS = `
query BountyProposals($status_in: [ProposalStatus!] = []) {
  proposals(where: {type_eq: ReferendumV2, preimage: {section_eq: "Bounties"}, status_in: $status_in}, orderBy: createdAtBlock_DESC) {
    index
    proposer
    status
    trackNumber
    preimage {
      proposedCall {
        args
      }
    }
  }
}
`;

export const GET_ALL_BOUNTIES = `query BountyProposals ($limit: Int! =10, $offset:Int =0, $status_in: [ProposalStatus!], $index_in:[Int!], $curator_eq: String) {
 bounties: proposals(where: {type_eq: Bounty, status_in:$status_in, index_in:$index_in, curator_eq: $curator_eq}, orderBy: createdAtBlock_DESC,limit:$limit,offset: $offset) {
    index
    proposer
    reward
    createdAt
    updatedAt
    curator
    hash
    status
    preimage {
      proposedCall {
        args
      }
    }
      payee
  }
  
 totalBounties: proposalsConnection(where: {curator_eq: $curator_eq, type_eq:Bounty, status_in: $status_in, index_in: $index_in}, orderBy: createdAtBlock_DESC) {
   totalCount
  }
}`;

export const GET_BOUNTY_REWARDS_BY_IDS = `
query Rewards($index_in: [Int!] = []) {
  proposals(where: {type_eq: Bounty, index_in: $index_in}) {
    index
    reward
  }
}
`;

export const GET_ALL_BOUNTIES_WITHOUT_PAGINATION = `query BountyProposals ($status_in: [ProposalStatus!], $index_in:[Int!], $curator_eq: String) {
 bounties: proposals(where: {type_eq: Bounty, status_in:$status_in, index_in:$index_in, curator_eq: $curator_eq}, orderBy: createdAtBlock_DESC) {
    index
    proposer
    reward
    createdAt
    updatedAt
    curator
    hash
    status
    preimage {
      proposedCall {
        args
      }
    }
      payee
  }
  
 totalBounties: proposalsConnection(where: {curator_eq: $curator_eq, type_eq:Bounty, status_in: $status_in, index_in: $index_in}, orderBy: createdAtBlock_DESC) {
   totalCount
  }
}
`;

export const NON_VOTED_OPEN_GOV_ACTIVE_PROPOSALS = `query MyQuery ($status_in: [ProposalStatus!] =[DecisionDepositPlaced, Submitted, Deciding, ConfirmStarted, ConfirmAborted] , $type_eq: ProposalType = ReferendumV2, $addresses:[String!], $index_not_in: [Int!]  ){
  proposals(where: {status_in: $status_in, convictionVoting_none:{voter_in: $addresses}, type_eq: $type_eq, index_not_in:$index_not_in}, limit: 25, offset:0, orderBy: index_DESC){
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
    proposalArguments {
      method
      args
      description
      section
    }
    statusHistory(limit: 25) {
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
  }
proposalsConnection(where: {status_in: $status_in, convictionVoting_none:{voter_in: $addresses}, type_eq: $type_eq, index_not_in:$index_not_in} orderBy: index_DESC,){
  totalCount
}
}`;

export const ACTIVE_PROPOSALS_FROM_PROPOSALS_INDEXES = `query MyQuery ($status_in: [ProposalStatus!] =[DecisionDepositPlaced, Submitted, Deciding, ConfirmStarted, ConfirmAborted] , $type_eq: ProposalType = ReferendumV2, $index_in:[Int!]){
  proposals(where: {status_in: $status_in,type_eq: $type_eq,index_in:$index_in}, limit: 25, offset:0, orderBy: index_DESC){
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
    proposalArguments {
      method
      args
      description
      section
    }
    statusHistory(limit: 25) {
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
  }
}`;

export const GET_DELEGATED_DELEGATION_ADDRESSES = `query ActiveDelegationsToOrFromAddressForTrack($address: String) {
  votingDelegations(orderBy: createdAt_DESC, where: { endedAtBlock_isNull: true, AND: {from_eq: $address}}) {
    to
    from
}
}`;

export const CHECK_IF_OPENGOV_PROPOSAL_EXISTS = `query CheckIfOpenGovProposalExists ($proposalIndex: Int!, $type_eq: ProposalType){
  proposals(orderBy: id_ASC, where:{index_eq: $proposalIndex, type_eq: $type_eq}){
    proposer
    index
    createdAt
    updatedAt
    type
    trackNumber
  }
}`;

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
            parentVote {
                extrinsicIndex
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
    }`;

export const GET_WHALE = `query ActiveVoterQuery($voterAddresses: [String!]) {
        flattenedConvictionVotes(
            where: { voter_in: $voterAddresses, removedAtBlock_isNull: true }
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
  }}`;

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

export const GET_VOTES_COUNT_FOR_TIMESPAN = `query ReceivedDelgationsAndVotesCountForAddress($address: String = "", $createdAt_gte: DateTime) {
  convictionVotesConnection(orderBy: id_ASC, where: {voter_eq: $address, proposal: {type_eq: ReferendumV2, createdAt_gte: $createdAt_gte}}) {
    totalCount
  }
}`;

export const GET_VOTES_COUNT_FOR_TIMESPAN_FOR_ADDRESS = `query MyQuery($voteType: VoteType!, $createdAt_gt: DateTime!, $addresses: [String!]!) {
  flattenedConvictionVotesConnection(
    orderBy: id_ASC, 
    where: {
      type_eq: $voteType, 
      voter_in: $addresses, 
      removedAtBlock_isNull: true, 
      createdAt_gt: $createdAt_gt
    }
  ) {
    totalCount
  }
}`;

export const GET_SUBSCRIBED_POSTS = `query Subscribed_Posts($type_eq: ProposalType , $ids: [Int!], $voter_in: [String!] ) {
  proposals(where: {type_eq: $type_eq, index_in: $ids}) {
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
    group {
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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
    statusHistory(limit: 25) {
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
    voting(limit: 1, where: {voter_in: $voter_in}) {
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
      voter
      lockPeriod
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
}
`;

export const GET_ALL_ACTIVE_PROPOSAL_FOR_EXPLORE_FEED = `query ProposalsListingByTypeAndIndexes($type_eq: ProposalType=ReferendumV2, $status_in: [ProposalStatus!]=[DecisionDepositPlaced, Submitted, Deciding, ConfirmStarted, ConfirmAborted]) {
  proposals(where: {type_eq: $type_eq,status_in: $status_in}) {
    proposer
    curator
    createdAt
    updatedAt
    proposalArguments{
method
    section
    args}
    preimage {
      method
      proposer
      proposedCall {
        args
      }
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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

export const VOTED_PROPOSAL_BY_PROPOSAL_INDEX_AND_VOTERS = `query MyQuery ( $type_eq: VoteType, $indexes_in: [Int!], $voter_in:[String!]  ) {
  flattenedConvictionVotes(where:{type_eq:$type_eq , proposalIndex_in:$indexes_in, voter_in:$voter_in, removedAtBlock_isNull:true}){
    proposalIndex
  }
}
`;

export const GET_TOTAL_VOTE_COUNT_ON_PROPOSAL = `query MyQuery ( $type_eq: VoteType!, $index_eq: Int) {
flattenedConvictionVotesConnection(where:{type_eq:$type_eq , proposalIndex_eq: $index_eq, removedAtBlock_isNull:true}, orderBy: id_ASC){
    totalCount
  }
}
`;

export const ACTIVE_PROPOSALS_FROM_INDEXES = `query ProposalsListingByTypeAndIndexes($type_eq: ProposalType=ReferendumV2, $status_in: [ProposalStatus!]=[DecisionDepositPlaced, Submitted, Deciding, ConfirmStarted, ConfirmAborted], $indexes_in:[Int!]) {
  proposals(where: {type_eq: $type_eq, status_in: $status_in, index_in: $indexes_in}) {
    proposer
    curator
    createdAt
    updatedAt
    proposalArguments{
method
    section
    args}
    preimage {
      method
      proposer
      proposedCall {
        args
      }
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
      proposals(limit: 25, orderBy: createdAt_ASC) {
        type
        statusHistory(limit: 25, orderBy: timestamp_ASC) {
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

export const GET_ACTIVE_PROPOSAL_INDEXES_FOR_TIMESPAN = `query MyQuery($createdAt_gte: DateTime!, $type: ProposalType, $status_in: [ProposalStatus!]) {
  proposals(where: {status_in: $status_in, createdAt_gte:  $createdAt_gte, type_eq: $type}){
    index
  }
}
`;

export const GET_VOTE_COUNT_FROM_PROPOSAL_INDEXES = `
query MyQuery($type: VoteType, $voter_in:[String!], $proposalIndexes: [Int!] ) {
  flattenedConvictionVotesConnection(orderBy: id_ASC, where:
    {proposal:{index_in: $proposalIndexes},
    type_eq: $type, removedAtBlock_isNull: true,
    voter_in: $voter_in}) {
    totalCount
  }
}
`;

export const GET_PROPOSER_BY_ID_AND_TYPE = `
query ProposerByIndexAndType($index_eq: Int = 10, $type_eq: ProposalType = DemocracyProposal) {
  proposals(where: {index_eq: $index_eq, type_eq: $type_eq}) {
    index
    proposer
    preimage {
      proposer
    }
  }
}
`;

export const GET_CONVICTION_VOTERS_BY_PROPOSAL_ID_AND_TYPE = `
query ConvictionVoteVoters($index_eq: Int = 0, $type_eq: ProposalType = ReferendumV2, $offset: Int = 0) {
  convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}}, limit: 500, offset: $offset) {
    voter
  }
}
`;

export const GET_VOTERS_BY_PROPOSAL_ID_AND_TYPE = `
query Voters($index_eq: Int = 10, $type_eq: ProposalType = DemocracyProposal, $offset: Int = 0) {
  votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}}, limit: 500, offset: $offset) {
    voter
  }
}
`;

export const GET_TIP_VALUE_AND_PAYEE_BY_PROPOSAL_ID_AND_TYPE = `
query TipPayee($index_eq: Int!, $type_eq: ProposalType!) {
  proposals(where: {index_eq: $index_eq, type_eq: $type_eq}) {
    payee,
    reward,
    createdAt
  }
}
`;

export const GET_TIP_PAYEE_AND_ALL_TIPPER_COUNTS = `
query TipperCounts($tipper_eq: String!, $payee_eq: String!) {
  tippersConnection(where: {tipper_eq: $tipper_eq, proposal: {payee_eq: $payee_eq}}, orderBy: id_ASC) {
    totalCount
  }
  allTipsConnection: tippersConnection(where: {tipper_eq: $tipper_eq}, orderBy: id_ASC) {
    totalCount
  }
}
`;

export const GET_FOREIGN_DECISION_DEPOSIT_PLACED_COUNT = `
query ForeignDecisionDepositPlacedCount($address: String!) {
  proposalsConnection(orderBy: id_ASC, where: {decisionDeposit: {who_eq: $address}, proposer_not_eq: $address}) {
    totalCount,
    edges {
      node {
        createdAt
      }
    }
  }
}
`;

export const GET_FIRST_AND_CURRENT_CONVICTION_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE = `
query GetFirstAndCurrentConvictionVoteTimestamp($index_eq: Int!, $type_eq: ProposalType!, $voter_eq: String!) {
  firstVoteTimestamp: convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: createdAt_ASC, limit: 1) {
    createdAt
  }

  currentVoteTimestamp: convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, voter_eq: $voter_eq}, orderBy: createdAt_DESC, limit: 1) {
    createdAt
  }
}
`;

export const GET_FIRST_AND_CURRENT_VOTE_TIMESTAMP_BY_PROPOSAL_ID_AND_TYPE = `
query GetFirstAndCurrentVoteTimestamp($index_eq: Int!, $type_eq: ProposalType!, $voter_eq: String!) {
  firstVoteTimestamp: votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_DESC, limit: 1) {
    createdAt: timestamp
  }

  currentVoteTimestamp: votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, voter_eq: $voter_eq}, orderBy: id_DESC, limit: 1) {
    createdAt: timestamp
  }
}
`;

export const GET_PROPOSAL_ENDED_INFO = `
query GetProposalStatus($index_eq: Int!, $type_eq: ProposalType!) {
  proposals(where: {index_eq: $index_eq, type_eq: $type_eq}) {
    status,
    endedAt
  }
}
`;

export const GET_PROPOSAL_CREATED_AT = `
query GetProposalCreatedAt($index_eq: Int!, $type_eq: ProposalType!) {
  proposals(where: {index_eq: $index_eq, type_eq: $type_eq}) {
    createdAt
  }
}
`;

export const GET_VOTE_CREATED_AT = `
query GetVoteCreatedAt($index_eq: Int!, $type_eq: ProposalType!, $voter_address_eq: String!) {
  votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, voter_address_eq: $voter_address_eq}) {
    createdAt
  }
}
`;

export const GET_CONVICTION_VOTE_CREATED_AT = `
 query GET_CONVICTION_VOTE_CREATED_AT($index_eq: Int!, $type_eq: ProposalType!, $voter_address_eq: String!) {
  convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, voter_address_eq: $voter_address_eq}) {
    createdAt
  }
}
`;

export const GET_SENT_CURATOR_REQUESTS = `query GET_SENT_CURATOR_REQUESTS($address: String, $limit:Int, $offset: Int, $type_eq:ProposalType){
proposals(where: {proposer_eq: $address, status_eq:CuratorProposed, type_eq:$type_eq} ,offset:$offset,limit:$limit){
    index
    status
    proposer
    curator
    reward
    createdAt
    type
    proposer
    payee
    parentBountyIndex
  }
    proposalsConnection(where: {proposer_eq: $address, status_eq:CuratorProposed, type_eq:$type_eq} ,orderBy: id_ASC){
   totalCount
  }
}`;

export const GET_RECEIVED_CURATOR_REQUESTS = `query GET_RECEIVED_CURATOR_REQUESTS($address: String, $limit:Int, $offset: Int, $type_eq:ProposalType){
proposals(where: {curator_eq: $address, status_eq:CuratorProposed, type_eq:$type_eq} ,offset:$offset,limit:$limit){
    index
    status
    proposer
    curator
    reward
    createdAt
    type
    proposer
    payee
    parentBountyIndex
  }
    proposalsConnection(where: {curator_eq: $address, status_eq:CuratorProposed, type_eq:$type_eq} ,orderBy: id_ASC){
   totalCount
  }
}`;

export const GET_CURATOR_RECIVED_SENT_COUNT = `query GET_CURATOR_RECIVED_SENT_COUNT($address: String){
bounties:proposalsConnection(where: {AND:{proposer_eq: $address, OR: {curator_eq:$address}}, status_eq:CuratorProposed, type_eq:Bounty}, orderBy:id_ASC ){
  totalCount
}
  childBounties:proposalsConnection(where: {AND:{proposer_eq: $address, OR: {curator_eq:$address}}, status_eq:CuratorProposed, type_eq:ChildBounty}, orderBy:id_ASC ){
  totalCount
    edges{
      node{
        index
        proposer
        curator
      }
    }
}
}
`;
