// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const getTimeline = (
	proposals: any,
	isStatus?: {
		swap: boolean;
	}
) => {
	return (
		proposals?.map((obj: any) => {
			const statuses = obj?.statusHistory as { status: string }[];
			if (obj.type && ['ReferendumV2', 'FellowshipReferendum'].includes(obj.type)) {
				const index = statuses?.findIndex((v) => v.status === 'DecisionDepositPlaced');
				if (index >= 0) {
					const decidingIndex = statuses?.findIndex((v) => v.status === 'Deciding');
					if (decidingIndex >= 0) {
						const obj = statuses[index];
						statuses.splice(index, 1);
						statuses.splice(decidingIndex, 0, obj);
						if (isStatus) {
							isStatus.swap = true;
						}
					}
				}
			}
			return {
				created_at: obj?.createdAt,
				hash: obj?.hash,
				index: obj?.index,
				statuses,
				type: obj?.type
			};
		}) || []
	);
};
