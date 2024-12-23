// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';

export const blockToSeconds = (network: string, blocks: number, currentBlockNumber: number): string => {
	const blockTimeSeconds: number = chainProperties?.[network]?.blockTime / 1000;
	let divisor: number = 1;
	let text: string = 'sec';

	let blockSeconds;

	if (currentBlockNumber > blocks) {
		blockSeconds = (currentBlockNumber - blocks) * blockTimeSeconds || 0;
	} else {
		blockSeconds = (blocks - currentBlockNumber) * blockTimeSeconds || 0;
	}

	if (blockSeconds > 60 && blockSeconds <= 3600) {
		divisor = 60;
		text = 'min';
	} else if (blockSeconds > 3600 && blockSeconds < 86400) {
		divisor = 3600;
		text = 'hr';
	} else if (blockSeconds >= 86400) {
		divisor = 86400;
		text = 'day';
	}

	const roundedValue = Math.round(blockSeconds / divisor);
	return `${roundedValue} ${text}${roundedValue !== 1 ? 's' : ''}`;
};

export default blockToSeconds;
