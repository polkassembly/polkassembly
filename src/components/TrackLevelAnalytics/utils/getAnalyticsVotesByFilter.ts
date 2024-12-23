// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ETrackLevelAnalyticsFilterBy, IAnalyticsVoteTrends } from '../types';

const getAnalyticsVotesByFilter = (votes: IAnalyticsVoteTrends[], filterBy: ETrackLevelAnalyticsFilterBy) => {
	switch (filterBy) {
		case ETrackLevelAnalyticsFilterBy.CONVICTION_VOTES:
			return votes.map((item) => item?.convictionVotes);
		case ETrackLevelAnalyticsFilterBy.ACCOUNTS:
			return votes.map((item) => item?.accounts);
		case ETrackLevelAnalyticsFilterBy.VOTE_AMOUNT:
			return votes.map((item) => item?.voteAmount);
	}
};

export default getAnalyticsVotesByFilter;
