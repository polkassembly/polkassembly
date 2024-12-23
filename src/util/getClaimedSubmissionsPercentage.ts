// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { EUserCreatedBountySubmissionStatus } from '~src/types';

const ZERO_BN = new BN(0);

const getClaimedSubmissionsPercentage = async (
	bountyRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>,
	bountyReward: string
) => {
	const submissionSnapshot = bountyRef.collection('submissions');
	const totalAmt = new BN(bountyReward || '0');
	let claimedAmt = ZERO_BN;

	const claimedSubmissionsCountRef = await submissionSnapshot?.where('status', '==', EUserCreatedBountySubmissionStatus.APPROVED).get();

	claimedSubmissionsCountRef?.docs?.map((doc) => {
		if (doc?.exists) {
			const submission = doc?.data();
			if (submission?.req_amount) {
				claimedAmt = claimedAmt?.add(new BN(submission?.req_amount || '0') || ZERO_BN);
			}
		}
	});

	const claimedPencentage = totalAmt.gt(ZERO_BN) ? claimedAmt.mul(new BN('100')).div(totalAmt) : ZERO_BN;

	return claimedPencentage.toNumber();
};

export default getClaimedSubmissionsPercentage;
