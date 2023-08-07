// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import util from "util";

/*
 * Pretty console log
 * @param data - data to be logged
 * @returns void
 * @example
 * pretty_console(data);
 * only use in server side code
 */
export default function console_pretty(data: any) {
    console.log(util.inspect(data, false, null, true));
}
