// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const usernamesPattern = /(?<=(?:^|\s+|<((?!a\b)\w+)>|&nbsp;))@(\w+)(?=(?:\s+|&nbsp;|<\/((?!a\b)\w+)>))/g;
export default usernamesPattern;