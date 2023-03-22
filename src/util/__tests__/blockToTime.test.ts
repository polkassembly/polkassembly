// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import blockToTime from '../blockToTime';

jest.mock('../getNetwork', () => jest.fn(() => {return 'polkadot';}));
const getNetwork = require('../getNetwork');

const SEC = 1000;

describe('Testing blockToTime', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('with Kusama default blocktime (blocks equaling 1m to return 1m)', () => {
		getNetwork.mockImplementation(() => 'kusama');
		expect(blockToTime(10)).toEqual('0d 0h 1m');
	});

	it('with Kusama default blocktime (blocks equaling 7d 23h 59m to return 7d 23h 59m)', () => {
		getNetwork.mockImplementation(() => 'kusama');
		expect(blockToTime(115199)).toEqual('7d 23h 59m');
	});

	it('with Polkadot default blocktime (blocks equaling 1m to return 1m)', () => {
		getNetwork.mockImplementation(() => 'polkadot');
		expect(blockToTime(10)).toEqual('0d 0h 1m');
	});

	it('with Polkadot default blocktime (blocks equaling 7d 23h 59m to return 7d 23h 59m)', () => {
		getNetwork.mockImplementation(() => 'polkadot');
		expect(blockToTime(115199)).toEqual('7d 23h 59m');
	});
});

it('Testing blockToTime with blocks equaling less than 1m to get rounded up to 1m', () => {
	expect(blockToTime(1, SEC*6)).toEqual('0d 0h 1m');
});

it('Testing blockToTime with a blocktime set to 2 sec and blocks equaling 2m to return 2m', () => {
	expect(blockToTime(60, SEC*2)).toEqual('0d 0h 2m');
});
