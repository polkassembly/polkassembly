// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import { firestore_db } from '~src/services/firebaseInit';
import { EUserActivityType } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processIdentityCleared({ network, address }: { network: string; address: string }) {
	console.log('Processing identity cleared', network, address);
	const activityPayload = {
		by: getSubstrateAddress(address),
		created_at: new Date(),
		is_deleted: false,
		network,
		type: EUserActivityType.IDENTITY_CLEARED,
		updated_at: new Date()
	};

	await firestore_db.collection('user_activities').add(activityPayload);

	await changeProfileScoreForAddress(address, -(REPUTATION_SCORES.on_chain_identity_verification_sign_up.value + REPUTATION_SCORES.complete_on_chain_identity_judgement.value));
}
