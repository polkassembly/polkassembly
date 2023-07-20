// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export function getFormattedLike(v: number) {
	return Intl.NumberFormat('en-US', {
		maximumFractionDigits: 1,
		notation: 'compact',
	}).format(v);
}
