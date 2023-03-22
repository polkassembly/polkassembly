// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import { getFirestoreProposalType } from '~src/global/proposalType';
import { GET_PROPOSALS_BY_PROPOSER_ADDRESS } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import messages from '~src/util/messages';

export interface IProposalsObj {
    democracy: any[],
    treasury: any[]
}

export interface IPostsByAddressListingResponse {
	proposals: IProposalsObj;
}

interface IGetPostsByAddressParams {
	network: string;
	proposerAddress?: string | string[];
}

export async function getPostsByAddress(params: IGetPostsByAddressParams): Promise<IApiResponse<IProposalsObj>> {
	try {
		const { network, proposerAddress } = params;
		if (!proposerAddress) {
			throw apiErrorWithStatusCode(`The proposerAddress "${proposerAddress}" is invalid.`, 400);
		}
		const netDocRef = networkDocRef(network);
		const strProposalAddress = String(proposerAddress);

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_PROPOSALS_BY_PROPOSER_ADDRESS,
			variables: {
				proposer_eq: getEncodedAddress(strProposalAddress, network)
			}
		});
		const proposalsObj: IProposalsObj = {
			'democracy': [],
			'treasury': []
		};
		const subsquidData = subsquidRes?.data;
		const postTypesColRef = netDocRef.collection('post_types');
		const proposalsPromise = (subsquidData?.proposalsConnection?.edges as any[])?.map(async (edge) => {
			if (edge) {
				const node = edge?.node;
				if (node) {
					let title = '';
					const firestoreProposalType = getFirestoreProposalType(node.type);
					const key = firestoreProposalType.replace('_proposals', '') as 'democracy' | 'treasury';
					const proposalDocSnapshot = await postTypesColRef.doc(firestoreProposalType).collection('posts').doc(String(node.index)).get();
					if (proposalDocSnapshot && proposalDocSnapshot.exists) {
						const data = proposalDocSnapshot.data();
						title = data?.title;
					}
					const newProposal = {
						...node,
						title
					};
					proposalsObj[key].push(newProposal);
				}
			}
		});
		await Promise.all(proposalsPromise);
		return {
			data: JSON.parse(JSON.stringify(proposalsObj)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

// expects proposerAddress
const handler: NextApiHandler<IPostsByAddressListingResponse | { error: string }> = async (req, res) => {
	const { proposerAddress } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	const { data, error, status } = await getPostsByAddress({
		network,
		proposerAddress
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json({
			proposals: data
		});
	}
};

export default withErrorHandling(handler);