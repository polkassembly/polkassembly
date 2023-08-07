// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import authServiceInstance from "~src/auth/auth";
import { MessageType } from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });
    const network = String(req.headers["x-network"]);
    if (!network)
        return res
            .status(400)
            .json({ message: "Missing network in request header" });

    const body = JSON.parse(req.body);
    const { address, title, content, signature, proposalType, proposalId } =
        body;
    if (
        !body ||
        !address ||
        !title ||
        !content ||
        !signature ||
        !proposalType ||
        !proposalId
    )
        return res
            .status(400)
            .json({ message: "Missing parameters in request body" });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    await authServiceInstance.EditPostConfirm(
        network,
        address,
        title,
        content,
        signature,
        proposalType,
        proposalId
    );

    return res.status(200).json({ message: "Post edited successfully" });
}

export default withErrorHandling(handler);
