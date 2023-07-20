// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
    const firestore = firebaseAdmin.firestore();
    if (req.method !== 'POST')
        return res
            .status(405)
            .json({ message: 'Invalid request method, POST required.' });

    const { primary_network } = req.body;
    if (!primary_network)
        return res
            .status(400)
            .json({ message: 'Missing parameters in request body' });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: 'Missing user token' });

    const user = await authServiceInstance.GetUser(token);
    if (!user)
        return res.status(400).json({ message: messages.USER_NOT_FOUND });

    const userRef = firestore.collection('users').doc(String(user.id));
    const userDoc = await userRef.get();
    if (!userDoc.exists)
        return res.status(400).json({ message: messages.USER_NOT_FOUND });

    await userRef
        .update({ primary_network })
        .then(() => {
            return res.status(200).json({ message: 'Success' });
        })
        .catch((error) => {
            console.error('Error updating primary network: ', error);
            return res
                .status(500)
                .json({ message: 'Error updating  primary network' });
        });
}

export default withErrorHandling(handler);
