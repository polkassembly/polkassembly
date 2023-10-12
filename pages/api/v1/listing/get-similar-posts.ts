// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { getSubsquidProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_STATUS_AND_TYPE } from '~src/queries';
// import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';

const handler: NextApiHandler<IPostTag[] | MessageType> = async (req, res) => {
	const { proposalType } = req.query;
	const network = String(req.headers['x-network']);
	const query = GET_PROPOSAL_BY_STATUS_AND_TYPE;
	const postsVariables: any = {
		type_eq: getSubsquidProposalType(proposalType as any)
	};
	const subsquidRes = await fetchSubsquid({
		network,
		query,
		variables: postsVariables
	});
};

export default withErrorHandling(handler);
