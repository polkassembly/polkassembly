// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN, BN_BILLION } from '@polkadot/util';

export function makeReciprocalCurve(reciprocal: any) {
	if (!reciprocal) {
		return null;
	}
	const { factor, xOffset, yOffset } = reciprocal;
	return function (percentage: number) {
		const x = new BN((percentage * BN_BILLION.toNumber()));
		const v = new BN(factor).mul(BN_BILLION).div(new BN(x).add(new BN(xOffset))).toNumber();

		const calcValue = new BN(v)
			.add(new BN(yOffset))
			.toNumber() / BN_BILLION.toNumber();
		return BN.max(new BN(calcValue * BN_BILLION.toNumber()), new BN(0)).toNumber() / BN_BILLION.toNumber();
	};
}

export function makeLinearCurve(linearDecreasing: any) {
	if (!linearDecreasing) {
		return null;
	}
	const { length, floor, ceil } = linearDecreasing;
	return function (percentage: number) {
		const x = new BN(percentage * BN_BILLION.toNumber());

		const xValue = BN.min(x, new BN(length));
		const slope = new BN(ceil).sub(new BN(floor)).mul(BN_BILLION).div(new BN(length));
		const deducted = slope.mul(xValue);

		const perbill = new BN(ceil).mul(BN_BILLION)
			.sub(deducted);
		const calcValue = perbill.div(BN_BILLION);
		return BN.max(calcValue, new BN(0)).toNumber() / BN_BILLION.toNumber();
	};
}
