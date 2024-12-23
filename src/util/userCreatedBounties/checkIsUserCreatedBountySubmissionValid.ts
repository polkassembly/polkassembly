// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import { EUserCreatedBountySubmissionStatus } from '~src/types';

const checkIsUserCreatedBountySubmissionValid = async (
	bountyRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>,
	userId: number,
	userAddress: string
) => {
	const bountyData = (await bountyRef.get())?.data();

	const submissionSnapshot = bountyRef.collection('submissions');

	//deadline date ended
	const deadlineDate = bountyData?.deadlineDate?.toDate ? String(bountyData?.deadlineDate?.toDate()) : bountyData?.deadlineDate;

	//maxClaim count;
	const claimedSubmissionsCountRef = await submissionSnapshot?.where('status', '==', EUserCreatedBountySubmissionStatus.APPROVED).count().get();
	const claimedSubmissionsCount = claimedSubmissionsCountRef.data().count;

	//check is submission already exists for the user:
	const existsSubmissionRef = await submissionSnapshot?.where('user_id', '==', userId).where('proposer', '==', userAddress).get();

	return {
		claimedSubmissionsCount: claimedSubmissionsCount,
		deadlineDateExpired: dayjs(new Date()).isAfter(deadlineDate),
		maxClaimReached: Number(bountyData?.maxClaim) <= claimedSubmissionsCount,
		submissionAlreadyExists: !existsSubmissionRef?.empty
	};
};

export default checkIsUserCreatedBountySubmissionValid;
