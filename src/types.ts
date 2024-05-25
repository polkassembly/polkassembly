// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dispatch, SetStateAction } from 'react';
import { network, tokenSymbol } from './global/networkConstants';
import { ProposalType, TSubsquidProposalType, VoteType } from './global/proposalType';
import BN from 'bn.js';
import dayjs from 'dayjs';

declare global {
	interface Window {
		GA_INITIALIZED: any;
	}
}
export interface IPreimagesListing {
	proposedCall?: any;
}

export interface IPreimagesListingResponse {
	count: number;
	preimages: IPreimagesListing[];
}

export interface IPeriod {
	period: string;
	periodCardVisible: boolean;
	periodEndsAt: dayjs.Dayjs;
	periodPercent: number;
}

export interface INetworkPreferences {
	channelPreferences: {
		[index: string]: {
			verification_token?: string;
			verification_token_expires?: Date;
			enabled?: boolean;
			handle?: string;
		};
	};
	triggerPreferences: {
		[index: string]: {
			[index: string]: {
				enabled: boolean;
				name: string;
				post_types?: Array<string>;
				tracks?: Array<number>;
				mention_types?: Array<string>;
				sub_triggers?: Array<string>;
			};
		};
	};
}
export enum Role {
	ANONYMOUS = 'anonymous',
	ADMIN = 'admin',
	PROPOSAL_BOT = 'proposal_bot',
	USER = 'user',
	EVENT_BOT = 'event_bot',
	MODERATOR = 'moderator'
}

export enum EReportType {
	POST = 'post',
	COMMENT = 'comment',
	REPLY = 'reply'
}

export enum NotificationStatus {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
}

export interface ModalType {
	content?: string;
	title?: string;
}

export interface ModalContextType {
	dismissModal: () => void;
	modal: ModalType;
	setModal: (modal: ModalType) => void;
}

export interface AccountMeta {
	genesisHash: string | undefined;
	name: string;
	source: string;
}

export interface Account {
	address: string;
	meta: AccountMeta;
}

export type Network = (typeof network)[keyof typeof network];
export type TokenSymbol = (typeof tokenSymbol)[keyof typeof tokenSymbol];

export type ChainPropType = {
	[index: string]: ChainProps;
};

export interface ChainProps {
	preImageBaseDeposit?: string;
	blockTime: number;
	logo?: any;
	ss58Format: number;
	tokenDecimals: number;
	tokenSymbol: TokenSymbol;
	chainId: number;
	rpcEndpoint: string;
	category: string;
	subsquidUrl: string;
	treasuryProposalBondPercent: string | null;
	treasuryProposalMinBond: string | null;
	treasuryProposalMaxBond: string | null;
	externalLinks: string;
	rpcEndpoints: TRPCEndpoint[];
	relayRpcEndpoints?: TRPCEndpoint[];
	gTag: string | null;
}

export type TRPCEndpoint = {
	key: string;
	label: string;
};

export type ChainLinksType = {
	[index: string]: ChainLinks;
};

export interface ChainLinks {
	blockExplorer: string;
	homepage: string;
	github: string;
	discord: string;
	twitter: string;
	telegram: string;
	youtube: string;
	reddit: string;
}

export interface LoadingStatusType {
	isLoading: boolean;
	message: string;
}

export enum VoteThresholdEnum {
	Supermajorityapproval = 'Supermajorityapproval',
	Supermajorityrejection = 'Supermajorityrejection',
	Simplemajority = 'Simplemajority'
}

export type VoteThreshold = keyof typeof VoteThresholdEnum;

export interface MetaContextType {
	description: string;
	image: string;
	setMetaContextState: Dispatch<SetStateAction<MetaContextType>>;
	title: string;
	type: string;
	url: string;
}

export enum Vote {
	AYE = 'AYE',
	NAY = 'NAY'
}

export enum PolkassemblyProposalTypes {
	TreasurySpendProposal,
	TipProposal
}

export interface CouncilVote {
	address: string;
	vote: Vote;
}

export interface ReactionMapFields {
	count: number;
	userNames: string[];
}

export enum Wallet {
	TALISMAN = 'talisman',
	POLKADOT = 'polkadot-js',
	POLKAGATE = 'polkagate',
	POLKAGATESNAP = 'polkagate-snap',
	SUBWALLET = 'subwallet-js',
	METAMASK = 'metamask',
	WALLETCONNECT = 'walletconnect',
	NOVAWALLET = 'polkadot-js',
	POLYWALLET = 'polywallet',
	POLKASAFE = 'polkasafe',
	OTHER = ''
}

