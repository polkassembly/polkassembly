// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isFirestoreProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { IUserPreference, MessageType, Subscription } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Subscription | MessageType>,
) {
  const network = String(req.headers['x-network']);
  if (!network || !isValidNetwork(network))
    res.status(400).json({ message: 'Invalid network in request header' });

  const { post_id = 0, proposalType } = req.body;

  const strProposalType = String(proposalType);
  if (!isFirestoreProposalTypeValid(strProposalType)) {
    return res
      .status(400)
      .json({ message: `The proposal type "${proposalType}" is invalid.` });
  }
  const numPostId = Number(post_id);
  if (isNaN(numPostId)) {
    return res
      .status(400)
      .json({ message: `The postId "${post_id}" is invalid.` });
  }

  const token = getTokenFromReq(req);

  if (!token) res.status(400).json({ message: 'Token not found' });

  const user = await authServiceInstance.GetUser(token);
  if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

  let subscribed = false;
  const userPreferenceDoc = await networkDocRef(network)
    .collection('user_preferences')
    .doc(String(user.id))
    .get();
  if (userPreferenceDoc.exists) {
    const data = userPreferenceDoc.data() as IUserPreference;
    if (data) {
      const post_subscriptions = data.post_subscriptions;
      subscribed =
        post_subscriptions?.[
          strProposalType as keyof typeof post_subscriptions
        ]?.some((id) => String(id) === String(post_id)) || false;
    } else {
      subscribed = false;
    }
  }
  res.status(200).json({ subscribed });
}

export default withErrorHandling(handler);
