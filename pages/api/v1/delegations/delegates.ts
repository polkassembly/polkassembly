// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { isValidNetwork } from "~src/api-utils";
import { isOpenGovSupported } from "~src/global/openGovNetworks";
import { RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS } from "~src/queries";
import fetchSubsquid from "~src/util/fetchSubsquid";
import getEncodedAddress from "~src/util/getEncodedAddress";
import Web3 from "web3";
import novaDelegatesKusama from "./nova-delegates-kusama.json";
import novaDelegatesPolkadot from "./nova-delegates-polkadot.json";
import { IDelegate } from "~src/types";
import { getProfileWithAddress } from "../auth/data/profileWithAddress";

export const getDelegatesData = async (network: string, address?: string) => {
    if (!network || !isOpenGovSupported(network)) return [];

    const encodedAddr = getEncodedAddress(String(address), network);

    const novaDelegates =
        network === "kusama" ? novaDelegatesKusama : novaDelegatesPolkadot;

    if (address && !(encodedAddr || Web3.utils.isAddress(String(address))))
        return [];

    const subsquidFetches: { [index: string]: any } = {};

    const currentDate = new Date();

    if (encodedAddr) {
        subsquidFetches[encodedAddr] = fetchSubsquid({
            network,
            query: RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS,
            variables: {
                address: String(encodedAddr),
                createdAt_gte: new Date(
                    currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
                ).toISOString() // 30 days ago
            }
        });
    } else {
        novaDelegates.map((novaDelegate) => {
            subsquidFetches[novaDelegate.address] = fetchSubsquid({
                network,
                query: RECEIVED_DELEGATIONS_AND_VOTES_COUNT_FOR_ADDRESS,
                variables: {
                    address: String(novaDelegate.address),
                    createdAt_gte: new Date(
                        currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString() // 30 days ago
                }
            });
        });
    }

    const subsquidResults = await Promise.allSettled(
        Object.values(subsquidFetches)
    );

    const result: IDelegate[] = [];

    for (const [index, delegateData] of subsquidResults.entries()) {
        if (!delegateData || delegateData.status !== "fulfilled") continue;
        const delegationCount = Number(
            delegateData.value.data?.votingDelegationsConnection?.totalCount ||
                0
        );
        const votesCount = Number(
            delegateData.value.data?.convictionVotesConnection?.totalCount || 0
        );

        const address = Object.keys(subsquidFetches)[index];
        if (!address) continue;

        const isNovaWalletDelegate = Boolean(
            novaDelegates.find(
                (novaDelegate) => novaDelegate.address === address
            )
        );
        let bio = "";

        if (!isNovaWalletDelegate) {
            const { data, error } = await getProfileWithAddress({ address });

            if (data && !error) {
                bio = data.profile?.bio || "";
            }
        } else {
            bio = novaDelegates[index].longDescription;
        }

        const newDelegate: IDelegate = {
            active_delegation_count: delegationCount,
            address,
            bio,
            isNovaWalletDelegate,
            name: novaDelegates[index].name,
            voted_proposals_count: votesCount
        };

        result.push(newDelegate);
    }

    return result;
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IDelegate[] | { error: string }>
) {
    const network = String(req.headers["x-network"]);
    if (!network || !isValidNetwork(network))
        return res
            .status(400)
            .json({ error: "Invalid network in request header" });

    const { address } = req.query;
    if (
        address &&
        !(
            getEncodedAddress(String(address), network) ||
            Web3.utils.isAddress(String(address))
        )
    )
        return res.status(400).json({ error: "Invalid address" });

    const result = await getDelegatesData(
        network,
        address ? String(address) : undefined
    );
    return res.status(200).json(result as IDelegate[]);
}

export default withErrorHandling(handler);