export const PostOrigin = {
	AUCTION_ADMIN: 'AuctionAdmin',
	BIG_SPENDER: 'BigSpender',
	BIG_TIPPER: 'BigTipper',
	CANDIDATES: 'Candidates',
	EXPERTS: 'Experts',
	FELLOWS: 'Fellows',
	FELLOWSHIP_ADMIN: 'FellowshipAdmin',
	GENERAL_ADMIN: 'GeneralAdmin',
	GRAND_MASTERS: 'GrandMasters',
	LEASE_ADMIN: 'LeaseAdmin',
	MASTERS: 'Masters',
	MEDIUM_SPENDER: 'MediumSpender',
	MEMBERS: 'Members',
	PROFICIENTS: 'Proficients',
	REFERENDUM_CANCELLER: 'ReferendumCanceller',
	REFERENDUM_KILLER: 'ReferendumKiller',
	ROOT: 'root',
	SENIOR_EXPERTS: 'SeniorExperts',
	SENIOR_FELLOWS: 'SeniorFellows',
	SENIOR_MASTERS: 'SeniorMasters',
	SMALL_SPENDER: 'SmallSpender',
	SMALL_TIPPER: 'SmallTipper',
	STAKING_ADMIN: 'StakingAdmin',
	TREASURER: 'Treasurer',
	WHITELISTED_CALLER: 'WhitelistedCaller',
	WISH_FOR_CHANGE: 'WishForChange'
};

export type TrackInfoType = {
	[index: string]: TrackProps;
};

export interface TrackProps {
	trackId: number;
	group?: string;
	description: string;
	[index: string]: any;
}

export interface NetworkSocials {
	homepage: string;
	twitter: string;
	discord: string;
	github: string;
	youtube: string;
	reddit: string;
	telegram: string;
	block_explorer: string;
	description: string;
}

export enum EGovType {
	OPEN_GOV = 'open_gov',
	GOV1 = 'gov1'
}

export interface NetworkEvent {
	content: string;
	end_time: Date;
	event_type: string;
	id: string;
	location: string;
	module: string;
	start_time: Date;
	status: 'approved' | 'pending' | 'rejected';
	title: string;
	url: string;
	post_id: number;
	user_id: number;
}

export interface ICommentHistory {
	content: string;
	created_at: Date;
	sentiment: number | 0;
}

export interface PostComment {
	user_id: number;
	content: string;
	created_at: Date;
	history: ICommentHistory[];
	id: string;
	isDeleted: boolean;
	updated_at: Date;
	sentiment: number | 0;
	username: string;
	user_profile_img: string;
}

export interface IPollVote {
	created_at: Date;
	updated_at: Date;
	vote: Vote;
	user_id: number;
}

export interface IOptionPollVote {
	created_at: Date;
	updated_at: Date;
	option: string;
	user_id: number;
}

export interface IPoll {
	created_at: Date;
	updated_at: Date;
	id: string;
	poll_votes: IPollVote[];
	block_end: number;
}

export interface IOptionPoll {
	created_at: Date;
	updated_at: Date;
	id: string;
	option_poll_votes: IOptionPollVote[];
	end_at: number;
	question: string;
	options: string[];
}

export interface PostLink {
	type: ProposalType;
	id: number;
}

export interface IPostHistory {
	created_at: Date | string;
	content: string;
	title: string;
}

export enum EReferendumType {
	TREASURER = 'treasury',
	CANCEL = 'cancel',
	KILL = 'kill',
	OTHER = 'other'
}

export interface Post {
	user_id: number;
	content: string;
	created_at: Date;
	id: number | string;
	isDeleted: boolean;
	last_edited_at: Date;
	last_comment_at: Date;
	title: string;
	topic_id: number;
	proposer_address: string;
	post_link: PostLink | null;
	username?: string;
	gov_type?: 'gov_1' | 'open_gov';
	proposalHashBlock?: string | null;
	tags?: string[] | [];
	history?: IPostHistory[];
	subscribers?: number[];
	summary?: string;
	createdOnPolkassembly?: boolean;
	inductee_address?: string;
	typeOfReferendum?: EReferendumType;
}

export interface IPostTag {
	name: string;
	last_used_at: Date;
}

export enum ESentiments {
	Against = 1,
	SlightlyAgainst = 2,
	Neutral = 3,
	SlightlyFor = 4,
	For = 5
}

export interface CommentReply {
	user_id: number;
	content: string;
	created_at: Date;
	id: string;
	isDeleted: boolean;
	updated_at: Date;
	username: string;
	user_profile_img: string;
}

// can't use optional fields in IApiResponse
// due to serialising undefined error in getServerSideProps
export interface IApiResponse<T> {
	data: T | null;
	error: string | null;
	status: number;
}

