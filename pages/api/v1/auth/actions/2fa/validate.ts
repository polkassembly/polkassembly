// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import authServiceInstance, { get2FAKey } from "~src/auth/auth";
import { MessageType, TokenType, User } from "~src/auth/types";
import messages from "~src/auth/utils/messages";
import { firestore_db } from "~src/services/firebaseInit";
import { TOTP } from "otpauth";
import { redisDel, redisGet } from "~src/auth/redis";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TokenType | MessageType>
) {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const {
        auth_code = null,
        tfa_token = null,
        user_id = null,
        login_address,
        login_wallet
    } = req.body;
    if (isNaN(auth_code) || !tfa_token || isNaN(user_id))
        return res
            .status(400)
            .json({ message: "Invalid parameters in request body." });

    const userDoc = await firestore_db
        .collection("users")
        .doc(String(user_id))
        .get();
    if (!userDoc.exists)
        return res.status(400).json({ message: messages.USER_NOT_FOUND });

    const user = userDoc.data() as User;
    if (!user.two_factor_auth?.enabled || !user.two_factor_auth?.base32_secret)
        return res
            .status(400)
            .json({ message: messages.TWO_FACTOR_AUTH_NOT_INIT });

    const stored_tfa_token = await redisGet(get2FAKey(Number(user_id)));
    if (!stored_tfa_token)
        return res
            .status(400)
            .json({ message: messages.TWO_FACTOR_AUTH_TOKEN_EXPIRED });
    if (stored_tfa_token !== tfa_token)
        return res
            .status(400)
            .json({ message: messages.TWO_FACTOR_AUTH_INVALID_TOKEN });

    const totp = new TOTP({
        algorithm: "SHA1",
        digits: 6,
        issuer: "Polkassembly",
        label: `${user.id}`,
        period: 30,
        secret: user.two_factor_auth?.base32_secret
    });

    const isValidToken =
        totp.validate({
            token: String(auth_code).replaceAll(/\s/g, ""),
            window: 1
        }) !== null;
    if (!isValidToken)
        return res
            .status(400)
            .json({ message: messages.TWO_FACTOR_AUTH_INVALID_AUTH_CODE });

    const updatedJWT = await authServiceInstance.getSignedToken({
        ...user,
        login_address: login_address,
        login_wallet: login_wallet
    });
    await redisDel(get2FAKey(Number(user_id)));

    return res.status(200).json({ token: updatedJWT });
}

export default withErrorHandling(handler);
