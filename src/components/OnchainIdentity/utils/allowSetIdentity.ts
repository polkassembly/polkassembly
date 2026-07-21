// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAllowSetIdentity } from '../types';

const allowSetIdentity = ({ identityInfo, displayName, email, legalName, twitter, matrix }: IAllowSetIdentity) => {
	// Base condition checking display name and legal name
	let isUnchanged = displayName === identityInfo?.displayName && legalName === identityInfo?.legalName;

	// Helper function to compare social fields case-insensitively
	const compareField = (newValue?: string, existingValue?: string): boolean => {
		if (!newValue?.length && !existingValue?.length) return true;
		return (newValue || '').toLowerCase() === (existingValue || '').toLowerCase();
	};

	// Check if email is unchanged
	if (email?.value?.length || identityInfo?.email?.length) {
		isUnchanged = isUnchanged && compareField(email?.value, identityInfo?.email);
	}

	// Check if twitter handle is unchanged
	if (twitter?.value?.length || identityInfo?.twitter?.length) {
		isUnchanged = isUnchanged && compareField(twitter?.value, identityInfo?.twitter);
	}

	// Check if matrix handle is unchanged
	if (matrix?.value?.length || identityInfo?.matrix?.length) {
		isUnchanged = isUnchanged && compareField(matrix?.value, identityInfo?.matrix);
	}

	return isUnchanged;
};

export default allowSetIdentity;
