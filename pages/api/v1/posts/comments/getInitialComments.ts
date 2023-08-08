// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs, { Dayjs } from 'dayjs';
import { IReactions } from '../on-chain-post';
import { ICommentHistory } from '~src/types';
import { getPostComments } from './getCommentByPostId';
import { ProposalType, getFirestoreProposalType } from '~src/global/proposalType';

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
  profile?:string;
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

const COMMENT_SIZE = 5;

interface ITimeline {
	date: Dayjs;
	status: string;
	id: number;
	commentsCount: number;
	firstCommentId: string;
	index: string;
	type: string;
}
// of the Apache-2.0 license. See the LICENSE file for details.
export const getInitialComments = async (timeline:any, network:string ) => {
	if(!timeline){
		return;
	}
	const timelines:ITimeline[] = [];
	const comments:{[index:string]:IComment[]} ={};
	if (timeline && timeline.length > 0) {
		timeline.forEach((obj:any) => {
			timelines.push({
				commentsCount: obj.commentsCount,
				date: dayjs(obj?.created_at),
				firstCommentId: '',
				id: timelines.length + 1,
				index: obj?.index.toString(),
				status: getStatus(obj?.type),
				type:obj?.type
			});
			comments[obj?.index.toString()] = [];
		});
	}
	let currentTimeline: ITimeline | null = null;
	for(const data of timelines){
		if(data.commentsCount === 0){
			continue;
		}
		const postType = getFirestoreProposalType(data.type) as ProposalType;
		const lastDoc = comments[data.index][comments[data.index].length-1]?.id;
		const res = (await getPostComments({
			lastDocumentId: lastDoc,
			network,
			pageSize: COMMENT_SIZE,
			postId: data.index.toString(),
			postType
		})).data;
		comments[data.index] =res ? [...comments[data.index], ...res.comments] : comments[data.index];
		const timelinePayload = { ...data, firstCommentId: comments[data.index]?.[0]?.id || '' };
		currentTimeline = timelinePayload;
		if(Object.values(comments).flat().length >= COMMENT_SIZE) {
			break;
		}
	}
	return {
		comments,
		currentTimeline
	};
};