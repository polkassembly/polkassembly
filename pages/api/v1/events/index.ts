// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { approvalStatus } from '~src/global/statuses';
import { NetworkEvent } from '~src/types';

const handler: NextApiHandler<NetworkEvent[] | MessageType> = async (req, res) => {
	const { approval_status = approvalStatus.APPROVED } = req.body;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const eventsColSnapshot = await networkDocRef(network).collection('events').where('status', '==', approval_status).get();
	const events: NetworkEvent[] = eventsColSnapshot.docs.reduce((events, doc) => {
		if (doc && doc.exists) {
			return [...events, doc.data() as NetworkEvent];
		}
		return events;
	}, [] as NetworkEvent[]);
	return res.status(200).json(events);
};
export default withErrorHandling(handler);