export interface IApiErrorResponse {
	error: string;
}

export interface IReaction {
	user_id: number;
	created_at: Date;
	id: string;
	reaction: string;
	updated_at: Date;
	username: string;
}

export type PjsCalendarItemDuration = {
	startDate?: Date;
	endDate?: Date;
	startBlockNumber?: number;
	endBlockNumber?: number;
	duration?: number;
};

export type PjsCalendarItem = PjsCalendarItemDuration & {
	network: string;
	type: string;
	data: { [key: string]: unknown };
};

export enum ETrackDelegationStatus {
	ALL = 'all',
	DELEGATED = 'delegated',
	RECEIVED_DELEGATION = 'received_delegation',
	UNDELEGATED = 'undelegated'
}

export interface IDelegation {
	track: number;
	to: string;
	from: string;
	lockPeriod: number;
	balance: string;
	createdAt: Date;
}

export interface IDelegate {
	name?: string;
	address: string;
	created_at?: Date | string;
	bio: string;
	active_delegation_count: number;
	voted_proposals_count: number;
	isNovaWalletDelegate?: boolean;
	dataSource: string[];
	user_id?: number;
}

export enum EVoteDecisionType {
	AYE = 'aye',
	NAY = 'nay',
	ABSTAIN = 'abstain',
	SPLIT = 'split'
}

export enum NOTIFICATION_CHANNEL {
	EMAIL = 'email',
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	ELEMENT = 'element',
	SLACK = 'slack',
	IN_APP = 'in_app'
}

export interface IUserNotificationChannelPreferences {
	name: NOTIFICATION_CHANNEL;
	enabled: boolean;
	handle: string;
	verified: boolean;
	verification_token?: string;
}

export interface IUserNotificationTriggerPreferences {
	name: string;
	enabled: boolean;
	[additionalProperties: string]: any; // trigger specific properties
}

export interface IUserNotificationSettings {
	channelPreferences: { [channel: string]: IUserNotificationChannelPreferences };
	triggerPreferences: {
		[network: string]: { [index: string]: IUserNotificationTriggerPreferences };
	};
}
export interface ILastVote {
	decision: EVoteDecisionType | null;
	time: Date | string | null;
	balance?: BN | string;
	conviction?: number;
}

export type VoteInfo = {
	aye_amount: BN;
	aye_without_conviction: BN;
	isPassing: boolean | null;
	nay_amount: BN;
	nay_without_conviction: BN;
	turnout: BN;
	voteThreshold: string;
};

export enum ESentiment {
	Against = 1,
	SlightlyAgainst = 2,
	Neutral = 3,
	SlightlyFor = 4,
	For = 5
}

export enum VerificationStatus {
	ALREADY_VERIFIED = 'Already verified',
	VERFICATION_EMAIL_SENT = 'Verification email sent',
	PLEASE_VERIFY_TWITTER = 'Please verify twitter',
	NOT_VERIFIED = 'Not verified'
}
export enum ESocials {
	EMAIL = 'email',
	RIOT = 'riot',
	TWITTER = 'twitter',
	WEB = 'web'
}
export interface ILoading {
	isLoading: boolean;
	message: string;
}
export enum EAddressOtherTextType {
	CONNECTED = 'Connected',
	COUNCIL = 'Council',
	COUNCIL_CONNECTED = 'Council (Connected)',
	LINKED_ADDRESS = 'Linked',
	UNLINKED_ADDRESS = 'Address not linked'
}

export interface IBeneficiary {
	address: string;
	amount: string;
}

export interface IVotesCount {
	ayes: number;
	nays: number;
	abstain?: number;
}

/*
  Please do not remove this, its not used in the code but it is used for reference.
	This is the structure of the api_keys collection in firestore.
*/
export interface IApiKeyUsageData {
	[route_name: string]: {
		count: number;
		last_used_at: Date;
	};
}

export interface IApiKeyData {
	key: string;
	usage: IApiKeyUsageData;
	created_at: Date;
	updated_at: Date;
	owner: string;
}

export enum EDecision {
	YES = 'yes',
	NO = 'no',
	ABSTAIN = 'abstain'
}

export interface IVoteHistory {
	timestamp?: string | undefined;
	decision: EDecision;
	type: VoteType;
	blockNumber: number;
	index: number;
	proposalType: TSubsquidProposalType;
	balance?: {
		value?: string;
		nay?: string;
		aye?: string;
		abstain?: string;
	};
	createdAt?: string;
	createdAtBlock?: number;
	lockPeriod?: string;
	isDelegated?: boolean;
	removedAtBlock?: null | number;
	removedAt?: null | string;
	voter?: string;
	delegatedVotes?: Array<any>;
	parentVote?: Array<any>;
}

