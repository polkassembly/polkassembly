// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';

const futureDate = dayjs('2023-06-15 17:35:30');

export function getProposalGoLiveTime() {
	const currentDate = dayjs();
	const countdownDuration = dayjs.duration(futureDate.diff(currentDate));
	let days: any = countdownDuration.days();
	let hours: any = countdownDuration.hours();
	let minutes: any = countdownDuration.minutes();
	let seconds: any = countdownDuration.seconds();
	if (days < 10) days = '0' + days;
	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;
	return [days, hours, minutes, seconds];
}
