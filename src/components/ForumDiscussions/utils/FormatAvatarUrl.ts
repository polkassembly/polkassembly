// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const baseURL = process.env.NEXT_PUBLIC_FORUM_URL;

export default function formatAvatarUrl(avatarTemplate: string, size: string): string {
	if (avatarTemplate.startsWith('/user_avatar')) {
		return `${baseURL}${avatarTemplate.replace('{size}', size)}`;
	} else if (avatarTemplate.startsWith('https://avatars.discourse')) {
		return avatarTemplate.replace('{size}', size);
	} else {
		return avatarTemplate;
	}
}
