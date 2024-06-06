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
	bookmarked: string | null | boolean;
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
	bookmarked: string | null | boolean;
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

export interface IForumDataTopicId {
	post_stream: IForumPostStream;
	timeline_lookup: (number | null)[];
	suggested_topics: IForumSuggestedTopic[];
	tags: (string | null)[];
	tags_descriptions: Record<string, string>;
	id: number;
	title: string;
	fancy_title: string;
	posts_count: number;
	created_at: string;
	views: number;
	reply_count: number;
	like_count: number;
	last_posted_at: string;
	visible: boolean;
	closed: boolean;
	archived: boolean;
	has_summary: boolean;
	archetype: string;
	slug: string;
	category_id: number;
	word_count: number;
	deleted_at: string | null;
	user_id: number;
	featured_link: string;
	pinned_globally: boolean;
	pinned_at: string;
	pinned_until: string;
	image_url: string;
	slow_mode_seconds: number;
	draft: string;
	draft_key: string;
	draft_sequence: number;
	unpinned: string | null;
	pinned: boolean;
	current_post_number: number;
	highest_post_number: number;
	deleted_by: string | null;
	has_deleted: boolean;
	actions_summary: ActionSummary[];
	chunk_size: number;
	bookmarked: string | null | boolean;
	bookmarks: (string | null)[];
	topic_timer: string | null;
	message_bus_last_id: number;
	participant_count: number;
	show_read_indicator: boolean;
	thumbnails: string;
	slow_mode_enabled_until: string | null;
	summarizable: boolean;
	details: IForumTopicDetails;
}

interface IForumPostStream {
	posts: IForumPost[];
	stream: (number | null)[];
}

export interface IForumSuggestedTopic extends IForumTopic {
	bookmarked: string | null | boolean;
	liked: string | undefined;
	posters: IForumPoster[];
}

export interface IForumPoster {
	extras: string;
	description: string;
	user: IForumUser;
}

export interface IForumTopicDetails {
	can_edit: boolean;
	notification_level: number;
	can_move_posts: boolean;
	can_delete: boolean;
	can_remove_allowed_users: boolean;
	can_create_post: boolean;
	can_reply_as_new_topic: boolean;
	can_invite_to: boolean;
	can_invite_via_email: boolean;
	can_flag_topic: boolean;
	can_convert_topic: boolean;
	can_review_topic: boolean;
	can_close_topic: boolean;
	can_archive_topic: boolean;
	can_split_merge_topic: boolean;
	can_edit_staff_notes: boolean;
	can_toggle_topic_visibility: boolean;
	can_pin_unpin_topic: boolean;
	can_moderate_category: boolean;
	can_remove_self_id: number;
	participants: IForumParticipant[];
	created_by: IForumUser;
	last_poster: IForumUser;
}

export interface IForumParticipant {
	id: number;
	username: string;
	name: string;
	avatar_template: string;
	post_count: number;
	primary_group_name: string;
	flair_name: string;
	flair_url: string;
	flair_color: string;
	flair_bg_color: string;
	flair_group_id: string;
	admin: boolean;
	moderator: boolean;
	trust_level: number;
}
