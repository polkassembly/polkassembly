// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs, { Dayjs } from 'dayjs';
import { blocksToRelevantTime } from '~src/components/Listing/Tracks/AboutTrackCard';

export const getPeriodData = (network: string, date: Dayjs, trackData: any, fieldKey: string) => {
	const period = blocksToRelevantTime(network, Number(trackData[fieldKey]));
	let periodEndsAt = date.clone();
	let periodPercent = 0;
	if (period) {
		if (period.includes('hrs')) {
			periodEndsAt = periodEndsAt.add(Number(period.split(' ')[0]), 'hour');
		} else if (period.includes('days')) {
			periodEndsAt = periodEndsAt.add(Number(period.split(' ')[0]), 'day');
		} else if (period.includes('min')) {
			periodEndsAt = periodEndsAt.add(Number(period.split(' ')[0]), 'minute');
		}
		periodPercent = Math.round(dayjs().diff(date, 'minute') / periodEndsAt.diff(date, 'minute') * 100);
	}
	const periodCardVisible = periodEndsAt.diff(dayjs(), 'second') > 0;
	return {
		period,
		periodCardVisible,
		periodEndsAt,
		periodPercent
	};
};