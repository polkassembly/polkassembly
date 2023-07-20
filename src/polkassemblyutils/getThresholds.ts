// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

import { newtonRaphson, NewtonRaphsonResult } from './newton-raphson';
import { solveQuadraticEquation } from './solveQuadraticEquation';
import {
	FailingThresholdResult,
	PassingThresholdResult,
	VoteThreshold,
	VoteThresholdEnum,
} from './types';

interface ThresholdBase {
	totalIssuance: BN;
	threshold: VoteThreshold;
}

interface getPassingThresholdParamsType extends ThresholdBase {
	nays: BN;
	naysWithoutConviction: BN;
}

interface getFailingThresholdParamsType extends ThresholdBase {
	ayes: BN;
	ayesWithoutConviction: BN;
}

const ONE = new BN(1);
const TWO = new BN(2);
const THREE = new BN(3);
const TEN = new BN(10);
const MAX_ITERATIONS = 20;

interface FAndFpParamsTypes {
	totalIssuance: BN;
	votes: BN;
	votesWithoutConviction: BN;
}

type PolynomialFunction = (x: BN) => BN;
interface FandFpType {
	f: PolynomialFunction;
	fp: PolynomialFunction;
}

const getFAndFp = function ({
	totalIssuance,
	votes,
	votesWithoutConviction,
}: FAndFpParamsTypes): FandFpType {
	return {
		f: (x: BN) => {
			// with v: votes, vc: votes without conviction, t: total issuance
			// x^3 + v*x^2 - (vc)^2 * t
			return x
				.pow(THREE)
				.add(votesWithoutConviction.mul(x.pow(TWO)))
				.sub(votes.pow(TWO).mul(totalIssuance));
		},
		fp: (x: BN) => {
			// 3*x^2 + 2*v*x
			return THREE.mul(x.pow(TWO)).add(
				TWO.mul(votesWithoutConviction).mul(x),
			);
		},
	};
};

const raphsonIterations = function (
	f: PolynomialFunction,
	fp: PolynomialFunction,
): NewtonRaphsonResult {
	const initialGuess = ONE;
	let result: NewtonRaphsonResult = { foundRoot: false };
	let i = 1;

	while (!result.foundRoot && i < MAX_ITERATIONS) {
		result = newtonRaphson(f, fp, initialGuess.mul(TEN).pow(new BN(i)));
		i++;
	}

	return result;
};

/**
 * @name getFailingThreshold
 * @summary Calculates amount of nays needed for a referendum to fail
 **/
export function getFailingThreshold({
	ayes,
	ayesWithoutConviction,
	totalIssuance,
	threshold,
}: getFailingThresholdParamsType): FailingThresholdResult {
	if (ayes.isZero() || ayesWithoutConviction.isZero()) {
		// there is no vote against, any number of aye>0 would work

		return {
			failingThreshold: ONE,
			isValid: true,
		};
	}

	// if there are more ayes
	// than the (total issuance) /2 it can't fail
	if (ayesWithoutConviction.gt(totalIssuance.divn(2))) {
		return {
			isValid: false,
		};
	}

	if (threshold === VoteThresholdEnum.Simplemajority) {
		return {
			failingThreshold: ayes,
			isValid: true,
		};
	}

	if (threshold === VoteThresholdEnum.Supermajorityrejection) {
		const { f, fp } = getFAndFp({
			totalIssuance,
			votes: ayes,
			votesWithoutConviction: ayesWithoutConviction,
		});
		const result = raphsonIterations(f, fp);

		return result.foundRoot
			? {
					failingThreshold: result.result as BN,
					isValid: true,
			  }
			: {
					isValid: false,
			  };
	} else {
		// SuperMajorityRejection
		// with v: votes, vc: votes without conviction, t: total issuance
		// -t*x^2 + v^2*x + (v)^2*vc
		const res = solveQuadraticEquation(
			totalIssuance.neg(),
			ayes.pow(TWO),
			ayes.pow(TWO).mul(ayesWithoutConviction),
		);

		return {
			failingThreshold: BN.max(res[0], res[1]),
			isValid: true,
		};
	}
}

/**
 * @name getPassingThreshold
 * @summary Calculates amount of ayes needed for a referendum to pass
 **/

export function getPassingThreshold({
	nays,
	naysWithoutConviction,
	totalIssuance,
	threshold,
}: getPassingThresholdParamsType): PassingThresholdResult {
	if (nays.isZero() || naysWithoutConviction.isZero()) {
		// there is no vote against, any number of aye>0 would work
		return {
			isValid: true,
			passingThreshold: ONE,
		};
	}

	// if there are more nays
	// than the (total issuance) /2 it can't pass
	if (naysWithoutConviction.gt(totalIssuance.divn(2))) {
		return {
			isValid: false,
		};
	}

	if (threshold === VoteThresholdEnum.Simplemajority) {
		return {
			isValid: true,
			passingThreshold: nays,
		};
	}

	if (threshold === VoteThresholdEnum.Supermajorityapproval) {
		const { f, fp } = getFAndFp({
			totalIssuance,
			votes: nays,
			votesWithoutConviction: naysWithoutConviction,
		});
		const result = raphsonIterations(f, fp);
		return result.foundRoot
			? {
					isValid: true,
					passingThreshold: result.result as BN,
			  }
			: {
					isValid: false,
			  };
	} else {
		// SuperMajorityRejection
		// with v: votes, vc: votes without conviction, t: total issuance
		// -t*x^2 + v^2*x + (v)^2*vc
		const res = solveQuadraticEquation(
			totalIssuance.neg(),
			nays.pow(TWO),
			nays.pow(TWO).mul(naysWithoutConviction),
		);
		return {
			isValid: true,
			passingThreshold: BN.max(res[0], res[1]),
		};
	}
}
