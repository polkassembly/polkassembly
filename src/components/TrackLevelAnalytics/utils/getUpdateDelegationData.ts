// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { IDelegationAnalytics } from '../types';
import { IDelegatorsAndDelegatees } from '~src/types';
const ZERO_BN = new BN(0);

export interface ISubsquidRes {
	lockPeriod: number;
	balance: string;
	from: string;
	to: string;
	track: number;
}
const getUpdateDelegationData = (data: ISubsquidRes[]): IDelegationAnalytics => {
	let totalCapital = ZERO_BN;
	let totalVotesBalance = ZERO_BN;
	const totalDelegatorsObj: IDelegatorsAndDelegatees = {};
	const totalDelegateesObj: IDelegatorsAndDelegatees = {};

	data?.map((delegation: ISubsquidRes) => {
		const bnBalance = new BN(delegation?.balance);
		const bnConviction = new BN(delegation?.lockPeriod || 1);
		const vote = delegation?.lockPeriod ? bnBalance.mul(bnConviction) : bnBalance.div(new BN('10'));

		totalVotesBalance = totalVotesBalance.add(vote);

		totalCapital = totalCapital.add(bnBalance);

		if (totalDelegateesObj[delegation?.to] === undefined) {
			totalDelegateesObj[delegation?.to] = {
				count: 1,
				data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
			};
		} else {
			totalDelegateesObj[delegation?.to] = {
				count: totalDelegateesObj[delegation?.to]?.count + 1,
				data: [
					...(totalDelegateesObj[delegation?.to]?.data || []),
					{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }
				]
			};
		}
		if (totalDelegatorsObj[delegation?.from] === undefined) {
			totalDelegatorsObj[delegation?.from] = {
				count: 1,
				data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
			};
		} else {
			totalDelegatorsObj[delegation?.from] = {
				count: totalDelegatorsObj[delegation?.from]?.count + 1,
				data: [
					...(totalDelegatorsObj[delegation?.from]?.data || []),
					{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation.to, votingPower: vote.toString() }
				]
			};
		}
	});

	return {
		delegateesData: totalDelegateesObj,
		delegatorsData: totalDelegatorsObj,
		totalCapital: totalCapital.toString(),
		totalDelegates: Object.keys(totalDelegateesObj)?.length,
		totalDelegators: Object.keys(totalDelegatorsObj)?.length,
		totalVotesBalance: totalVotesBalance.toString()
	};
};

export default getUpdateDelegationData;
