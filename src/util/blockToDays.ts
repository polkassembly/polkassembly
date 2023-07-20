// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';

export default function blockToDays(
    blocks: BN | number,
    network: string,
    blocktime?: number,
): number {
    if (!blocktime) {
        blocktime = chainProperties?.[network]?.blockTime / 1000;
    } else {
        blocktime = blocktime / 1000;
    }

    // bn.js toNumber() was crashing
    if (typeof blocks !== 'number') {
        blocks = Number(blocks);
    }

    let time = (blocks * blocktime) / (3600 * 24);
    time =
        time >= 1
            ? Math.floor(time)
            : Math.round((time + Number.EPSILON) * 100) / 100;

    return time;
}
