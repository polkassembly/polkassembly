// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FormInstance } from 'antd';
import BN from 'bn.js';
import { ReactNode } from 'react';
import { ESocials, ILoading, VerificationStatus } from '~src/types';

export interface IAmountBreakDown {
	className?: string;
	txFee: ITxFee;
	loading: boolean;
	setStartLoading: (pre: ILoading) => void;
	changeStep: (pre: ESetIdentitySteps) => void;
}

export enum ESetIdentitySteps {
	AMOUNT_BREAKDOWN = 1,
	SET_IDENTITY_FORM = 2,
	SOCIAL_VERIFICATION = 3
}

export interface ITxFee {
	gasFee: BN;
	registerarFee: BN;
	minDeposite: BN;
}

export interface IName {
	legalName: string;
	displayName: string;
}

export interface IIdentitySocials {
	web: { value: string; verified: boolean };
	email: { value: string; verified: boolean };
	twitter: { value: string; verified: boolean };
	matrix: { value: string; verified: boolean };
}
export interface IIdentityInfo {
	displayName: string;
	legalName: string;
	alreadyVerified: boolean;
	isIdentitySet: boolean;
	email: string;
	twitter: string;
	web: string;
	github: string;
	discord: string;
	matrix: string;
	verifiedByPolkassembly: boolean;
}

export interface IOnChainIdentity {
	open: boolean;
	setOpen: (pre: boolean) => void;
	openAddressModal?: boolean;
	setOpenAddressModal?: (pre: boolean) => void;
}

export interface IIdentityForm {
	className?: string;
	txFee: ITxFee;
	setTxFee: (pre: ITxFee) => void;
	setStartLoading: (pre: ILoading) => void;
	onCancel: () => void;
	closeModal: (pre: boolean) => void;
	setAddressChangeModalOpen: () => void;
	form: FormInstance;
	setOpenIdentitySuccessModal: (pre: boolean) => void;
	changeStep: (pre: ESetIdentitySteps) => void;
}

export interface IIdentityInProgress {
	className?: string;
	open?: boolean;
	close: (pre: boolean) => void;
	openPreModal: (pre: boolean) => void;
	handleVerify: (pre: ESocials, checkingVerified?: boolean) => Promise<void>;
	changeStep: (pre: ESetIdentitySteps) => void;
}

export interface IIdentitySocialVerifications {
	className?: string;
	startLoading: (pre: ILoading) => void;
	onCancel: () => void;
	closeModal: (pre: boolean) => void;
	setOpenSuccessModal: (pre: boolean) => void;
	changeStep: (pre: ESetIdentitySteps) => void;
}
export interface ISocialLayout {
	title: string;
	description: string | ReactNode;
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
	open?: boolean;
	close: (pre: boolean) => void;
	openPreModal: (pre: boolean) => void;
	changeStep: (pre: ESetIdentitySteps) => void;
}

export interface IVerificationSuccessState {
	className?: string;
	socialHandle?: string;
	social: string;
	open: boolean;
	onClose: (pre: boolean) => void;
}

export const WHITESPACE = [' ', '\t'];

export interface IIdentityFormActionButtons {
	txFee: ITxFee;
	onCancel: () => void;
	handleSetIdentity: (requestJudgement: boolean) => void;
	loading: boolean;
	availableBalance: BN | null;
	okAll: boolean;
	proxyAddresses: string[];
	showProxyDropdown: boolean;
	isProxyExistsOnWallet: boolean;
}

export interface IAllowSetIdentity {
	identityInfo: IIdentityInfo;
	displayName: string;
	email: { value: string; verified: boolean };
	legalName: string;
	twitter: { value: string; verified: boolean };
	matrix: { value: string; verified: boolean };
}
