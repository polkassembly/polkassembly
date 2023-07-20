// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';

export function isSubscanSupport(network: string) {
    return ![
        'xx',
        'pendulum',
        'amplitude',
        'myriad',
        'frequency',
        'cere',
    ].includes(network);
}

export function isExplorerSupport(network: string) {
    return ['xx', 'myriad'].includes(network);
}

export function isPolkaholicSupport(network: string) {
    return ['pendulum', 'amplitude'].includes(network);
}

export function isCereSupport(network: string) {
    return ['cere'].includes(network);
}

export const getBlockLink = (network: string) => {
    let url = chainProperties[network]?.externalLinks;
    if (url.includes('subscan')) {
        url = `${url.replace('.api', '')}/block/`;
    } else if (isPolkaholicSupport(network)) {
        url += `/block/${network}/`;
    } else if (isExplorerSupport(network)) {
        url += '/blocks/';
    } else if (isCereSupport(network)) {
        url += '/block?blockNumber=';
    } else {
        url += '/block/';
    }
    return url;
};
