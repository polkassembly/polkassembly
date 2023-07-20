// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { firestore } from 'firebase-admin';
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { firestore_db } from '~src/services/firebaseInit';

export interface IAddressData {
  address: string;
  user_id: number;
}

export interface IAddressesResponse {
  addressesData: IAddressData[];
}

const handler: NextApiHandler<IAddressesResponse | { error: string }> = async (
  req,
  res,
) => {
  const { addresses } = req.body;
  if (!addresses || !Array.isArray(addresses))
    return res
      .status(400)
      .json({ error: `addresses ${addresses} must be an array of string.` });

  const docRefList: firestore.DocumentReference<firestore.DocumentData>[] = [];
  addresses.forEach((address) => {
    docRefList.push(firestore_db.collection('addresses').doc(address));
  });

  const addressesData: IAddressData[] = [];
  if (docRefList.length > 0) {
    // getAll must have one docRef
    const results = await firestore_db.getAll(...docRefList);

    results.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          addressesData.push({
            address: data.address,
            user_id: data.user_id,
          });
        }
      }
    });
  }

  res.status(200).json({
    addressesData,
  });
};

export default withErrorHandling(handler);
