// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IModalStore {
	open: boolean;
	footerType?: EFooterType;
	contentType?: EContentType;
	titleType?: ETitleType;
}

export enum ETitleType {
	NONE = 'none'
}

export enum EFooterType {
	NONE = 'none'
}
export enum EContentType {
	NONE = 'none'
}
