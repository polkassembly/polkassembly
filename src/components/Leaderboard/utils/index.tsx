// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';

function getDaySuffix(day: any) {
	if (day > 3 && day < 21) return 'th';
	switch (day % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

export function formatTimestamp(seconds: number) {
	const date = dayjs.unix(seconds);
	const day = date.date();
	const month = date.format('MMM');
	const year = date.format('YY');
	return `${day}${getDaySuffix(day)} ${month}' ${year}`;
}
