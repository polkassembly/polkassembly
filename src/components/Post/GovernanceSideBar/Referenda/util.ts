// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PalletConvictionVotingTally, PalletRankedCollectiveTally, PalletReferendaReferendumInfoConvictionVotingTally, PalletReferendaReferendumInfoRankedCollectiveTally, PalletReferendaTrackInfo } from '@polkadot/types/lookup';
import { BN, BN_BILLION, BN_MILLION, BN_THOUSAND, bnMax, bnMin, formatNumber } from '@polkadot/util';

const CURVE_LENGTH = 500;
const PT_CUR = 0;
const PT_NEG = 1;
const PT_POS = 2;

export interface CurveGraph {
    approval: BN[];
    support: BN[];
    x: BN[];
}

export interface ChartResult {
  progress: {
    percent: number;
    value: BN;
    total: BN;
  };
  labels: string[];
  values: number[][];
}

export interface ChartResultExt extends ChartResult {
  changeX: number;
  currentY: number;
  endConfirm: BN | null;
  points: BN[];
  since: BN;
}

type TCalcCurvesFn = (params: PalletReferendaTrackInfo) => CurveGraph;
export const calcCurves: TCalcCurvesFn = (params) => {
	const { decisionPeriod, minApproval, minSupport } = params;
	const approval = new Array<BN>(CURVE_LENGTH);
	const support = new Array<BN>(CURVE_LENGTH);
	const x = new Array<BN>(CURVE_LENGTH);
	const step = decisionPeriod.divn(CURVE_LENGTH);
	const last = CURVE_LENGTH - 1;
	let current = new BN(0);

	for (let i = 0; i < last; i++) {
		approval[i] = curveThreshold(minApproval, current, decisionPeriod);
		support[i] = curveThreshold(minSupport, current, decisionPeriod);
		x[i] = current;

		current = current.add(step);
	}

	// since we may be lossy with the step, we explicitly calc the final point at 100%
	approval[last] = curveThreshold(minApproval, decisionPeriod, decisionPeriod);
	support[last] = curveThreshold(minSupport, decisionPeriod, decisionPeriod);
	x[last] = decisionPeriod;

	return { approval, support, x };
};

type TCurveThresholdFn = (curve: any, input: BN, div: BN) => BN;
export const curveThreshold: TCurveThresholdFn = (curve, input, div) => {
	// if divisor is zero, we return the max
	if (div.isZero()) {
		return BN_BILLION;
	}

	const x = input.mul(BN_BILLION).div(div);

	if (curve.linearDecreasing) {
		const { ceil, floor, length } = curve.linearDecreasing;

		// *ceil - (x.min(*length).saturating_div(*length, Down) * (*ceil - *floor))
		// NOTE: We first multiply, then divide (since we work with fractions)
		return ceil.sub(
			bnMin(x, length)
				.mul(ceil.sub(floor))
				.div(length)
		);
	} else if (curve.steppedDecreasing) {
		const { begin, end, period, step } = curve.steppedDecreasing;

		// (*begin - (step.int_mul(x.int_div(*period))).min(*begin)).max(*end)
		return bnMax(
			end,
			begin.sub(
				bnMin(
					begin,
					step
						.mul(x)
						.div(period)
				)
			)
		);
	} else if (curve.reciprocal) {
		const { factor, xOffset, yOffset } = curve.reciprocal;
		const div = x.add(xOffset);

		if (div.isZero()) {
			return BN_BILLION;
		}

		// factor
		//   .checked_rounding_div(FixedI64::from(x) + *x_offset, Low)
		//   .map(|yp| (yp + *y_offset).into_clamped_perthing())
		//   .unwrap_or_else(Perbill::one)
		return bnMin(
			BN_BILLION,
			factor
				.mul(BN_BILLION)
				.div(div)
				.add(yOffset)
		);
	}

	throw new Error(`Unknown curve found ${curve.type}`);
};

type TGetChartResultFn = (totalEligible: BN, isConvictionVote: boolean, info: PalletReferendaReferendumInfoConvictionVotingTally | PalletReferendaReferendumInfoRankedCollectiveTally, track: PalletReferendaTrackInfo, trackGraph: CurveGraph) =>  ChartResultExt[] | null;
export const getChartResult: TGetChartResultFn =  (totalEligible, isConvictionVote, info, track, trackGraph) => {
	if (totalEligible && isConvictionVote && info.isOngoing) {
		const ongoing = info.asOngoing;

		if (ongoing.deciding.isSome) {
			const { approval, support, x } = trackGraph;
			const { deciding, tally } = ongoing;
			const { confirming, since } = deciding.unwrap();
			const endConfirm = confirming.unwrapOr(null);
			const currentSupport = isConvictionVote
				? (tally as PalletConvictionVotingTally).support
				: (tally as PalletRankedCollectiveTally).bareAyes;
			const labels: string[] = [];
			const values: number[][][] = [[[], [], []], [[], [], []]];
			const supc = totalEligible.isZero()
				? 0
				: currentSupport.mul(BN_THOUSAND).div(totalEligible).toNumber() / 10;
			const appc = tally.ayes.isZero()
				? 0
				: tally.ayes.mul(BN_THOUSAND).div(tally.ayes.add(tally.nays)).toNumber() / 10;
			let appx = -1;
			let supx = -1;
			const points: BN[] = [];

			for (let i = 0; i < approval.length; i++) {
				labels.push(formatNumber(since.add(x[i])));
				points.push(x[i]);

				const appr = approval[i].div(BN_MILLION).toNumber() / 10;
				const appn = appc < appr;

				values[0][PT_CUR][i] = appr;
				values[0][appn ? PT_NEG : PT_POS][i] = appc;
				appx = (appn || appx !== -1) ? appx : i;

				const supr = support[i].div(BN_MILLION).toNumber() / 10;
				const supn = supc < supr;

				values[1][PT_CUR][i] = supr;
				values[1][supn ? PT_NEG : PT_POS][i] = supc;
				supx = (supn || supx !== -1) ? supx : i;
			}

			const step = x[1].sub(x[0]);
			const lastIndex = x.length - 1;
			const lastBlock = endConfirm?.add(track.minEnactmentPeriod);

			// if the confirmation end is later than shown on our graph, we extend it
			if (lastBlock?.gt(since.add(x[lastIndex]))) {
				let currentBlock = x[lastIndex].add(since).add(step);

				do {
					labels.push(formatNumber(currentBlock));
					points.push(currentBlock.sub(since));

					// adjust approvals (no curve adjustment)
					// values[0][0].push(values[0][0][lastIndex]);
					values[0][1].push(values[0][1][lastIndex]);
					values[0][2].push(values[0][2][lastIndex]);

					// // adjust support
					// values[1][0].push(values[1][0][lastIndex]);
					values[1][1].push(values[1][1][lastIndex]);
					values[1][2].push(values[1][2][lastIndex]);

					currentBlock = currentBlock.add(step);
				} while (currentBlock.lt(lastBlock));
			}

			return [
				{ changeX: appx, currentY: appc, endConfirm, labels, points, progress: { percent: appc, total: ongoing.tally.ayes.add(ongoing.tally.nays), value: ongoing.tally.ayes }, since, values: values[0] },
				{ changeX: supx, currentY: supc, endConfirm, labels, points, progress: { percent: supc, total: totalEligible, value: currentSupport }, since, values: values[1] }
			];
		}
	}

	return null;
};