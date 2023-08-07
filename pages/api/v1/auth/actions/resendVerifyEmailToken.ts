// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { isValidNetwork } from "~src/api-utils";
import authServiceInstance from "~src/auth/auth";
import { MessageType } from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";
import messages from "~src/auth/utils/messages";

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const network = String(req.headers["x-network"]);
    if (!network || !isValidNetwork(network))
        res.status(400).json({ message: "Invalid network in request header" });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    await authServiceInstance.resendVerifyEmailToken(token, network);

    return res.status(200).json({
        message: messages.RESEND_VERIFY_EMAIL_TOKEN_REQUEST_SUCCESSFUL
    });
}

export default withErrorHandling(handler);
