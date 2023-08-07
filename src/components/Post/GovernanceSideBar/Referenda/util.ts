// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BigNumber from "bignumber.js";
// import { BN, BN_BILLION } from '@polkadot/util';

export function makeReciprocalCurve(reciprocal: any) {
    if (!reciprocal) {
        return null;
    }
    const { factor, xOffset, yOffset } = reciprocal;
    return function (percentage: number) {
        const x = percentage * Math.pow(10, 9);

        const v = new BigNumber(factor)
            .div(new BigNumber(x).plus(xOffset))
            .multipliedBy(Math.pow(10, 9))
            .toFixed(0, BigNumber.ROUND_DOWN);

        const calcValue = new BigNumber(v)
            .plus(yOffset)
            .div(Math.pow(10, 9))
            .toString();
        return BigNumber.max(calcValue, 0).toNumber();
    };
}

export function makeLinearCurve(linearDecreasing: any) {
    if (!linearDecreasing) {
        return null;
    }
    const { length, floor, ceil } = linearDecreasing;
    return function (percentage: number) {
        const x = percentage * Math.pow(10, 9);

        const xValue = BigNumber.min(x, length);
        const slope = new BigNumber(ceil).minus(floor).dividedBy(length);
        const deducted = slope.multipliedBy(xValue).toString();

        const perbill = new BigNumber(ceil)
            .minus(deducted)
            .toFixed(0, BigNumber.ROUND_DOWN);
        const calcValue = new BigNumber(perbill)
            .div(Math.pow(10, 9))
            .toString();
        return BigNumber.max(calcValue, 0).toNumber();
    };
}
