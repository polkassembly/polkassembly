// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';

interface Args {
	network: string;
	currentBlockNumber: number;
	date: Date;
}

const dateToBlockNo = ({ network, currentBlockNumber, date }: Args) => {
	if (!currentBlockNumber || !date || !network) return null;
	const blockTimeSeconds: number = chainProperties?.[network]?.blockTime / 1000;

	const selectedTime: Date = new Date(date);
	const now = new Date();
	const midnight: Date = new Date(selectedTime.getFullYear(), selectedTime.getMonth(), selectedTime.getDate());

	const diff: number = now.getTime() - midnight.getTime();
	const seconds: number = Math.floor(diff / 1000);
	const block = currentBlockNumber - Math.floor(seconds / blockTimeSeconds);

	return block || null;
};

export default dateToBlockNo;
