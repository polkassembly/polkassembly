// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function formatAvatarUrl(avatarTemplate: string, size: string): string {
	if (avatarTemplate.startsWith('/user_avatar')) {
		return `https://forum.polkadot.network${avatarTemplate.replace('{size}', size)}`;
	} else if (avatarTemplate.startsWith('https://avatars.discourse')) {
		return avatarTemplate.replace('{size}', size);
	} else {
		return avatarTemplate;
	}
}
