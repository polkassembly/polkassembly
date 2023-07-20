// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import formatBnBalance from '../formatBnBalance';

jest.mock('../getNetwork', () =>
	jest.fn(() => {
		return 'polkadot';
	})
);
const getNetwork = require('../getNetwork');

describe('Testing formatBnBalance', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	// Kusama formatting
	it('for Kusama with numberAfterComma option set to 2', () => {
		getNetwork.mockImplementation(() => 'kusama');
		expect(formatBnBalance('1000000000000', { numberAfterComma: 2 })).toEqual(
			'1.00'
		);
	});

	it('for Kusama with withThousandDelimitor option set to false', () => {
		getNetwork.mockImplementation(() => 'kusama');
		expect(
			formatBnBalance('1000000000000000', {
				numberAfterComma: 0,
				withThousandDelimitor: false
			})
		).toEqual('1000');
	});

	it('for Kusama with withUnit option set to true', () => {
		getNetwork.mockImplementation(() => 'kusama');
		expect(
			formatBnBalance('53000000000000', {
				numberAfterComma: 1,
				withUnit: true
			})
		).toEqual('53.0 KSM');
	});

	// Polkadot formatting
	it('for Polkadot with numberAfterComma option set to 2', () => {
		getNetwork.mockImplementation(() => 'polkadot');
		expect(
			formatBnBalance('1000000000000000000', { numberAfterComma: 2 })
		).toEqual('1.00');
	});

	it('for Polkadot with withThousandDelimitor option set to false', () => {
		getNetwork.mockImplementation(() => 'polkadot');
		expect(
			formatBnBalance('1000000000000000000000', {
				numberAfterComma: 0,
				withThousandDelimitor: false
			})
		).toEqual('1000');
	});

	it('for Polkadot with withUnit option set to true', () => {
		getNetwork.mockImplementation(() => 'polkadot');
		expect(
			formatBnBalance('53000000000000000000', {
				numberAfterComma: 1,
				withUnit: true
			})
		).toEqual('53.0 DOT');
	});
});
