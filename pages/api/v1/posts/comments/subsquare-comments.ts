// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { v4 as uuid } from 'uuid';

const urlMapper:any= {
	bounties: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/bounties/${id}/comments`,
	child_bounties: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/child-bounties/${id}/comments`,
	council_motions: (id: any, network: string) => `https://${network}.subsquare.io/api/motions/${id}/comments`,
	democracy_proposals: (id: any, network: string) => `https://${network}.subsquare.io/api/democracy/proposals/${id}/comments`,
	fellowship_referendums: (id: any, network: string) => `https://${network}.subsquare.io/api/fellowship/referenda/${id}/comments`,
	referendums: (id: any, network: string) => `https://${network}.subsquare.io/api/democracy/referendums/${id}/comments`,
	referendums_v2: (id: any, network: string) => `https://${network}.subsquare.io/api/gov2/referendums/${id}/comments`,
	tech_committee_proposals: (id: any, network: string) => `https://${network}.subsquare.io/api/tech-comm/motions/${id}/comments`,
	tips: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/tips/${id}/comments`,
	treasury_proposals: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/proposals/${id}/comments`
};

const getTrimmedUsername = (username:string) => {
	if(!username){
		return 'User...';
	}
	return username.length >= 8 ? username?.slice(0, 8) :username;
};

const getReactionUsers = (comment:any) => {
	return comment.reactions.map((rec:any) => {
		return rec.user?.address || '';
	});
};

const convertReply = (subSquareReply:any) => {
	return subSquareReply.map((reply:any) => ({
		content:reply.content,
		created_at:reply.createdAt,
		id:reply._id,
		reply_source:'subsquare',
		updated_at:reply.updatedAt,
		user_id:reply.user?.address || uuid(),
		username:getTrimmedUsername(reply.user?.username)
	}));
};

const convertDataToComment = (data:any[]) => {
	return data.map((comment:any) => {
		const users =getReactionUsers(comment);
		// console.log(getProfileWithAddress(comment.author?.address));
		return {
			comment_reactions: {
				'👍': {
					count: users.length,
					usernames: users
				},
				'👎': {
					count: 0,
					usernames: []
				}
			},
			comment_source:'subsquare',
			content:comment.content,
			created_at: comment.createdAt,
			id:comment._id,
			replies:convertReply(comment?.replies || []),
			updated_at:comment?.updatedAt,
			user_id:comment.author?.address || uuid(),
			username:getTrimmedUsername(comment.author?.username)
		};});
};

export const getSubSquareComments = async (proposalType:string,network:string, id:string | string[] | undefined) => {
	const url = urlMapper[proposalType]( id, network);
	try{
		const data = await (await fetch(url)).json();
		// console.log(data.items[0].author, data.items[1].author);
		return convertDataToComment(data.items);
	}catch(error){
		return [];
	}
};