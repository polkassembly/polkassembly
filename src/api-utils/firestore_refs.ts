// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

export const networkDocRef = (networkName: string) => firestore_db.collection('networks').doc(networkName);
export const postsByTypeRef = (networkName: string, proposalType: ProposalType) =>
	networkDocRef(networkName).collection('post_types').doc(String(proposalType)).collection('posts');

export const activityCollRef = (networkName: string) => networkDocRef(networkName).collection('activities');
export const activityDocRef = (networkName: string, activityId: string) => activityCollRef(networkName).doc(activityId);
export const activityReactionCollRef = (networkName: string, activityId: string) => activityDocRef(networkName, activityId).collection('reactions');
export const activityViewsCollRef = (networkName: string, activityId: string) => activityDocRef(networkName, activityId).collection('views');

export const followsCollRef = () => firestore_db.collection('follows');
