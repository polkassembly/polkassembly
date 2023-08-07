// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from "next";

import withErrorHandling from "~src/api-middlewares/withErrorHandling";
import { MessageType, ProfileDetails, User } from "~src/auth/types";
import { firestore_db } from "~src/services/firebaseInit";
import { IApiResponse } from "~src/types";
import apiErrorWithStatusCode from "~src/util/apiErrorWithStatusCode";
import messages from "~src/util/messages";

import getSubstrateAddress from "~src/util/getSubstrateAddress";
import dayjs from "dayjs";
interface IGetProfileWithAddress {
    address?: string | string[];
}

export interface IGetProfileWithAddressResponse {
    created_at?: Date;
    custom_username: boolean;
    profile: ProfileDetails;
    username: string;
    web3Signup: boolean;
}

export async function getProfileWithAddress(
    params: IGetProfileWithAddress
): Promise<IApiResponse<IGetProfileWithAddressResponse>> {
    try {
        const { address } = params;
        if (!address) {
            throw apiErrorWithStatusCode("Invalid address.", 400);
        }
        const substrateAddress = getSubstrateAddress(String(address));
        if (!substrateAddress) {
            throw apiErrorWithStatusCode("Invalid substrate address", 500);
        }
        const addressDoc = await firestore_db
            .collection("addresses")
            .doc(substrateAddress)
            .get();
        if (!addressDoc.exists) {
            throw apiErrorWithStatusCode(
                `No user found with the address '${address}'.`,
                404
            );
        }

        const userDoc = await firestore_db
            .collection("users")
            .doc(String(addressDoc.data()?.user_id))
            .get();
        if (!userDoc.exists) {
            throw apiErrorWithStatusCode(
                `No user found with the address '${address}'.`,
                404
            );
        }
        const userData = userDoc.data() as User;
        const profile = userData.profile as ProfileDetails;
        const data: IGetProfileWithAddressResponse = {
            created_at: dayjs(
                (userData.created_at as any)?.toDate?.() || userData.created_at
            ).toDate(),
            custom_username: userData.custom_username || false,
            profile,
            username: userData.username || "",
            web3Signup: userData.web3_signup
        };
        return {
            data: JSON.parse(JSON.stringify(data)),
            error: null,
            status: 200
        };
    } catch (error) {
        return {
            data: null,
            error: error.message || messages.API_FETCH_ERROR,
            status: Number(error.name) || 500
        };
    }
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IGetProfileWithAddressResponse | MessageType>
) {
    const { address } = req.query;

    const { data, error, status } = await getProfileWithAddress({
        address
    });

    if (error || !data) {
        res.status(200).json({ message: error || messages.API_FETCH_ERROR });
    } else {
        res.status(status).json(data);
    }
}

export default withErrorHandling(handler);
