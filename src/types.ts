// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dispatch, SetStateAction } from 'react';
import { network, tokenSymbol } from './global/networkConstants';
import { ProposalType, TSubsquidProposalType, VoteType } from './global/proposalType';
import BN from 'bn.js';
import dayjs from 'dayjs';
import { EAssets } from './components/OpenGovTreasuryProposal/types';
import { IBountyListing } from './components/Bounties/BountiesListing/types/types';
import type { RegistrationJudgement } from '@polkadot/types/interfaces';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';

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

export interface IAssets {
	tokenDecimal: number;
	name: string;
	img: string;
	symbol: EAssets;
	genralIndex: string;
}

interface Asset {
	label: string;
	assetId: number;
}

export interface ChainProps {
	peopleChainRpcEndpoint?: string;
	peopleChainParachain?: string;
	preImageBaseDeposit?: string;
	palletInstance?: string;
	parachain?: string;
	blockTime: number;
	logo?: any;
	ss58Format: number;
	tokenDecimals: number;
	tokenSymbol: TokenSymbol;
	chainId: number;
	rpcEndpoint: string;
	category: string;
	subsquidUrl: string;
	treasuryAddress?: string;
	treasuryProposalBondPercent: string | null;
	treasuryProposalMinBond: string | null;
	treasuryProposalMaxBond: string | null;
	externalLinks: string;
	assethubExternalLinks?: string;
	rpcEndpoints: TRPCEndpoint[];
	relayRpcEndpoints?: TRPCEndpoint[];
	gTag: string | null;
	assetHubRpcEndpoint?: string;
	assetHubTreasuryAddress?: string;
	assetHubTreasuryAddress2?: string;
	assetHubTreasuryAddress3?: string;
	assetHubTreasuryAddress4?: string;
	supportedAssets?: IAssets[];
	hydrationTreasuryAddress?: string;
	hydrationTreasuryAddress2?: string;
	hydrationEndpoints?: string[];
	hydrationAssets?: Asset[];
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
	SUBWALLET = 'subwallet-js',
	METAMASK = 'metamask',
	WALLETCONNECT = 'walletconnect',
	NOVAWALLET = 'polkadot-js',
	POLYWALLET = 'polywallet',
	POLKASAFE = 'polkasafe',
	OTHER = ''
}

