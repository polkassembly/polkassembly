// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	try {
		const postID = 2795;
		const lastPostID = 2930;

		const postBaseRefs = firestore_db.collection('networks').doc('polkadot').collection('post_types').doc('discussions').collection('posts');

		for (let i = postID; i <= lastPostID; i++) {
			console.log('deleting post: ', i);
			await postBaseRefs.doc(String(i)).delete();
		}

		return res.status(200).json({ message: 'Success' });
	} catch (error) {
		console.log('Error: ', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export default withErrorHandling(handler);
