// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// CommentMapping.ts
import { ForumPost } from '../types';

export default function CommentMapping(posts: ForumPost[]): ForumPost[] {
	const postMap: Record<number, ForumPost> = {};
	const commentTree: ForumPost[] = [];

	posts.forEach((post) => {
		postMap[post.id] = { ...post, replies: [] };
	});

	posts.forEach((post) => {
		if (post.reply_to_post_number) {
			const parentPost = posts.find((p) => p.post_number === post.reply_to_post_number);
			if (parentPost) {
				postMap[parentPost.id].replies!.push(postMap[post.id]);
			}
		} else {
			commentTree.push(postMap[post.id]);
		}
	});

	return commentTree;
}
