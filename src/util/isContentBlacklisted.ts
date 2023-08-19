// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import contentBlacklist from '../global/contentBlacklist';

export default function isContentBlacklisted(content: string): boolean {
	const contentLowerCase = content.toLowerCase();
	return contentBlacklist.some((word) => contentLowerCase.includes(word));
}