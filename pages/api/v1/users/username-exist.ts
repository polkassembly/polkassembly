// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';

export interface IUsernameExistResponse {
	isExist: boolean;
}

const handler: NextApiHandler<IUsernameExistResponse | MessageType> = async (
	req,
	res,
) => {
	const { username } = req.query;
	if (!username) {
		return res
			.status(400)
			.json({ message: `Invalid username ${username}.` });
	}
	const users = await firestore_db
		.collection('users')
		.where('username', '==', username)
		.limit(1)
		.get();
	let isExist = true;
	if (users.size === 0) {
		isExist = false;
	}
	res.status(200).json({ isExist });
};
export default withErrorHandling(handler);
