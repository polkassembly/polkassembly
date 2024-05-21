// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const calculateDefaultRange = (dataLength: number): [number, number] => {
	if (dataLength > 40) {
		return [dataLength - 40, dataLength - 1];
	}
	return [0, dataLength - 1];
};
