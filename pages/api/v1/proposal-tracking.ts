// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { firestore_db } from '~src/services/firebaseInit';

const handler: NextApiHandler<any> = async (req, res) => {
	const { user_id, proposal_id } = req.body;
	let doc = firestore_db.collection('proposal_tracking').doc();

	const data: any = {
		count: 1,
		created_at: new Date(),
		proposal_id: proposal_id,
		updated_at: new Date(),
		user_id: user_id
	};
	if (user_id || user_id === 0) {
		doc = firestore_db.collection('proposal_tracking').doc(String(user_id));
		const trackDoc = await doc.get();
		if (trackDoc.exists) {
			const trackData = trackDoc.data();
			if (trackData?.created_at) {
				delete data?.created_at;
			}
			if (trackData?.count) {
				data.count = trackData.count + 1;
			}
		}
	} else {
		delete data?.user_id;
	}
	await doc.set(data);
	return res.status(200).json({ message: 'Done' });
};
export default withErrorHandling(handler);
