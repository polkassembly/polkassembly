// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { firestore_db } from '~src/services/firebaseInit';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';

const handler: NextApiHandler<any> = async (req, res) => {
  const network = String(req.headers['x-network']);
  const { identityHash } = req.query;

	if(!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK , 400);
  if(!identityHash) throw apiErrorWithStatusCode('Invalid identity hash' , 400);

	const token = getTokenFromReq(req);

	const user = await authServiceInstance.GetUser(token);
  const userId = user?.id;

	if(!userId || !token) throw apiErrorWithStatusCode(messages.UNAUTHORISED, 403);

  const userDocRef = firestore_db.collection('users').doc(String(userId));
  const userDoc = await userDocRef.get();

  if(!userDoc.exists) throw apiErrorWithStatusCode('User not found', 404);

  await userDocRef.set({
    identity_hash: identityHash
  },{ merge: true });

  return res.status(200).json('Success');
  };
export default withErrorHandling(handler);