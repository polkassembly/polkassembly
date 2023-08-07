// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { isValidNetwork } from "~src/api-utils";
import authServiceInstance from "~src/auth/auth";
import {
    MessageType,
    NotificationSettings,
    UpdatedDataResponseType
} from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";
import messages from "~src/auth/utils/messages";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<
        UpdatedDataResponseType<NotificationSettings> | MessageType
    >
) {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const network = String(req.headers["x-network"]);
    if (!network || !isValidNetwork(network))
        res.status(400).json({ message: "Invalid network in request header" });

    const { new_proposal, own_proposal, post_created, post_participated } =
        req.body;

    if (
        new_proposal === undefined ||
        own_proposal === undefined ||
        post_created === undefined ||
        post_participated === undefined
    ) {
        return res.status(400).json({ message: "Missing parameters in body" });
    }

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    try {
        const notification_preferences =
            await authServiceInstance.ChangeNotificationPreference(
                token,
                {
                    new_proposal,
                    own_proposal,
                    post_created,
                    post_participated
                },
                network
            );
        return res.status(200).json({
            message: messages.NOTIFICATION_PREFERENCE_CHANGE_SUCCESSFUL,
            updated: notification_preferences
        });
    } catch (error) {
        return res.status(Number(error.name)).json({ message: error?.message });
    }
}

export default withErrorHandling(handler);
