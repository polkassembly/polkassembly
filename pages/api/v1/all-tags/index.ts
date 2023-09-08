// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag } from '~src/types';

const handler: NextApiHandler<IPostTag[] | MessageType> = async (req, res) => {
	const tagsSnapshots = await firestore_db.collection('tags').orderBy('last_used_at','desc').get();
	const tags =  tagsSnapshots?.docs?.map((tag) => {
		const data=tag.data();
		const newTag:IPostTag={
			last_used_at:data?.last_used_at.toDate ? data?.last_used_at.toDate(): data?.last_used_at,
			name:data?.name
		};
		return newTag;
	});
	return res.status(200).json(tags);
};

export default withErrorHandling(handler);
