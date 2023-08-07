// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { MessageType } from "~src/auth/types";
import firebaseAdmin from "~src/services/firebaseInit";
import { NetworkEvent } from "~src/types";

const handler: NextApiHandler<NetworkEvent | MessageType> = async (
    req,
    res
) => {
    const network = String(req.headers["x-network"]);
    if (!network)
        return res
            .status(400)
            .json({ message: "Missing network name in request headers" });

    const { post_id } = req.body;
    if (!post_id)
        return res.status(400).json({ message: "post_id is required" });

    const firestore = firebaseAdmin.firestore();

    const eventQuerySnapshot = await firestore
        .collection("networks")
        .doc(network)
        .collection("events")
        .where("post_id", "==", Number(post_id))
        .get();
    if (eventQuerySnapshot.empty)
        return res
            .status(404)
            .json({ message: "No events found for this post" });

    const event = eventQuerySnapshot.docs[0].data() as NetworkEvent;

    return res.status(200).json(event);
};
export default withErrorHandling(handler);
