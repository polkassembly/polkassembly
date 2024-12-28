// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface ICreateBountyFormState {
	address: string;
	balance: string;
	claims: number;
	deadline: string | null;
	content: string;
	guidelines: string;
	title: string;
	twitter: string;
	categories: string[];
	isTwitterVerified: boolean;
	newBountyAmount: string;
}
