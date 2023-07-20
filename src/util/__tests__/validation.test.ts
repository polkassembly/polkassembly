// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { email, username } from '../validation';

test('Email validation pattern', () => {
    expect(email.pattern.test('polk@dot.com')).toBe(true);
    expect(email.pattern.test('polk@@dot.com')).toBe(false);
    expect(email.pattern.test('polk@dot..com')).toBe(false);
});

test('Username validation pattern', () => {
    expect(username.pattern.test('Tim')).toBe(true);
    expect(username.pattern.test('Tim Cook')).toBe(false);
    expect(username.pattern.test('!?;')).toBe(false);
});
