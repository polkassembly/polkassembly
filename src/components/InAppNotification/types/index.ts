// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export enum ENotificationFilters {
	PROPOSALS_CREATED = 'newProposalCreated',
	MENTIONED = 'newMention',
	COMMENTED = 'newCommentAdded',
	REPLIED = 'newReplyAdded',
	PROPOSALS_STATUS_CHANGED = 'proposalStatusChanged',
	CONTENT_DELETED_BY_MOD = 'contentDeletedByMod',
	OWN_PROPOSAL_CREATED = 'ownProposalCreated',
	OPENGOV_REFERENDUM_SUBMITTED = 'openGovReferendumSubmitted',
	OPENGOV_REFERENDUM_INVOTING = 'openGovReferendumInVoting',
	OPENGOV_REFERENDUM_CLOSED = 'openGovReferendumClosed',
	FELLOWSHIP_REFERENDUM_SUBMITTED = 'fellowShipReferendumSubmitted',
	FELLOWSHIP_REFERENDUM_INVOTING = 'fellowShipReferendumInVoting',
	FELLOWSHIP_REFERENDUM_CLOSED = 'fellowShipReferendumClosed',
	PIP_SUBMITTED = 'pipSubmitted',
	PIP_INVOTING = 'pipInVoting',
	PIP_CLOSED = 'pipClosed',
	GOV1_PROPOSAL_SUBMITTED = 'gov1ProposalSubmitted',
	GOV1_PROPOSAL_INVOTING = 'gov1ProposalInVoting',
	GOV1_PROPOSAL_CLOSED = 'gov1ProposalClosed'
}

export interface IInAppNotification {
	createdAt: Date;
	id: string;
	message: string;
	title: string;
	url: string;
	userId: number;
	trigger: ENotificationFilters;
	network: string;
	type?: EInAppNotificationsType;
}

export enum EInAppNotificationsType {
	RECENT = 'recent',
	UNREAD = 'unread'
}

export interface IInAppNotificationResponse {
	notifications: IInAppNotification[];
	lastSeen: Date | null;
	totalNotificationsCount?: number;
	filterBy?: ECustomNotificationFilters;
}

export enum ECustomNotificationFilters {
	ALL = 'all',
	COMMENTS = 'comments',
	MENTIONS = 'mentions',
	PROPOSALS = 'proposals'
}

export interface INotificationsFilters {
	className?: string;
	inPage?: boolean;
	onChange: (filter: ECustomNotificationFilters) => void;
}

export interface INotificationsTab {
	inPage: boolean;
	closePopover?: (pre: boolean) => void;
	setStopInterval: (pre: boolean) => void;
	isStopInterval: boolean;
}
