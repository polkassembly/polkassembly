// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAmbassadorProposalContent } from '~src/redux/addAmbassadorSeeding/@types';

export interface IAmbassadorSeeding {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
}

export interface IPromoteCall {
	className?: string;
}

export interface IXCMCall {
	className?: string;
}
export enum EAmbassadorSeedingRanks {
	AMBASSADOR = 1,
	SENIOR_AMBASSADOR = 2,
	HEAD_AMBASSADOR = 3
}

export enum EAmbassadorActions {
	ADD_AMBASSADOR = 'addAmbassadorForm',
	REMOVE_AMBASSADOR = 'removeAmbassadorForm',
	REPLACE_AMBASSADOR = 'replaceAmbassadorForm'
}

export interface ICreateAmbassadorProposal {
	className?: string;
	setOpen: (pre: boolean) => void;
	openSuccessModal: () => void;
	action: EAmbassadorActions;
	ambassadorPreimage: { hash: string; length: number };
	proposer: string;
	discussion: IAmbassadorProposalContent;
}

export interface ICreateAmassadorPreimge {
	className?: string;
	action: EAmbassadorActions;
	setOpenSuccessModal: (pre: boolean) => void;
	closeCurrentModal: () => void;
	applicantAddress: string;
	proposer: string;
	rank: EAmbassadorSeedingRanks;
	xcmCallData: string;
	removingApplicantAddress?: string;
}

export interface IAmbassadorProposalCreation {
	className?: string;
	setOpen: (pre: boolean) => void;
	openSuccessModal: () => void;
	action: EAmbassadorActions;
	ambassadorPreimage: { hash: string; length: number };
	proposer: string;
	discussion: IAmbassadorProposalContent;
}