export const PostOrigin = {
	ASTRAL_SCORECARD: 'AstralScorcard',
	AUCTION_ADMIN: 'AuctionAdmin',
	BIG_SPENDER: 'BigSpender',
	BIG_TIPPER: 'BigTipper',
	CANDIDATES: 'Candidates',
	EXPERTS: 'Experts',
	FAST_GENERAL_ADMIN: 'FastGeneralAdmin',
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
	isExpertComment?: boolean;
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

export enum EAllowedCommentor {
	ALL = 'all',
	ONCHAIN_VERIFIED = 'onchain_verified',
	NONE = 'none'
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
	allowedCommentors?: EAllowedCommentor[];
	progress_report?: IProgressReport[];
	link?: string;
	updated_at?: Date;
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

export interface IDelegateDetails {
	address: string;
	bio: string;
	receivedDelegationsCount: number;
	votedProposalsCount: number;
	image: string;
	dataSource: string[];
	delegatedBalance: string;
}

export enum EDelegationFilters {
	RECEIVED_DELEGATION = 'receivedDeleagtion',
	DELEGATED_VOTES = 'delegatedVotes',
	VOTES_IN_LAST_MONTH = 'votesInLastMonth'
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
	PLEASE_VERIFY_MATRIX = 'Please verify matrix account',
	NOT_VERIFIED = 'Not verified'
}
export enum ESocials {
	EMAIL = 'email',
	MATRIX = 'matrix',
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

export interface IRating {
	rating: number;
	user_id: string;
}
export interface IProgressReport {
	id?: string;
	created_at?: Date;
	isEdited?: boolean;
	progress_file?: string;
	progress_name?: string;
	progress_summary?: string;
	ratings?: IRating[];
	isFromOgtracker?: boolean;
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
	MENTIONED = 'MENTIONED',
	VOTED = 'VOTED',
	VOTE_PASSED = 'VOTE_PASSED',
	VOTE_FAILED = 'VOTE_FAILED',
	CREATE_DISCUSSION = 'CREATE_DISCUSSION',
	CREATE_REFERENDUM = 'CREATE_REFERENDUM',
	ADD_CONTEXT = 'ADD_CONTEXT',
	TAKE_QUIZ = 'TAKE_QUIZ',
	QUIZ_ANSWER_CORRECT = 'QUIZ_ANSWER_CORRECT',
	CREATE_TIP = 'CREATE_TIP',
	GIVE_TIP = 'GIVE_TIP',
	VOTE_TREASURY_PROPOSAL = 'VOTE_TREASURY_PROPOSAL',
	CREATE_BOUNTY = 'CREATE_BOUNTY',
	APPROVE_BOUNTY = 'APPROVE_BOUNTY',
	CREATE_CHILD_BOUNTY = 'CREATE_CHILD_BOUNTY',
	CLAIM_BOUNTY = 'CLAIM_BOUNTY',
	UPDATE_PROFILE = 'UPDATE_PROFILE',
	CENSORED = 'CENSORED',
	ON_CHAIN_IDENTITY_INITIATED = 'ON_CHAIN_IDENTITY_INITIATED',
	DELEGATED = 'DELEGATED',
	UNDELEGATED = 'UNDELEGATED',
	RECEIVED_DELEGATION = 'RECEIVED_DELEGATION',
	DECISION_DEPOSIT_ON_FORIEGN_PROPOSAL = 'DECISION_DEPOSIT_ON_FORIEGN_PROPOSAL',
	RECIEVED_REACTION = 'RECIEVED_REACTION',
	REMOVED_VOTE = 'REMOVED_VOTE',
	PROPOSAL_FAILED = 'PROPOSAL_FAILED',
	PROPOSAL_PASSED = 'PROPOSAL_PASSED',
	IDENTITY_CLEARED = 'IDENTITY_CLEARED'
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

export interface IChildBounty {
	description: string;
	index: number;
	status: string;
	reward: string;
	title: string;
	curator?: string;
	createdAt?: Date;
	source?: 'polkassembly' | 'subsquare';
	categories?: string[];
	payee?: string;
}
export interface IChildBountiesResponse {
	child_bounties: IChildBounty[];
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

export interface IBountyStats {
	availableBountyPool: string;
	activeBounties: string;
	peopleEarned: string;
	totalRewarded: string;
	totalBountyPool: string;
}

export interface IBountyUserActivity {
	amount: string;
	activity: string;
	address: string;
	created_at: Date;
}

export interface IBountyProposerResponse {
	proposals: {
		trackNumber: number;
		index: number;
		proposer: string;
		reward: string;
	}[];
}
export interface IBountyProposalsResponse {
	proposals: {
		proposer: string;
		index: number;
		trackNumber: number;
		status: string;
		bountyId: number;
		reward: string | null;
	}[];
}

export interface IPayout {
	beneficiary: string;
	amount: string;
	expireAt: string;
	startedAt: string;
	payoutIndex: number;
	generalIndex: string;
	status: 'Pending';
}

export interface IHistoryItem {
	date: string;
	balance: string;
}

export interface IOverviewProps {
	priceWeeklyChange: {
		isLoading: boolean;
		value: string;
	};
	isUsedInGovAnalytics?: boolean;
	currentTokenPrice: {
		isLoading: boolean;
		value: string;
	};
	available: {
		isLoading: boolean;
		value: string;
		valueUSD: string;
	};
	spendPeriod: {
		isLoading: boolean;
		percentage: number;
		value: {
			days: number;
			hours: number;
			minutes: number;
			total: number;
		};
	};
	nextBurn: {
		isLoading: boolean;
		value: string;
		valueUSD: string;
	};
	tokenValue: number;
}

export interface ITreasuryResponseData {
	history: IHistoryItem[] | null;
	status: string;
}

export interface IDailyTreasuryTallyData {
	created_at: string;
	balance: string;
}

export interface IDelegateAddressDetails {
	address: string;
	bio: string;
	dataSource: string[];
	delegatedBalance: string;
	image: string;
	receivedDelegationsCount: number;
	votedProposalsCount: number;
	username?: string;
	identityInfo?: IIdentityInfo | null;
}

export enum EDelegationAddressFilters {
	DELEGATED_VOTES = 'delegatedBalance',
	RECEIVED_DELEGATIONS = 'receivedDelegationsCount',
	VOTED_PROPOSALS = 'votedProposalsCount'
}

export enum EDelegationSourceFilters {
	POLKASSEMBLY = 'polkassembly',
	PARITY = 'parity',
	NOVA = 'nova',
	W3F = 'w3f',
	NA = 'individual'
}

export interface ICommentsSummary {
	summary_negative: string;
	summary_positive: string;
	summary_neutral: string;
}

interface IProxyAccount {
	account_display: {
		address: string;
	};
	proxy_type: string;
}

interface IProxy {
	proxy_account: IProxyAccount[];
	real_account: IProxyAccount[];
}

interface IMultisigAccount {
	address: string;
}

interface IMultiAccountMember {
	address: string;
}

interface IMultisig {
	multi_account: IMultisigAccount[];
	multi_account_member: IMultiAccountMember[];
	threshold: number;
}

export interface IAccountData {
	address: string;
	balance: string;
	balance_lock: string;
	lock: string;
	multisig: IMultisig;
	proxy: IProxy;
	nft_amount: string;
	nonce: number;
}
export interface INetworkWalletErr {
	message: string;
	description: string;
	error: number;
}

export interface IChildBountySubmission {
	content: string;
	createdAt: Date;
	link: string;
	parentBountyIndex: number;
	proposer: string;
	reqAmount: string;
	status: EChildbountySubmissionStatus;
	tags: string[];
	title: string;
	updatedAt: Date;
	userId: number;
	bountyData?: {
		title?: string;
		content?: string;
		reqAmount?: string;
		status?: string;
		curator?: string;
		createdAt?: Date;
	};
	id: string;
	rejectionMessage?: string;
	expand?: boolean;
	loading?: boolean;
}

export enum EChildbountySubmissionStatus {
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PENDING = 'pending',
	OUTDATED = 'outdated',
	DELETED = 'deleted'
}
export enum EUserCreatedBountySubmissionStatus {
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PENDING = 'pending',
	DELETED = 'deleted',
	PAID = 'paid'
}

export enum EPendingCuratorReqType {
	SENT = 'sent',
	RECEIVED = 'received'
}

export interface IPendingCuratorReq extends IBountyListing {
	reqType: EPendingCuratorReqType;
	proposalType: ProposalType;
	content: string;
	parentBountyIndex?: number;
	accepted?: boolean;
	expand?: boolean;
	loading?: boolean;
}

export interface ISubsquidChildBontyAndBountyRes {
	proposer: string;
	index: number;
	status: string;
	reward: string;
	payee: string;
	curator: string;
	createdAt: string;
	parentBountyIndex: number;
}
export interface IFollowEntry {
	id: string;
	network: string;
	created_at: Date;
	follower_user_id: number;
	followed_user_id: number;
	updated_at: Date;
	isFollow: boolean;
}

export enum EExpertReqStatus {
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PENDING = 'pending'
}

export enum LinkProxyType {
	MULTISIG = 'MULTISIG',
	PROXY = 'PROXY',
	PUREPROXY = 'PUREPROXY'
}
export interface IIdentityInfo {
	display: string;
	legal: string;
	email: string;
	twitter: string;
	web: string;
	github: string;
	discord: string;
	matrix: string;
	displayParent: string;
	nickname: string;
	isIdentitySet: boolean;
	isVerified: boolean;
	isGood: boolean;
	judgements: RegistrationJudgement[];
	verifiedByPolkassembly: boolean;
	parentProxyTitle: string | null;
	parentProxyAddress: string;
}

export interface IMessage {
	id: string;
	content: string;
	created_at: Date;
	updated_at: Date;
	senderAddress: string;
	receiverAddress: string;
	senderImage?: string;
	senderUsername?: string;
	viewed_by: string[];
}

export enum EChatRequestStatus {
	ACCEPTED = 'accepted',
	REJECTED = 'rejected',
	PENDING = 'pending'
}

export enum EChatFilter {
	ALL = 'all',
	UNREAD = 'unread',
	READ = 'read'
}

export enum EChatTab {
	MESSAGES = 'messages',
	REQUESTS = 'requests'
}

export interface IChatRecipient {
	username?: string;
	address: string;
	image?: string;
}

export interface IChat {
	chatId: string;
	participants: string[];
	chatInitiatedBy: string;
	created_at: Date;
	updated_at: Date;
	requestStatus: EChatRequestStatus;
	latestMessage: IMessage;
	recipientProfile: IChatRecipient | null;
}

export interface IChatsResponse {
	messages: IChat[];
	requests: IChat[];
}

export enum EUserCreatedBountiesStatuses {
	ACTIVE = 'active',
	CLOSED = 'closed',
	CLAIMED = 'claimed',
	CANCELLED = 'cancelled'
}

export interface IUserCreatedBounty {
	content: string;
	created_at: string;
	deadline_date: string;
	history?: IPostHistory[];
	post_index: number;
	max_claim: number;
	post_type: ProposalType;
	proposer: string;
	reward: string;
	status: EUserCreatedBountiesStatuses;
	submission_guidelines: string;
	claimed_percentage: number;
	tags: string[];
	title: string;
	network?: string;
	twitter_handle: string;
	source: 'polkassembly' | 'twitter';
	post_reactions?: IReactions;
	updated_at: string;
	user_id: number;
	comments?: any[];
	index?: number;
}
export enum EUserCreatedBountyActions {
	EDIT = 'edit',
	DELETE = 'delete',
	APPROVE = 'approve'
}
