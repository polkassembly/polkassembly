// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';
import { NetworkEvent } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
  if (req.method !== 'POST')
    return res
      .status(405)
      .json({ message: 'Invalid request method, POST required.' });

  const {
    content,
    end_time,
    event_type,
    location,
    module,
    network,
    start_time,
    title,
    url,
    user_id,
  } = req.body;

  if (
    !end_time ||
    !event_type ||
    !network ||
    !start_time ||
    !title ||
    !user_id
  ) {
    return res
      .status(400)
      .json({ message: 'Missing parameters in request body' });
  }

  const token = getTokenFromReq(req);
  if (!token) return res.status(400).json({ message: 'Invalid token' });

  const user = await authServiceInstance.GetUser(token);
  if (!user || user.id !== Number(user_id))
    return res.status(403).json({ message: messages.UNAUTHORISED });
  const firestore = firebaseAdmin.firestore();

  const eventDocRef = firestore
    .collection('networks')
    .doc(network)
    .collection('events')
    .doc();

  const newEvent: NetworkEvent = {
    content,
    end_time: dayjs(end_time).toDate(),
    event_type: event_type,
    id: eventDocRef.id,
    location,
    module,
    post_id: -1,
    start_time: dayjs(start_time).toDate(),
    status: 'pending',
    title,
    url,
    user_id: Number(user_id),
  };

  await eventDocRef
    .set(newEvent)
    .then(() => {
      return res.status(200).json({ message: 'Event added.' });
    })
    .catch((error) => {
      console.error('Error adding event : ', error);
      return res.status(500).json({ message: 'Error adding event' });
    });
}

export default withErrorHandling(handler);
