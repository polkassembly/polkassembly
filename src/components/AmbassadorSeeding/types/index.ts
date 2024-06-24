// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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

export interface ICreateAmassadorPreimge {
	className?: string;
	setOpenSuccessModal: (pre: boolean) => void;
	closeCurrentModal: () => void;
}
