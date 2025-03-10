export const GET_TOTAL_VOTES_FOR_PROPOSAL = `
query AllVotesForProposalIndex($type_eq: VoteType = ReferendumV2, $index_eq: Int  ) {
  flattenedConvictionVotes(where: {type_eq: $type_eq, proposalIndex_eq: $index_eq, removedAtBlock_isNull: true}, orderBy: voter_DESC) {
    type
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
}`;

export const GET_ALL_TRACK_PROPOSALS = `query ActiveTrackProposals($track_eq:Int!) {
  proposals(where: {trackNumber_eq: $track_eq}) {
    index
  }
}`;

export const GET_NEW_OPENGOV_PROPOSALS = `query GetNewOpenGovProposals($index_gt: Int) {
  proposals(where: { index_gt: $index_gt, type_eq: ReferendumV2 }) {
    index
    type
    proposer
    createdAt
    trackNumber
    status
  }
}
`;

