// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import getEncodedAddress from '../getEncodedAddress';

jest.mock('../getNetwork', () =>
	jest.fn(() => {
		return 'polkadot';
	})
);
const getNetwork = require('../getNetwork');

describe('Verify address is encoded', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	const KUSAMA_ENCODED = 'FqfW96FuXRH7pRy9njeNSxu4CNoBM1hKnVAmNRrFrU2izwj';
	const POLKADOT_ENCODED = 'A41F9YrXEYYxm2WFFrczYhUQiEW8APB8qw39gnYnzsYSZ9M';

	it('for Kusama', () => {
		getNetwork.mockImplementation(() => 'kusama');
		expect(getEncodedAddress(KUSAMA_ENCODED)).toBe(KUSAMA_ENCODED);
		expect(getEncodedAddress(POLKADOT_ENCODED)).toBe(KUSAMA_ENCODED);
	});

	it('for Polkadot', () => {
		getNetwork.mockImplementation(() => 'polkadot');
		expect(getEncodedAddress(KUSAMA_ENCODED)).toBe(POLKADOT_ENCODED);
		expect(getEncodedAddress(POLKADOT_ENCODED)).toBe(POLKADOT_ENCODED);
	});
});
