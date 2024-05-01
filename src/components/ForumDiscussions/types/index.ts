// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface User {
	id: number;
	username: string;
	name: string;
	avatar_template: string;
}

export interface Topic {
	id: number;
	title: string;
	fancy_title: string;
	slug: string;
	posts_count: number;
	reply_count: number;
	highest_post_number: number;
	image_url: string;
	created_at: string;
	last_posted_at: string;
	bumped: boolean;
	bumped_at: string;
	archetype: string;
	unseen: boolean;
	pinned: boolean;
	unpinned?: string;
	excerpt?: string;
	visible: boolean;
	closed: boolean;
	archived: boolean;
	bookmarked?: string;
	liked?: string;
	views: number;
	tags: string[];
	like_count: number;
	has_summary: boolean;
	last_poster_username: string;
	category_id: number;
	pinned_globally: boolean;
	featured_link?: string;
	posters: Poster[];
}

export interface Poster {
	extras: string;
	description: string;
	user_id: number;
	primary_group_id?: string;
}

export interface TopicList {
	can_create_topic: boolean;
	per_page: number;
	top_tags: string[];
	topics: Topic[];
}

export interface ForumData {
	users: User[];
	primary_groups: any[];
	flair_groups: any[];
	topic_list: TopicList;
}
