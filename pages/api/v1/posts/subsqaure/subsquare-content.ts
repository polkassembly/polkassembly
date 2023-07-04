// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { ProposalType } from '~src/global/proposalType';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

const urlMapper: any = {
	[ProposalType.BOUNTIES]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/bounties/${id}`,
	[ProposalType.CHILD_BOUNTIES]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/child-bounties/${id}`,
	[ProposalType.COUNCIL_MOTIONS]: (id: any, network: string) => `https://${network}.subsquare.io/api/motions/${id}`,
	[ProposalType.DEMOCRACY_PROPOSALS]: (id: any, network: string) => `https://${network}.subsquare.io/api/democracy/proposals/${id}`,
	[ProposalType.FELLOWSHIP_REFERENDUMS]: (id: any, network: string) => `https://${network}.subsquare.io/api/fellowship/referenda/${id}`,
	[ProposalType.REFERENDUMS]: (id: any, network: string) => `https://${network}.subsquare.io/api/democracy/referendums/${id}`,
	[ProposalType.REFERENDUM_V2]: (id: any, network: string) => `https://${network}.subsquare.io/api/gov2/referendums/${id}`,
	[ProposalType.TECH_COMMITTEE_PROPOSALS]: (id: any, network: string) => `https://${network}.subsquare.io/api/tech-comm/motions/${id}`,
	[ProposalType.TIPS]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/tips/${id}`,
	[ProposalType.TREASURY_PROPOSALS]: (id: any, network: string) => `https://${network}.subsquare.io/api/treasury/proposals/${id}`
};

export const getSubSquareContentAndTitle = async (proposalType: string | string[], network: string | string[] | undefined, id: string | string[] | number |undefined) => {
	//console.log('params', proposalType , network , id);
	try {
		if( typeof proposalType !== 'string' ){
			throw apiErrorWithStatusCode('can not send String[] in Proposal type', 400);
			return;
		}
		if(!id){
			throw apiErrorWithStatusCode('id is not present', 400);
			return;
		}
		const url = urlMapper[String(proposalType)]?.(id, network);
		const data = await (await fetch(url)).json();

		//let subsqTitle = data.title.includes('Untitled') ? '' : data.title;
		let subsqTitle = data.title;

		subsqTitle = String(data?.title)?.includes('Untitled') ? '' : data.title;

		if(subsqTitle){
			subsqTitle.includes('[Root] Referendum #') ? subsqTitle = subsqTitle.replace(/\[Root\] Referendum #\d+: /, '') : '';
		}

		const subsquareData = { content : data.content ,title:subsqTitle };
		return subsquareData;
	} catch (error) {
		console.log(`Error ${error}`);
		return { content: '',title: '' };
	}
};

const handler: NextApiHandler<{ data: any } | { error: string }> = async (req, res) => {
	const { proposalType, id } = req.query;
	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const data :{
        content:'',
        title:''
    } | undefined = await getSubSquareContentAndTitle(proposalType as string, network, id);
	if (data?.title === '' && data?.content === '') {
		res.status(200).json({ data: { content:'' , title:'' } });
	} else {
		res.status(200).json( { data } );
	}
};

export default withErrorHandling(handler);