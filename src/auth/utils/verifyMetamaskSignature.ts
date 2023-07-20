// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: replace with @metamask/eth-sig-util
const sigUtil = require('eth-sig-util');

export const verifyMetamaskSignature = (
    message: string,
    address: string,
    signature: string,
): boolean => {
    const msgParams = {
        data: message,
        sig: signature,
    };
    const recovered = sigUtil.recoverPersonalSignature(msgParams);

    return `${recovered}`.toLowerCase() === `${address}`.toLowerCase();
};
