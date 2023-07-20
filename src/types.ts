// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import WalletConnectProvider from '@walletconnect/web3-provider';
import { Dispatch, SetStateAction } from 'react';

import { network, tokenSymbol } from './global/networkConstants';
import { ProposalType } from './global/proposalType';
import BN from 'bn.js';

export interface UserDetailsContextType {
    id?: number | null;
    picture?: string | null;
    username?: string | null;
    email?: string | null;
    email_verified?: boolean | null;
    addresses?: string[] | null;
    allowed_roles?: string[] | null;
    defaultAddress?: string | null;
    setUserDetailsContextState: Dispatch<
        SetStateAction<UserDetailsContextType>
    >;
    web3signup?: boolean | null;
    walletConnectProvider: WalletConnectProvider | null;
    setWalletConnectProvider: React.Dispatch<
        React.SetStateAction<WalletConnectProvider | null>
    >;
    isLoggedOut: () => boolean;
    loginWallet: Wallet | null;
    delegationDashboardAddress: string;
    loginAddress: string;
    networkPreferences: INetworkPreferences;
    primaryNetwork: string;
    is2FAEnabled?: boolean;
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
}

export enum NotificationStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
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
    Simplemajority = 'Simplemajority',
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
    NAY = 'NAY',
}

export enum PolkassemblyProposalTypes {
    TreasurySpendProposal,
    TipProposal,
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
    SUBWALLET = 'subwallet-js',
    METAMASK = 'metamask',
    WALLETCONNECT = 'walletconnect',
    NOVAWALLET = 'polkadot-js',
    POLYWALLET = 'polywallet',
    OTHER = '',
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

export interface Post {
    user_id: number;
    content: string;
    created_at: Date;
    id: number | string;
    last_edited_at: Date;
    last_comment_at: Date;
    title: string;
    topic_id: number;
    proposer_address: string;
    post_link: PostLink | null;
    username?: string;
    gov_type?: 'gov_1' | 'open_gov';
    tags?: string[] | [];
    history?: IPostHistory[];
    subscribers?: number[];
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
    For = 5,
}

export interface CommentReply {
    user_id: number;
    content: string;
    created_at: Date;
    id: string;
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
    All = 'all',
    Delegated = 'delegated',
    Received_Delegation = 'received_delegation',
    Undelegated = 'undelegated',
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
    bio: string;
    active_delegation_count: number;
    voted_proposals_count: number;
    isNovaWalletDelegate?: boolean;
}

export enum EVoteDecisionType {
    AYE = 'aye',
    NAY = 'nay',
    ABSTAIN = 'abstain',
    SPLIT = 'split',
}

export enum NOTIFICATION_CHANNEL {
    EMAIL = 'email',
    TELEGRAM = 'telegram',
    DISCORD = 'discord',
    ELEMENT = 'element',
    SLACK = 'slack',
    IN_APP = 'in_app',
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
    channelPreferences: {
        [channel: string]: IUserNotificationChannelPreferences;
    };
    triggerPreferences: {
        [network: string]: {
            [index: string]: IUserNotificationTriggerPreferences;
        };
    };
}
export interface ILastVote {
    decision: EVoteDecisionType | null;
    time: Date | string | null;
    balance: BN | string;
    conviction: number;
}
