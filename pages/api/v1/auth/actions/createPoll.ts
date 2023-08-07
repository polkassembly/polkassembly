// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { isOffChainProposalTypeValid, isValidNetwork } from "~src/api-utils";
import { postsByTypeRef } from "~src/api-utils/firestore_refs";
import authServiceInstance from "~src/auth/auth";
import { MessageType } from "~src/auth/types";
import getTokenFromReq from "~src/auth/utils/getTokenFromReq";
import messages from "~src/auth/utils/messages";
import POLL_TYPE, { isPollTypeValid } from "~src/global/pollTypes";
import { ProposalType } from "~src/global/proposalType";
import { IOptionPoll, IPoll } from "~src/types";

import { getPollCollectionName } from "../../polls";

export interface ICreatePollResponse {
    id: string;
}

const handler: NextApiHandler<ICreatePollResponse | MessageType> = async (
    req,
    res
) => {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const network = String(req.headers["x-network"]);
    if (!network || !isValidNetwork(network))
        return res
            .status(400)
            .json({ message: "Invalid network in request header" });

    const {
        endAt,
        options: optionsString,
        question,
        blockEnd,
        postId,
        proposalType,
        pollType
    } = req.body;

    const strPollType = String(pollType);
    if (!pollType || !isPollTypeValid(strPollType))
        return res
            .status(400)
            .json({ message: `The pollType "${pollType}" is invalid` });

    if (
        isNaN(postId) ||
        !proposalType ||
        (strPollType === "normal" && !blockEnd && blockEnd !== 0) ||
        (strPollType === "option" &&
            ((!endAt && endAt !== 0) || !optionsString || !question))
    )
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

    const user = await authServiceInstance.GetUser(token);
    if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

    const postDocRef = postsByTypeRef(
        network,
        strProposalType as ProposalType
    ).doc(String(postId));
    const postDoc = await postDocRef.get();
    if (!postDoc.exists)
        return res.status(400).json({ message: "Post does not exist" });

    if (postDoc.data()?.user_id !== user.id)
        return res.status(403).json({ message: messages.UNAUTHORISED });

    const date = new Date();
    let poll: IOptionPoll | IPoll | undefined;
    if (strPollType === POLL_TYPE.OPTION) {
        const options = JSON.parse(optionsString);
        if (!options || !Array.isArray(options))
            return res
                .status(400)
                .json({ message: "Options should be an array" });
        poll = {
            created_at: date,
            end_at: Number(endAt),
            id: "",
            option_poll_votes: [],
            options,
            question,
            updated_at: date
        } as IOptionPoll;
    } else if (strPollType === POLL_TYPE.NORMAL) {
        poll = {
            block_end: Number(blockEnd),
            created_at: date,
            id: "",
            poll_votes: [],
            updated_at: date
        } as IPoll;
    } else {
        return res
            .status(400)
            .json({ message: `The pollType "${pollType}" is invalid` });
    }

    const pollRef = postDocRef
        .collection(getPollCollectionName(strPollType))
        .doc();
    if (!poll) {
        return res.status(500).json({ message: "Poll object is not created" });
    } else {
        poll.id = pollRef.id;
    }

    await pollRef
        .set(poll)
        .then(() => {
            return res.status(200).json({
                id: pollRef.id
            });
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error saving poll: ", error);
            return res.status(500).json({ message: "Error saving poll" });
        });
};

export default withErrorHandling(handler);