export interface IVotesHistoryResponse {
	count: number;
	votes: IVoteHistory[];
}
export interface IGetVotesHistoryParams {
	network: string;
	listingLimit?: string | string[] | number;
	page?: string | string[] | number;
	voterAddress?: string | string[];
	proposalType?: ProposalType | string | string[];
	proposalIndex?: string | string[] | number;
}

export enum EKillOrCancel {
	KILL = 'kill',
	CANCEL = 'cancel'
}

export type ProgressStatusType = 'active' | 'success' | 'exception' | 'normal';

export enum EUserActivityType {
	REACTED = 'REACTED',
	COMMENTED = 'COMMENTED',
	REPLIED = 'REPLIED',
	MENTIONED = 'MENTIONED'
}

export enum EUserActivityIn {
	POST = 'POST',
	COMMENT = 'COMMENT',
	REPLY = 'REPLY'
}

export enum EActivityAction {
	CREATE = 'CREATE',
	EDIT = 'EDIT',
	DELETE = 'DELETE'
}

export enum ESteps {
	Write_Proposal = 'Write a Proposal',
	Create_Preimage = 'Create Preimage',
	Create_Proposal = 'Create Proposal'
}

export enum EActivityFilter {
	ALL = 'ALL',
	COMMENTS = 'COMMENTED',
	REPLIES = 'REPLIED',
	REACTS = 'REACTED',
	MENTIONS = 'MENTIONED'
}
export interface ITrackAnalyticsStats {
	activeProposals: { diff: number; total: number };
	allProposals: { diff: number; total: number };
}

export interface IDelegatorsAndDelegatees {
	[key: string]: {
		count: number;
		data: {
			to: string;
			from: string;
			capital: string;
			lockedPeriod: number;
			votingPower: string;
		}[];
	};
}

export interface IChildBountiesResponse {
	child_bounties: {
		description: string;
		index: number;
		status: string;
		reward: string;
		title: string;
	}[];
	child_bounties_count: number;
}

export interface IUserPost {
	assetId?: null | string;
	content: string;
	created_at: Date;
	id: string;
	post_reactions: {
		'👍': number;
		'👎': number;
	};
	proposer: string;
	title: string;
	type: ProposalType;
	username?: string;
	track_number?: number;
	tally?: {
		ayes: string;
		nays: string;
	} | null;
	status?: string;
	status_history?: {
		status: string;
		block: any;
	};
	timeline?: any;
	tags?: string[];
	comments_count?: number;
	requestedAmount?: string | null;
}

export interface IUserPostsListingResponse {
	gov1: {
		discussions: {
			posts: IUserPost[];
			total: number;
		};
		democracy: {
			referenda: IUserPost[];
			proposals: IUserPost[];
			total: number;
			posts: IUserPost[];
		};
		treasury: {
			treasury_proposals: IUserPost[];
			bounties: IUserPost[];
			tips: IUserPost[];
			total: number;
			posts: IUserPost[];
		};
		collective: {
			council_motions: IUserPost[];
			tech_comm_proposals: IUserPost[];
			total: number;
			posts: IUserPost[];
		};
	};
	open_gov: {
		discussions: {
			posts: IUserPost[];
			total: number;
		};
		root: IUserPost[];
		staking_admin: IUserPost[];
		auction_admin: IUserPost[];
		governance: {
			lease_admin: IUserPost[];
			general_admin: IUserPost[];
			referendum_canceller: IUserPost[];
			referendum_killer: IUserPost[];
			total: number;
			posts: IUserPost[];
		};
		treasury: {
			treasurer: IUserPost[];
			small_tipper: IUserPost[];
			big_tipper: IUserPost[];
			small_spender: IUserPost[];
			medium_spender: IUserPost[];
			big_spender: IUserPost[];
			total: number;
			posts: IUserPost[];
		};
		fellowship: {
			member_referenda: IUserPost[];
			whitelisted_caller: IUserPost[];
			fellowship_admin: IUserPost[];
			total: number;
			posts: IUserPost[];
		};
	};
	gov1_total: number;
	open_gov_total: number;
}

export interface IActiveProposalCount {
	[
		key:
			| 'allCount'
			| 'communityPipsCount'
			| 'technicalPipsCount'
			| 'upgradePipsCount'
			| 'councilMotionsCount'
			| 'democracyProposalsCount'
			| 'referendumsCount'
			| 'techCommetteeProposalsCount'
			| 'tipsCount'
			| 'treasuryProposalsCount'
			| 'bountiesCount'
			| 'childBountiesCount'
			| 'advisoryCommitteeMotionsCount'
			| string
	]: number;
}
