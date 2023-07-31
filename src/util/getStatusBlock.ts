// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const getStatusBlock = (timeline: any[], type: string[], status: string) => {
	let deciding: any;
	if (timeline && Array.isArray(timeline)) {
		timeline.some((v) => {
			if (v && type.includes(v.type)  && v.statuses && Array.isArray(v.statuses)) {
				let isFind = false;
				v.statuses.some((v: any) => {
					if (v && v.status === status) {
						isFind = true;
						deciding = v;
					}
				});
				return isFind;
			}
			return false;
		});
	}
	return deciding;
};