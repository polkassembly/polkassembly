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
import { IOptionPollVote, IPollVote } from "~src/types";

import { getPollCollectionName } from "../../polls";

const handler: NextApiHandler<MessageType> = async (req, res) => {
    if (req.method !== "POST")
        return res
            .status(405)
            .json({ message: "Invalid request method, POST required." });

    const network = String(req.headers["x-network"]);
    if (!network || !isValidNetwork(network))
        return res
            .status(400)
            .json({ message: "Invalid network in request header" });

    const { pollId, postId, userId, vote, option, pollType, proposalType } =
        req.body;
    if (
        !pollId ||
        isNaN(postId) ||
        !userId ||
        (pollType === POLL_TYPE.NORMAL && !vote) ||
        (pollType === POLL_TYPE.OPTION && !option)
    )
        return res
            .status(400)
            .json({ message: "Missing parameters in request body" });

    const strProposalType = String(proposalType);
    if (!isOffChainProposalTypeValid(strProposalType))
        return res.status(400).json({
            message: `The off chain proposal type of the name "${proposalType}" does not exist.`
        });

    const strPollType = String(pollType);
    if (!pollType || !isPollTypeValid(strPollType))
        return res
            .status(400)
            .json({ message: `The pollType "${pollType}" is invalid` });

    const token = getTokenFromReq(req);
    if (!token) return res.status(400).json({ message: "Invalid token" });

    const user = await authServiceInstance.GetUser(token);
    if (!user || user.id !== Number(userId))
        return res.status(403).json({ message: messages.UNAUTHORISED });

    const pollColName = getPollCollectionName(strPollType);
    if (!["option_polls", "polls"].includes(pollColName)) {
        return res
            .status(400)
            .json({ message: `The pollType "${pollType}" is invalid` });
    }

    const pollRef = postsByTypeRef(network, strProposalType as ProposalType)
        .doc(String(postId))
        .collection(pollColName)
        .doc(String(pollId));

    const pollDoc = await pollRef.get();

    if (!pollDoc.exists)
        return res.status(404).json({ message: "Poll not found" });

    const date = new Date();
    let votes_field_name = "";
    let newVote: IPollVote | IOptionPollVote | undefined;
    if (strPollType === POLL_TYPE.OPTION) {
        newVote = {
            created_at: date,
            option: option,
            updated_at: date,
            user_id: Number(userId)
        } as IOptionPollVote;
        votes_field_name = "option_poll_votes";
    } else if (strPollType === POLL_TYPE.NORMAL) {
        newVote = {
            created_at: date,
            updated_at: date,
            user_id: Number(userId),
            vote: vote
        } as IPollVote;
        votes_field_name = "poll_votes";
    } else {
        return res
            .status(400)
            .json({ message: `The pollType "${pollType}" is invalid` });
    }

    if (!newVote) {
        return res
            .status(500)
            .json({ message: "Poll vote object is not created" });
    }

    const updated: any = {};
    const data = pollDoc.data() as any;

    updated[votes_field_name] = data?.[votes_field_name] || [];
    updated[votes_field_name].push(newVote);

    pollRef
        .update(updated)
        .then(() => {
            return res.status(200).json({ message: "Poll vote added." });
        })
        .catch((error) => {
            console.error("Error adding poll vote: ", error);
            return res.status(500).json({ message: "Error adding poll vote" });
        });
};

export default withErrorHandling(handler);
