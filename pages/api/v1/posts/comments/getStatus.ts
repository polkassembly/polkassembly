// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IReactions } from '../on-chain-post';
import { ICommentHistory } from '~src/types';

export interface IComment {
	user_id: number;
	content: string;
	created_at: Date;
	id: string;
	updated_at: Date;
	replies: any[];
	comment_reactions: IReactions;
	username: string;
	proposer?: string;
  sentiment?: number;
  comment_source?: 'polkassembly' | 'subsquare';
  history?: ICommentHistory[];
  spam_users_count?: number;
  is_custom_username?: boolean;
  profile?: any;
}

export function getStatus(type: string) {
	if (['DemocracyProposal'].includes(type)) {
		return 'Democracy Proposal';
	} else if ('TechCommitteeProposal' === type) {
		return 'Tech Committee Proposal';
	} else if ('TreasuryProposal' === type) {
		return 'Treasury Proposal';
	} else if (['Referendum', 'FellowshipReferendum', 'ReferendumV2'].includes(type)) {
		return 'Referendum';
	} else if (type === 'CouncilMotion') {
		return 'Motion';
	} else if (type === 'ChildBounty') {
		return 'Child Bounty';
	} else if (['Discussions', 'Grants'].includes(type)) {
		return type.substring(0, type.length - 1);
	}
	return type;
}
