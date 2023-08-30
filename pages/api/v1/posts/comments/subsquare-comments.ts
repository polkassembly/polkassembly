// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import { v4 as uuid } from 'uuid';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { ProposalType } from '~src/global/proposalType';
import { getProfileWithAddress } from '../../auth/data/profileWithAddress';
import fetchWithTimeout from '~src/api-utils/timeoutFetch';

const urlMapper: any = {
	[ProposalType.BOUNTIES]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/bounties/${id}/comments`,
	[ProposalType.CHILD_BOUNTIES]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/child-bounties/${id}/comments`,
	[ProposalType.COUNCIL_MOTIONS]: (id: any, network: string) => `https://${network}.subsquare.io/api/motions/${id}/comments`,
	[ProposalType.DEMOCRACY_PROPOSALS]: (id: any, network: string) => `https://${network}.subsquare.io/api/democracy/proposals/${id}/comments`,
	[ProposalType.FELLOWSHIP_REFERENDUMS]: (id: any, network: string) => `https://${network}.subsquare.io/api/fellowship/referenda/${id}/comments`,
	[ProposalType.REFERENDUMS]: (id: any, network: string) => `https://${network}.subsquare.io/api/democracy/referendums/${id}/comments`,
	[ProposalType.REFERENDUM_V2]: (id: any, network: string) => `https://${network}.subsquare.io/api/gov2/referendums/${id}/comments`,
	[ProposalType.TECH_COMMITTEE_PROPOSALS]: (id: any, network: string) => `https://${network}.subsquare.io/api/tech-comm/motions/${id}/comments`,
	[ProposalType.TIPS]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/tips/${id}/comments`,
	[ProposalType.TREASURY_PROPOSALS]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/proposals/${id}/comments`
};

const getTrimmedUsername = (username?: string) => {
	if (!username) {
		return uuid().split('-').join('').substring(0, 25);
	}
	return username.length >= 25 ? username?.slice(0, 25) : username;
};

const getReactionUsers = (reactions: any) => {
	return reactions.map((rec: any) => {
		return rec.user?.address || '';
	});
};

const extractContent = async (markdownContent: string, network: any) => {
	let updatedContent = markdownContent;
	const matches = markdownContent.match(/\[(.*?)\]\((.*?)\)/g);

	if (matches) {
		const promises = matches.map(async (match) => {
			const [label, addressWithNetwork] = match.substring(1, match.length - 1).split('](');
			if (label.startsWith('@')) {
				const address = addressWithNetwork.split('-')[0]; // splitting the address and network
				const { data, error } = await getProfileWithAddress({ address: address });
				if (data && !error) {
					const link = `https://${network}.polkassembly.io/user/${data?.username}`;
					updatedContent = updatedContent.replace(match, `[${label}](${link})`);
				} else {
					const link = `https://${network}.polkassembly.io/address/${address}`;
					updatedContent = updatedContent.replace(match, `[${label}](${link})`);
				}
			}
		});
		await Promise.allSettled(promises);
	}
	return updatedContent;
};

const convertReply = async (subSquareReply: any, network: any) => {
	const res = [];
	for (const reply of subSquareReply) {
		if(reply.content.trim()){
			const content = await extractContent(reply.content, network);
			res.push({
				content,
				created_at: reply.createdAt,
				id: reply._id,
				proposer: reply.author?.address || '',
				reply_source: 'subsquare',
				updated_at: reply.updatedAt,
				user_id: getTrimmedUsername(),
				username: getTrimmedUsername(reply.author?.username)
			});
		}
	}
	return res;
};

const convertDataToComment = async (data: any[], network: string | string[] | undefined) => {
	const res = [];
	for (const comment of data) {
		const reactionUsers = getReactionUsers(comment.reactions);
		const replies = await convertReply(comment?.replies || [], network);
		if(comment.content.trim()){
			res.push({
				comment_reactions: {
					'👍': {
						count: reactionUsers.length,
						usernames: reactionUsers
					},
					'👎': {
						count: 0,
						usernames: []
					}
				},
				comment_source: 'subsquare',
				content: comment.content,
				created_at: comment.createdAt,
				id: comment._id,
				proposer: comment.author?.address || '',
				replies,
				updated_at: comment?.updatedAt,
				user_id: uuid(),
				username: getTrimmedUsername(comment.author?.username)
			});
		}
	}
	return res;
};

export const getSubSquareComments = async (proposalType: string, network: string | string[] | undefined, id: string | string[] | undefined) => {
	try {
		const url = urlMapper[proposalType]?.(id, network);
		const data = await (await fetchWithTimeout(url, { timeout: 5000 })).json();
		const comments = await convertDataToComment(data.items, network);
		return comments;
	} catch (error) {
		return [];
	}
};

const handler: NextApiHandler<{ data: any } | { error: string }> = async (req, res) => {
	const { proposalType, id } = req.query;
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const data = await getSubSquareComments(proposalType as string, network, id);
	if (data.length === 0) {
		res.status(200).json({ data: [] });
	} else {
		res.status(200).json({ data });
	}
};

export default withErrorHandling(handler);