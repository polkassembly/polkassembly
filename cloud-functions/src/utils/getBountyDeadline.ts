import * as chrono from 'chrono-node';
import dayjs from 'dayjs';

export default function getBountyDeadline(bounty: string | null): Date {
	let deadline;
	if (bounty === '' || bounty === null) {
		deadline = dayjs().add(7, 'day');
	} else {
		deadline = dayjs(chrono.parseDate(bounty));
		if (deadline === null || dayjs().isAfter(deadline)) {
			deadline = dayjs().add(7, 'day');
		}
	}
	return deadline.toDate();
}
