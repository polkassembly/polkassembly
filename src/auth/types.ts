// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';
import { IUserNotificationSettings, Role, Wallet } from '~src/types';

export interface MessageType {
	message: string;
}

export interface ChallengeMessage extends MessageType {
	signMessage: string;
}

export interface TokenType {
	token: string;
}
export interface IAddProfileResponse {
	message?: string;
	token?: string;
}

export interface ChangeResponseType extends MessageType, TokenType {}

export interface UpdatedDataResponseType<T> extends MessageType {
	updated: T;
}

export interface UndoEmailChangeResponseType extends ChangeResponseType {
	email: string;
}

export interface CreatePostResponseType extends MessageType {
	post_id?: number;
}

export interface Subscription {
	subscribed: boolean;
}

export interface IVerified {
	verified: boolean;
}

export interface PublicUser {
	id: number;
	default_address?: string;
	username: string;
	primary_network?: string;
}

export enum ESocialType {
	EMAIL = 'Email',
	RIOT = 'Riot',
	TWITTER = 'Twitter',
	TELEGRAM = 'Telegram',
	DISCORD = 'Discord'
}

export interface ISocial {
	type: ESocialType;
	link: string;
}
export interface ProfileDetails {
	custom_username?: boolean;
	bio?: string;
	badges?: string[];
	title?: string;
	image?: string;
	social_links?: ISocial[];
	cover_image?: string;
	achievement_badges: Badge[];
}

export interface ProfileDetailsResponse extends ProfileDetails {
	user_id: number;
	username: string;
	addresses: string[];
	created_at?: Date | null;
	profile_score?: number;
}

export interface LeaderboardEntry extends ProfileDetailsResponse {
	user_id: number;
	username: string;
	addresses: string[];
	created_at?: Date | null;
	profile_score: number;
	rank: number;
}

export interface IAddressProxyForEntry {
	address: string;
	network: string;
}

export interface Address {
	address: string;
	default: boolean;
	network: string;
	public_key: string;
	sign_message: string;
	user_id: number;
	verified: boolean;
	is_erc20?: boolean;
	wallet?: string;
	isMultisig?: boolean;
	proxy_for?: IAddressProxyForEntry[];
}

export interface PublicAddress {
	address: string;
	default: boolean;
	network: string;
	public_key: string;
	verified: boolean;
	is_erc20?: boolean;
	wallet?: string;
	isMultisig?: boolean;
	proxy_for?: IAddressProxyForEntry[];
}

export interface NotificationSettings {
	new_proposal: boolean;
	own_proposal: boolean;
	post_created: boolean;
	post_participated: boolean;
}

export interface IUserPreference {
	user_id: number;
	notification_preferences: NotificationSettings;
	post_subscriptions: {
		[key in ProposalType]?: (number | string)[];
	};
}

export interface UndoEmailChangeToken {
	user_id: number;
	email: string;
	valid: boolean;
	created_at: Date;
	token: string;
}

export interface IUser2FADetails {
	url: string;
	base32_secret: string;
	enabled: boolean;
	verified: boolean;
}

export interface User {
	created_at?: Date;
	custom_username?: boolean;
	email: string;
	email_verified: boolean;
	id: number;
	password: string;
	profile: ProfileDetails;
	salt: string;
	username: string;
	web3_signup: boolean;
	primary_network?: string;
	notification_preferences?: IUserNotificationSettings;
	two_factor_auth?: IUser2FADetails;
	roles?: Role[];
	profile_score: number;
}

export interface Roles {
	allowedRoles: Role[];
	currentRole: Role.PROPOSAL_BOT | Role.USER | Role.EVENT_BOT | Role.MODERATOR;
}

export interface JWTPayloadType {
	default_address: string;
	addresses: string[];
	sub: string;
	username: string;
	email: string;
	email_verified: boolean;
	iat: number;
	id: number;
	roles: Roles;
	web3signup: boolean;
	is2FAEnabled?: boolean;
	login_wallet?: Wallet;
	login_address?: string;
	exp?: number;
}

export interface IRefreshTokenPayload {
	iat: number;
	id: number;
	exp?: number;
	login_address?: string;
	login_wallet?: Wallet;
}

export interface IAuthResponse {
	token?: string;
	user_id?: number;
	isTFAEnabled?: boolean;
	tfa_token?: string;
	refresh_token?: string;
}

export interface AuthObjectType extends TokenType {
	user_id?: number;
}

export enum PostTypeEnum {
	BOUNTY = 'bounty',
	POST = 'post',
	PROPOSAL = 'proposal',
	TIP = 'tip',
	TREASURY = 'treasury',
	MOTION = 'motion',
	REFERENDUM = 'referendum',
	TECH = 'tech',
	CHILD_BOUNTY = 'child_bounty',
	REFERENDA = 'referenda'
}

export type PostType = PostTypeEnum;

export interface HashedPassword {
	password: string;
	salt: string;
}

export interface CalendarEvent {
	content: string;
	end_time: Date;
	event_type: string;
	id: string;
	module: string;
	start_time: Date;
	status: string;
	title: string;
	url: string;
	post_id: number;
	user_id: number;
}

export interface I2FAGenerateResponse {
	url: string;
	base32_secret: string;
}

export interface IDelegationProfileType {
	image: string;
	social_links: ISocial[];
	user_id: number;
	username: string;
	bio: string;
}

export interface SubscanAPIResponseType {
	url?: number;
	body?: any;
}

export enum BadgeName {
	DECENTRALISED_VOICE = 'Decentralised Voice',
	FELLOW = 'Fellow',
	COUNCIL = 'Council Member',
	ACTIVE_VOTER = 'Active Voter',
	WHALE = 'Whale'
	// STEADFAST_COMMENTOR = 'Steadfast Commentor',
	// GM_VOTER = 'GM Voter',
	// POPULAR_DELEGATE = 'Popular Delegate'
}

export interface Badge {
	name: BadgeName;
	check: boolean;
	unlockedAt: string;
}

export interface BadgeCheckContext {
	commentsCount?: number;
	votesCount?: number;
	network?: string;
}

export interface BadgeCriterion {
	check: (user: ProfileDetailsResponse, context?: BadgeCheckContext) => Promise<boolean> | boolean;
	name: BadgeName;
}

export interface IFellow {
	address: string;
	rank: number;
}
