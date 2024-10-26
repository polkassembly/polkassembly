// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ForumCategoryId } from '../types';

const categoryNames: { [key in ForumCategoryId]: string } = {
	[ForumCategoryId.MISCELLANEOUS]: 'Miscellaneous',
	[ForumCategoryId.GOVERNANCE]: 'Governance',
	[ForumCategoryId.ECOSYSTEM]: 'Ecosystem',
	[ForumCategoryId.ECOSYSTEM_DIGEST]: 'Ecosystem (Digest)',
	[ForumCategoryId.POLKADOT_FORUM_META_SUGGESTIONS]: 'Polkadot Forum Meta (Suggestions)',
	[ForumCategoryId.AMBASSADOR_PROGRAMME]: 'Ambassador Programme',
	[ForumCategoryId.POLKADOT_FORUM_META]: 'Polkadot Forum Meta',
	[ForumCategoryId.TECH_TALK]: 'Tech Talk',
	[ForumCategoryId.POLKADOT_FORUM_META_PROFILES]: 'Polkadot Forum Meta (Profiles)'
};

export default function getCategoryName(id: number): string {
	return categoryNames[id as ForumCategoryId] || 'Unknown Category';
}
