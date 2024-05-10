// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FormInstance } from 'antd';
import BN from 'bn.js';
import { ESocials, ILoading, VerificationStatus } from '~src/types';

export interface IAmountBreakDown {
	className?: string;
	txFee: ITxFee;
	changeStep: (step: ESetIdentitySteps) => void;
	perSocialBondFee: BN;
	loading: boolean;
	isIdentityAlreadySet: boolean;
	alreadySetIdentityCredentials: IVerifiedFields;
	address: string;
	setStartLoading: (pre: ILoading) => void;
}

export enum ESetIdentitySteps {
	AMOUNT_BREAKDOWN = 1,
	SET_IDENTITY_FORM = 2,
	SOCIAL_VERIFICATION = 3
}

export interface ITxFee {
	bondFee: BN;
	gasFee: BN;
	registerarFee: BN;
	minDeposite: BN;
}

export interface IName {
	legalName: string;
	displayName: string;
}

export interface ISocials {
	web: { value: string; verified: boolean };
	email: { value: string; verified: boolean };
	twitter: { value: string; verified: boolean };
	riot: { value: string; verified: boolean };
}
export interface IVerifiedFields {
	email: string;
	twitter: string;
	displayName: string;
	legalName: string;
	alreadyVerified: boolean;
	isIdentitySet: boolean;
	riot: string;
	web: string;
}

export interface IOnChainIdentity {
	open: boolean;
	setOpen: (pre: boolean) => void;
	openAddressLinkedModal?: boolean;
	setOpenAddressLinkedModal?: (pre: boolean) => void;
}

export interface IIdentityForm {
	className?: string;
	address: string;
	txFee: ITxFee;
	name: IName;
	onChangeName: (pre: IName) => void;
	socials: ISocials;
	onChangeSocials: (pre: ISocials) => void;
	setTxFee: (pre: ITxFee) => void;
	setStartLoading: (pre: ILoading) => void;
	onCancel: () => void;
	perSocialBondFee: BN;
	changeStep: (pre: ESetIdentitySteps) => void;
	closeModal: (pre: boolean) => void;
	form: FormInstance;
	setIsIdentityCallDone: (pre: boolean) => void;
	setIdentityHash: (pre: string) => void;
	setAddressChangeModalOpen: () => void;
	alreadySetIdentityCredentials: IVerifiedFields;
	wallet?: any;
}

export interface IIdentityInProgress {
	className?: string;
	socials: ISocials;
	open?: boolean;
	changeStep: (step: ESetIdentitySteps) => void;
	close: (pre: boolean) => void;
	openPreModal: (pre: boolean) => void;
	handleVerify: (pre: ESocials) => Promise<void>;
}

export interface IIdentitySocialVerifications {
	className?: string;
	socials: ISocials;
	setSocials: (pre: ISocials) => void;
	address: string;
	startLoading: (pre: ILoading) => void;
	onCancel: () => void;
	changeStep: (pre: ESetIdentitySteps) => void;
	closeModal: (pre: boolean) => void;
	perSocialBondFee: BN;
	identityHash: string;
	setOpenSuccessModal: (pre: boolean) => void;
}
export interface ISocialLayout {
	title: string;
	description: string;
	value: string | null;
	onVerify: () => void;
	verified?: boolean;
	status?: VerificationStatus;
	loading: boolean;
	fieldName?: ESocials;
}
export interface IJudgementResponse {
	message?: string;
	hash?: string;
}

export interface IIdentitySuccessState {
	className?: string;
	socials: ISocials;
	name: IName;
	txFee: ITxFee;
	open?: boolean;
	address: string;
	changeStep: (step: ESetIdentitySteps) => void;
	close: (pre: boolean) => void;
	openPreModal: (pre: boolean) => void;
}

export interface IVerificationSuccessState {
	className?: string;
	socialHandle?: string;
	social: string;
	open: boolean;
	onClose: (pre: boolean) => void;
}

export const WHITESPACE = [' ', '\t'];
