// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const POLL_TYPE = {
	NORMAL: 'normal',
	OPTION: 'option',
	REMARK: 'remark_poll'
};

export function isPollTypeValid(pollType: string) {
	return pollTypes.includes(pollType);
}

export const pollTypes = [POLL_TYPE.NORMAL, POLL_TYPE.OPTION, POLL_TYPE.REMARK];

export default POLL_TYPE;