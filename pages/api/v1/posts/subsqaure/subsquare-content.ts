// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { ProposalType } from '~src/global/proposalType';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
const urlMapper = {
	[ProposalType.BOUNTIES]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/treasury/bounties/${id}`,
	[ProposalType.CHILD_BOUNTIES]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/treasury/child-bounties/${id}`,
	[ProposalType.COUNCIL_MOTIONS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/motions/${id}`,
	[ProposalType.DEMOCRACY_PROPOSALS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/democracy/proposals/${id}`,
	[ProposalType.FELLOWSHIP_REFERENDUMS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/fellowship/referenda/${id}`,
	[ProposalType.REFERENDUMS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/democracy/referendums/${id}`,
	[ProposalType.REFERENDUM_V2]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/gov2/referendums/${id}`,
	[ProposalType.TECH_COMMITTEE_PROPOSALS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/tech-comm/motions/${id}`,
	[ProposalType.TIPS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/treasury/tips/${id}`,
	[ProposalType.TREASURY_PROPOSALS]: (id: number|string, network: string) => `https://${network}.subsquare.io/api/treasury/proposals/${id}`
};

export const getSubSquareContentAndTitle = async (proposalType: string | string[], network: string , id: number|string) => {

	try {
		if(!proposalType){
			throw apiErrorWithStatusCode('Proposal type missing ', 400);
			return;
		}
		if( typeof proposalType !== 'string' ){
			throw apiErrorWithStatusCode('can not send String[] in Proposal type', 400);
			return;
		}

		if(!id || Array.isArray(id)){
			throw apiErrorWithStatusCode('id is not present', 400);
			return;
		}
		if(proposalType === ProposalType.TIPS && typeof id !== 'string'){
			throw apiErrorWithStatusCode('type of id should be string', 400);
			return;
		}
		if( proposalType !== ProposalType.TIPS && Number(id) < 0){
			throw apiErrorWithStatusCode('id can not be negative', 400);
			return;
		}

		if(!network){
			throw apiErrorWithStatusCode('Network is  missing', 400);
			return;
		}
		if(!isValidNetwork(network)){
			throw apiErrorWithStatusCode('Network is not valid', 400);
			return;
		}
		const postId = ProposalType.TIPS !== proposalType ? Number(id) : id ;

		const url = new URL( urlMapper[proposalType as keyof typeof urlMapper]?.(postId, network));
		const data = await (await fetch(url)).json();

		let subsqTitle = data?.title || '';

		subsqTitle = subsqTitle.length !== 0 ? (String(data?.title)?.includes('Untitled') || data?.title) : '';

		if(subsqTitle){
			subsqTitle.includes('[Root] Referendum #') ? subsqTitle = subsqTitle.replace(/\[Root\] Referendum #\d+: /, '') : '';
		}

		const subsquareData = { content : data?.content || '' ,title:subsqTitle };

		return subsquareData;
	} catch (error) {
		return { content: '',title: '' };
	}
};

const handler: NextApiHandler<{ data: ({ content: any|string , title: string|any })| undefined} | { error: string } > = async (req, res) => {
	const { proposalType, id } = req.query;
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	if (!id || Array.isArray(id) ) res.status(400).json({ error: 'id missing in request' });

	const data = await getSubSquareContentAndTitle(proposalType as string, network, String(id));

	res.status(200).json( { data } );

};

export default withErrorHandling(handler);