// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * This enum matches the indexer
 *
 * @export
 * @enum {string}
 */

export enum EReputationEvent {
	PROPOSAL_CREATED = 'PROPOSAL_CREATED',
	PROPOSAL_ENDED = 'PROPOSAL_ENDED',
	VOTED = 'VOTED',
	BOUNTY_CLAIMED = 'BOUNTY_CLAIMED',
	DECISION_DEPOSIT_PLACED = 'DECISION_DEPOSIT_PLACED',
	REMOVED_VOTE = 'REMOVED_VOTE',
	TIPPED = 'TIPPED',
	DELEGATED = 'DELEGATED',
	UNDELEGATED = 'UNDELEGATED',
	IDENTITY_VERIFICATION_SIGN_UP = 'IDENTITY_VERIFICATION_SIGN_UP',
	COMPLETE_JUDGEMENT = 'COMPLETE_JUDGEMENT',
	IDENTITY_CLEARED = 'IDENTITY_CLEARED',
	IDENTITY_KILLED = 'IDENTITY_KILLED'
}
