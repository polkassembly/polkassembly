// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface ICurvesInformationStore {
	approval: number;
	approvalThreshold: number;
	support: number;
	supportThreshold: number;
	supportData: IPoint[];
	currentSupportData: IPoint[];
	approvalData: IPoint[];
	currentApprovalData: IPoint[];
}

export interface IPoint {
	x: number;
	y: number;
}
