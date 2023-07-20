// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse, NetworkSocials } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import messages from '~src/util/messages';

interface IGetNetworkSocialsParams {
    network: string;
}

export async function getNetworkSocials(
    params: IGetNetworkSocialsParams,
): Promise<IApiResponse<NetworkSocials>> {
    try {
        const { network } = params;
        const networkDoc = await firestore_db
            .collection('networks')
            .doc(network)
            .get();
        if (!networkDoc.exists) {
            throw apiErrorWithStatusCode('Invalid network name', 400);
        }

        const networkData = networkDoc.data();
        if (!networkData?.blockchain_socials) {
            throw apiErrorWithStatusCode(
                'No socials found for this network',
                404,
            );
        }

        const networkSocials = networkData.blockchain_socials as NetworkSocials;

        return {
            data: JSON.parse(JSON.stringify(networkSocials)),
            error: null,
            status: 200,
        };
    } catch (error) {
        return {
            data: null,
            error: error.message || messages.API_FETCH_ERROR,
            status: Number(error.name) || 500,
        };
    }
}

const handler: NextApiHandler<NetworkSocials | { error: string }> = async (
    req,
    res,
) => {
    const network = req.headers['x-network'] as string;
    if (!network)
        return res
            .status(400)
            .json({ error: 'Missing network name in request headers' });

    const { data, error, status } = await getNetworkSocials({
        network,
    });

    if (error || !data) {
        res.status(status).json({ error: error || messages.API_FETCH_ERROR });
    } else {
        res.status(status).json(data);
    }
};

export default withErrorHandling(handler);
