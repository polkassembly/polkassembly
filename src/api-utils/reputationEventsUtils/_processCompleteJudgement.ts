// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processCompleteJudgement({ address }: { address: string }) {
	await changeProfileScoreForAddress(address, REPUTATION_SCORES.complete_on_chain_identity_judgement.value);
}
