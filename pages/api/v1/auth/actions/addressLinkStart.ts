// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { Address, ChallengeMessage, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeMessage | MessageType>,
) {
  if (req.method !== 'POST')
    return res
      .status(405)
      .json({ message: 'Invalid request method, POST required.' });

  const network = String(req.headers['x-network']);
  if (!network)
    return res.status(400).json({ message: 'Missing network in headers' });

  const { address: addressRes } = req.body;

  let address = addressRes;
  if (addressRes.startsWith('0x')) {
    address = addressRes.toLowerCase();
  }

  if (!address)
    return res
      .status(400)
      .json({ message: 'Missing parameters in request body' });

  const token = getTokenFromReq(req);
  if (!token) return res.status(400).json({ message: 'Invalid token' });

  const user = await authServiceInstance.GetUser(token);
  if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

  const firestore = firebaseAdmin.firestore();

  const substrateAddress = getSubstrateAddress(address);
  if (!substrateAddress)
    return res.status(400).json({ message: messages.INVALID_ADDRESS });

  const addressExists =
    (
      await firestore
        .collection('addresses')
        .where('address', '==', substrateAddress)
        .where('verified', '==', true)
        .limit(1)
        .get()
    ).docs.length > 0;
  if (addressExists)
    return res.status(400).json({ message: messages.ADDRESS_ALREADY_EXISTS });

  const sign_message = address.startsWith('0x')
    ? `Link account with polkassembly ${uuidv4()}`
    : `<Bytes>${uuidv4()}</Bytes>`;

  const newAddress: Address = {
    address: substrateAddress,
    default: false,
    is_erc20: address.startsWith('0x'),
    network,
    public_key: '',
    sign_message,
    user_id: user.id,
    verified: false,
  };

  await firestore
    .collection('addresses')
    .doc(substrateAddress)
    .set(newAddress)
    .then(() => {
      return res.status(200).json({
        message: messages.ADDRESS_LINKING_STARTED,
        signMessage: sign_message,
      });
    })
    .catch((error) => {
      console.log(' Error while address linking start : ', error);
      return res.status(400).json({ message: messages.ADDRESS_LINKING_FAILED });
    });
}

export default withErrorHandling(handler);
