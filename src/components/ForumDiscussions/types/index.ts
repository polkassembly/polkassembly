// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IForumUser {
	id: number;
	username: string;
	name: string;
	avatar_template: string;
}

export interface IForumTopic {
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
	posters: IForumPoster[];
}

export interface IForumPoster {
	extras: string;
	description: string;
	user_id: number;
	primary_group_id?: string;
}

export interface IForumTopicList {
	can_create_topic: boolean;
	per_page: number;
	top_tags: string[];
	topics: IForumTopic[];
}

export interface IForumData {
	users: IForumUser[];
	primary_groups: any[];
	flair_groups: any[];
	topic_list: IForumTopicList;
}

export interface IForumPost {
	id: number;
	name: string;
	username: string;
	avatar_template: string;
	created_at: string;
	cooked: string;
	post_number: number;
	post_type: number;
	updated_at: string;
	reply_count: number;
	reply_to_post_number: number | null;
	quote_count: number;
	incoming_link_count: number;
	reads: number;
	readers_count: number;
	score: number;
	yours: boolean;
	topic_id: number;
	topic_slug: string;
	display_username: string;
	primary_group_name: string | null;
	flair_name: string | null;
	flair_url: string | null;
	flair_bg_color: string | null;
	flair_color: string | null;
	flair_group_id: string | null;
	version: number;
	can_edit: boolean;
	can_delete: boolean;
	can_recover: boolean;
	can_see_hidden_post: boolean;
	can_wiki: boolean;
	read: boolean;
	user_title: string | null;
	bookmarked: boolean;
	actions_summary: ActionSummary[];
	moderator: boolean;
	admin: boolean;
	staff: boolean;
	user_id: number;
	hidden: boolean;
	trust_level: number;
	deleted_at: string | null;
	user_deleted: boolean;
	edit_reason: string | null;
	can_view_edit_history: boolean;
	wiki: boolean;
	user_suspended?: boolean;
	reactions: Reaction[];
	current_user_reaction: string | null;
	reaction_users_count: number;
	current_user_used_main_reaction: boolean;
	can_accept_answer: boolean;
	can_unaccept_answer: boolean;
	accepted_answer: boolean;
	topic_accepted_answer: true;
	reply_to_user?: ReplyToUser;
	link_counts?: LinkCount[];
	polls?: Poll[];
	replies?: IForumPost[];
}

export interface ActionSummary {
	id: number;
	count: number;
}

export interface Reaction {
	id: string;
	type: string;
	count: number;
}

export interface ReplyToUser {
	username: string;
	name: string;
	avatar_template: string;
}

export interface LinkCount {
	url: string;
	internal: boolean;
	reflection: boolean;
	title: string;
	clicks: number;
}

export interface Poll {
	name: string;
	type: string;
	status: string;
	results: string;
	options: PollOption[];
	voters: number;
	chart_type: string;
	title: string | null;
}

export interface PollOption {
	id: string;
	html: string;
	votes: number;
}

export enum ForumCategoryKey {
	POLKADOT_TECHNOLOGY = 'polkadot-technology',
	AMBASSADOR_PROGRAMME = 'ambassador-programme',
	POLKADOT_FORUM_META = 'polkadot-forum-meta',
	ECOSYSTEM = 'ecosystem',
	GOVERNANCE = 'governance',
	UNCATEGORIZED = 'uncategorized'
}

export interface IOption {
	value: string;
	label: string;
	children?: IOption[];
}

export enum ForumCategoryId {
	MISCELLANEOUS = 1,
	GOVERNANCE = 11,
	ECOSYSTEM = 24,
	ECOSYSTEM_DIGEST = 25,
	POLKADOT_FORUM_META_SUGGESTIONS = 27,
	AMBASSADOR_PROGRAMME = 30,
	POLKADOT_FORUM_META = 5,
	TECH_TALK = 6,
	POLKADOT_FORUM_META_PROFILES = 9
}
