// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserActivityType } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processDelegated({ network, delegateAddress, delegatorAddress }: { network: string; delegateAddress: string; delegatorAddress: string }) {
	console.log('Processing delegated', network, delegateAddress, delegatorAddress);
	const delegatorActivityPayload = {
		by: getSubstrateAddress(delegatorAddress),
		created_at: new Date(),
		is_deleted: false,
		network,
		type: EUserActivityType.DELEGATED,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(delegatorActivityPayload);

	await changeProfileScoreForAddress(delegateAddress, REPUTATION_SCORES.recieved_delegation.value);

	const delegateActivityPayload = {
		by: getSubstrateAddress(delegateAddress),
		created_at: new Date(),
		is_deleted: false,
		network,
		type: EUserActivityType.DELEGATED,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(delegateActivityPayload);
	await changeProfileScoreForAddress(delegatorAddress, REPUTATION_SCORES.first_delegation.value);
}
