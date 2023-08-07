// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IncomingHttpHeaders } from "http";
import type { NextApiRequest } from "next";

import { defaultNetwork } from "~src/global/defaultNetwork";
import { network } from "~src/global/networkConstants";
import { networkTrackInfo } from "~src/global/post_trackInfo";
import {
    customOpenGovStatuses,
    govTypes,
    offChainProposalTypes,
    ProposalType,
    proposalTypes,
    trackPostStatuses
} from "~src/global/proposalType";
import { sortValues } from "~src/global/sortOptions";
import firebaseAdmin from "~src/services/firebaseInit";

export function getNetworkName(req: NextApiRequest) {
    return req.headers["x-network"];
}

export async function getNetworkDocRef(
    req: NextApiRequest,
    firestore: firebaseAdmin.firestore.Firestore
) {
    const networkName = getNetworkName(req);
    if (typeof networkName !== "string") {
        throw new Error(`The network of the name "${networkName}" is invalid.`);
    }

    if (!Object.values(network).includes(networkName)) {
        throw new Error(
            `The network of the name "${networkName}" does not exist.`
        );
    }
    const networkNameDocRef = firestore.collection("networks").doc(networkName);
    return networkNameDocRef;
}

export function isSortByValid(sortBy: string) {
    return [
        sortValues.NEWEST,
        sortValues.OLDEST,
        sortValues.COMMENTED
    ].includes(sortBy);
}

export function isProposalTypeValid(proposalType: string) {
    return proposalTypes.includes(proposalType);
}

export function isOffChainProposalTypeValid(proposalType: string) {
    return offChainProposalTypes.includes(proposalType);
}

export function isFirestoreProposalTypeValid(proposalType: string) {
    return (
        proposalTypes.includes(proposalType) ||
        offChainProposalTypes.includes(proposalType)
    );
}

export function isTrackPostStatusValid(trackStatus: string) {
    return trackPostStatuses.includes(trackStatus);
}

export function isCustomOpenGovStatusValid(trackStatus: string) {
    return customOpenGovStatuses.includes(trackStatus);
}

export function isTrackNoValid(trackNo: number, network: string) {
    return (
        !isNaN(trackNo) &&
        networkTrackInfo?.[network] &&
        Object.entries(networkTrackInfo?.[network]).find(([, value]) => {
            return value && value.trackId === trackNo;
        })
    );
}

export async function isPostIdOrHashValid(
    postIdOrHash: string | string[] | 0,
    proposalType: string | string[]
) {
    if (proposalType !== ProposalType.TIPS) {
        const numPostId = Number(postIdOrHash);
        if (isNaN(numPostId)) {
            throw new Error(`The postId "${postIdOrHash}" is invalid.`);
        }
        return numPostId;
    } else if (!postIdOrHash || typeof postIdOrHash !== "string") {
        throw new Error(`The Tip hash "${postIdOrHash} is invalid."`);
    }
    return null;
}

export async function isProposerAddressValid(
    proposerAddress: string | string[] | undefined
) {
    if (typeof proposerAddress !== "string" || !proposerAddress) {
        throw new Error(`The proposerAddress "${proposerAddress}" is invalid.`);
    }
    return String(proposerAddress);
}

export function getCount(
    snapshotArr: FirebaseFirestore.AggregateQuerySnapshot<{
        count: FirebaseFirestore.AggregateField<number>;
    }>[],
    i: number
) {
    let count = 0;
    if (snapshotArr.length > i) {
        count = snapshotArr[i].data()?.count || 0;
    }
    return count;
}

export function isValidNetwork(networkName: string) {
    return Object.values(network).includes(networkName);
}

export function isGovTypeValid(govType: string) {
    return govTypes.includes(govType);
}

export function getNetworkFromReqHeaders(headers: IncomingHttpHeaders) {
    let network = "";
    if (headers.host && !headers.host.includes("localhost:")) {
        network = headers.host.split(".")[0];
    }

    if (!Object.values(network).includes(network)) {
        if (network == "test") {
            network = "kusama";
        } else if (network == "test-polkadot") {
            network = "polkadot";
        } else if (network == "moonriver-test") {
            network = "moonriver";
        } else {
            network =
                process.env.NEXT_PUBLIC_APP_ENV === "development"
                    ? defaultNetwork
                    : network;
        }
    }

    if (!network) {
        network = "kusama";
    }

    return network;
}
