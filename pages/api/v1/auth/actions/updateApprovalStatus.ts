// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import authServiceInstance from "~src/auth/auth";
import { MessageType } from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";
import messages from "~src/auth/utils/messages";
import firebaseAdmin from "~src/services/firebaseInit";

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
    const network = String(req.headers["x-network"]);
    if (!network)
        return res
            .status(400)
            .json({ message: "Missing network name in request headers" });

    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const { approval_status, eventId } = req.body;
    if (!approval_status || !eventId)
        return res
            .status(400)
            .json({ message: "Missing parameters in request body" });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    const user = await authServiceInstance.GetUser(token);
    if (!user || user.id !== Number(process.env.EVENT_BOT_USER_ID))
        return res.status(403).json({ message: messages.UNAUTHORISED });
    const firestore = firebaseAdmin.firestore();

    const eventRef = await firestore
        .collection("networks")
        .doc(network)
        .collection("events")
        .doc(String(eventId));
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists)
        return res.status(404).json({ message: "Event not found" });

    eventRef
        .update({ status: approval_status.toLowerCase() })
        .then(() => {
            return res.status(200).json({ message: "Event status updated." });
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating event status: ", error);
            return res
                .status(500)
                .json({ message: "Error updating event status" });
        });
}

export default withErrorHandling(handler);
