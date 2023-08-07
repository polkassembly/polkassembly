// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from "next";
import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import {
    isOffChainProposalTypeValid,
    isProposalTypeValid
} from "~src/api-utils";
import { postsByTypeRef } from "~src/api-utils/firestore_refs";
import authServiceInstance from "~src/auth/auth";
import { MessageType } from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";
import messages from "~src/auth/utils/messages";
import { ProposalType } from "~src/global/proposalType";
import { PostComment } from "~src/types";
import {
    FIREBASE_FUNCTIONS_URL,
    firebaseFunctionsHeader
} from "~src/components/Settings/Notifications/utils";

export interface IAddPostCommentResponse {
    id: string;
}

const handler: NextApiHandler<IAddPostCommentResponse | MessageType> = async (
    req,
    res
) => {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const network = String(req.headers["x-network"]);
    if (!network)
        return res
            .status(400)
            .json({ message: "Missing network name in request headers" });

    const { userId, content, postId, postType, sentiment } = req.body;
    if (!userId || !content || isNaN(postId) || !postType)
        return res
            .status(400)
            .json({ message: "Missing parameters in request body" });

    const strProposalType = String(postType);
    if (
        !isOffChainProposalTypeValid(strProposalType) &&
        !isProposalTypeValid(strProposalType)
    )
        return res.status(400).json({
            message: `The post type of the name "${postType}" does not exist.`
        });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    const user = await authServiceInstance.GetUser(token);
    if (!user || user.id !== Number(userId))
        return res.status(403).json({ message: messages.UNAUTHORISED });

    const postRef = postsByTypeRef(
        network,
        strProposalType as ProposalType
    ).doc(String(postId));

    const last_comment_at = new Date();
    const newCommentRef = postRef.collection("comments").doc();

    const newComment: PostComment = {
        content: content,
        created_at: new Date(),
        history: [],
        id: newCommentRef.id,
        sentiment: sentiment || 0,
        updated_at: last_comment_at,
        user_id: user.id,
        user_profile_img: user?.profile?.image || "",
        username: user.username
    };

    await newCommentRef
        .set(newComment)
        .then(() => {
            postRef.update({
                last_comment_at
            });

            const triggerName = "newCommentAdded";

            const args = {
                commentId: String(newComment.id),
                network,
                postId: String(postId),
                postType: strProposalType
            };

            fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
                body: JSON.stringify({
                    args,
                    trigger: triggerName
                }),
                headers: firebaseFunctionsHeader(network),
                method: "POST"
            });

            return res.status(200).json({
                id: newComment.id
            });
        })
        .catch((error) => {
            console.error("Error saving comment: ", error);
            return res.status(500).json({ message: "Error saving comment" });
        });
};

export default withErrorHandling(handler);
