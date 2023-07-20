// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

export enum VoteThresholdEnum {
	Supermajorityapproval = 'Supermajorityapproval',
	Supermajorityrejection = 'Supermajorityrejection',
	Simplemajority = 'Simplemajority'
}

export type VoteThreshold = keyof typeof VoteThresholdEnum;

export interface BaseThresholdResult {
	isValid: boolean;
}

export interface PassingThresholdResult extends BaseThresholdResult {
	passingThreshold?: BN;
}

export interface FailingThresholdResult extends BaseThresholdResult {
	failingThreshold?: BN;
}
