// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

export const networkDocRef = (networkName: string) =>
  firestore_db.collection('networks').doc(networkName);
export const postsByTypeRef = (
  networkName: string,
  proposalType: ProposalType,
) =>
  networkDocRef(networkName)
    .collection('post_types')
    .doc(String(proposalType))
    .collection('posts');
