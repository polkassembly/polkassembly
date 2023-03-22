// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseAdmin from '~src/services/firebaseInit';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

import { User } from '../types';
import messages from './messages';

export default async function getUserFromUserId (userId: number): Promise<User> {
	const userDoc = await firebaseAdmin.firestore().collection('users').doc(String(userId)).get();

	if(!userDoc.exists) {
		throw apiErrorWithStatusCode(messages.USER_NOT_FOUND, 404);
	}

	return userDoc.data() as User;
}