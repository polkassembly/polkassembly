// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { isOffChainProposalTypeValid, isValidNetwork } from "~src/api-utils";
import authServiceInstance from "~src/auth/auth";
import { MessageType } from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";
import { ProposalType } from "~src/global/proposalType";

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const network = String(req.headers["x-network"]);
    if (!network || !isValidNetwork(network))
        return res
            .status(400)
            .json({ message: "Invalid network in request header" });

    const body = JSON.parse(req.body);
    const { address, title, content, signature, proposalType } = body;
    if (!body || !address || !title || !content || !signature || !proposalType)
        return res
            .status(400)
            .json({ message: "Missing parameters in request body" });

    const strProposalType = String(proposalType);
    if (!isOffChainProposalTypeValid(strProposalType))
        return res.status(400).json({
            message: `The off chain proposal type "${proposalType}" is invalid.`
        });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    await authServiceInstance.CreatePostConfirm(
        network,
        address,
        title,
        content,
        signature,
        strProposalType as ProposalType
    );

    return res.status(200).json({ message: "Post created successfully" });
}

export default withErrorHandling(handler);
