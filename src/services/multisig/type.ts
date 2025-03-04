// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface IPureProxy {
	address: string;
	proxyType: string;
}

export interface IMultisig {
	signatories: Array<string>;
	address: string;
	threshold: number;
	pureProxy: Array<IPureProxy>;
	name?: string;
	email?: string;
	github?: string;
	twitter?: string;
	matrix?: string;
	discord?: string;
}

export interface IProxy {
	address: string;
	name?: string;
	email?: string;
	github?: string;
	twitter?: string;
	matrix?: string;
	discord?: string;
	proxyType: string;
}
