// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as jwt from 'jsonwebtoken';

import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

import { JWTPayloadType } from '../types';
import messages from './messages';

/**
 * Get User id from JWT
 */
export default function getUserIdFromJWT(
    token: string,
    publicKey: string | undefined,
): number {
    if (!publicKey) {
        const key =
            process.env.NODE_ENV === 'test'
                ? process.env.JWT_PUBLIC_KEY_TEST
                : process.env.JWT_PUBLIC_KEY?.replace(/\\n/gm, '\n');
        throw apiErrorWithStatusCode(`${key} not set. Aborting.`, 403);
    }

    // verify a token asymmetric - synchronous
    let decoded: JWTPayloadType;
    try {
        decoded = jwt.verify(token, publicKey) as JWTPayloadType;
    } catch (e) {
        throw apiErrorWithStatusCode(messages.INVALID_JWT, 403);
    }

    if (!decoded.sub) {
        throw apiErrorWithStatusCode(messages.INVALID_USER_ID_IN_JWT, 403);
    }

    return Number(decoded.sub);
}
