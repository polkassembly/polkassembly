// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function getCategoryName(id: number): string {
	const categories: { [key: number]: string } = {
		1: 'Miscellaneous',
		11: 'Governance',
		24: 'Ecosystem',
		25: 'Ecosystem (Digest)',
		27: 'Polkadot Forum Meta (Suggestions)',
		30: 'Ambassador Programme',
		5: 'Polkadot Forum Meta',
		6: 'Tech Talk',
		9: 'Polkadot Forum Meta (Profiles)'
	};
	return categories[id] || 'Unknown Category';
}
