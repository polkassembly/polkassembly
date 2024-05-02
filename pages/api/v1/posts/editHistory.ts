// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import type { NextApiHandler } from 'next';
import { IPostHistory } from '~src/types';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { ProposalType } from '~src/global/proposalType';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { network as AllNetworks } from '~src/global/networkConstants';

const handler: NextApiHandler<IPostHistory[] | { error: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const { postId = 0, proposalType = ProposalType.DEMOCRACY_PROPOSALS } = req.query;

	const network = String(req.headers['x-network']);

	if (!network || !Object.values(AllNetworks).includes(network) || isNaN(Number(postId)) || !proposalType || !Object.values(ProposalType).includes(proposalType as ProposalType)) {
		return res.status(400).json({ error: 'Bad Request, invalid params' });
	}

	const postDocRef = await postsByTypeRef(network, proposalType as ProposalType)
		.doc(String(postId))
		.get();

	if (!postDocRef.exists) {
		return res.status(404).json({ error: 'Post not found' });
	}

	const data = postDocRef.data();

	const history: IPostHistory[] =
		data?.history?.map((item: any) => {
			return { ...item, created_at: item?.created_at?.toDate() } as IPostHistory;
		}) || [];

	return res.status(200).json(history);
};

export default withErrorHandling(handler);
