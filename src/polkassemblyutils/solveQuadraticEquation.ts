// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { bnSqrt } from "@polkadot/util";
import BN from "bn.js";

/**
 * @name solveQuadraticEquation
 * @summary Returns the root of a polynomial function of degree 2, a*x^2 + b*x + c where a, b and c are BN from bn.js.
 * @param a
 * @param b
 * @param c
 **/

export function solveQuadraticEquation(a: BN, b: BN, c: BN): BN[] {
    const TWO = new BN(2);
    const FOUR = new BN(4);

    const result = b
        .neg()
        .add(bnSqrt(b.pow(TWO).sub(FOUR.mul(a).mul(c)).toString()))
        .div(TWO.mul(a));
    const result2 = b
        .neg()
        .sub(bnSqrt(b.pow(TWO).sub(FOUR.mul(a).mul(c)).toString()))
        .div(TWO.mul(a));

    return [result, result2];
}
