// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IScoringItem {
	label: string;
	points: string;
	type?: EActionType;
}

export interface IScoringSection {
	icon: string;
	items: IScoringItem[];
	title: string;
}

export enum EActionType {
	OnChain = 'on-chain',
	OffChain = 'off-chain'
}
