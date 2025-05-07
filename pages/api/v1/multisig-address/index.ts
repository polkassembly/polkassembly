// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import fetchWithTimeout from '~src/api-utils/timeoutFetch';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { subscanUrl } from './constants';
import { IMultisig, IProxy } from '~src/services/multisig/type';

interface IResponseData {
	multisig: Array<IMultisig>;
	proxy: Array<IProxy>;
	proxiedBy: Array<IProxy>;
}

interface IMultisigAndProxyResponse {
	data: IResponseData | null;
	error: string | null;
	status: number;
}

const getAccountInfo = async ({ address, url }: { address: string; url: string }) => {
	const data = await (
		await fetchWithTimeout(url, {
			body: JSON.stringify({ key: address }),
			headers: subscanApiHeaders,
			method: 'POST',
			timeout: 10000
		})
	).json();

	if (data.message === 'Record Not Found') {
		return {};
	}

	const info = ['name', 'email', 'github', 'twitter', 'matrix', 'discord'].map((key) => data.data?.account?.[key]);

	return {
		...info
	};
};

const getProxyAddresses = async (addresses: Array<IProxy>, url: string) => {
	const response: Array<IProxy> = [];
	for (const proxy of addresses) {
		const info = await getAccountInfo({ address: proxy.address, url });
		const proxyData: IProxy = {
			address: proxy.address,
			proxyType: proxy.proxyType,
			...info
		};
		response.push(proxyData);
	}
	return response;
};

const getAccountsFromAddress = async ({ address, network }: { address: string; network: string }): Promise<IMultisigAndProxyResponse> => {
	try {
		const responseData: IResponseData = {
			multisig: [],
			proxiedBy: [],
			proxy: []
		};

		const url: string = subscanUrl(network);

		const data = await (
			await fetchWithTimeout(url, {
				body: JSON.stringify({ key: address }),
				headers: subscanApiHeaders,
				method: 'POST',
				timeout: 10000
			})
		).json();

		if (data.message === 'Record Not Found') {
			return {
				data: null,
				error: 'Record Not Found',
				status: 404
			};
		}

		const proxyAddresses = data.data?.account?.proxy?.proxy_account?.map((proxy: any) => ({ address: proxy.account_display.address, proxyType: proxy.proxy_type })) || [];
		const real_account = data.data?.account?.proxy?.real_account?.map((proxy: any) => ({ address: proxy.account_display.address, proxyType: proxy.proxy_type })) || [];
		const multisigAddress = data.data?.account?.multisig?.multi_account?.map((multisig: any) => multisig.address) || [];

		// fetch for multisig addresses
		for (const multisig of multisigAddress) {
			const data = await (
				await fetchWithTimeout(url, {
					body: JSON.stringify({ key: multisig }),
					headers: subscanApiHeaders,
					method: 'POST',
					timeout: 10000
				})
			).json();
			const multisigMembers = data.data?.account?.multisig?.multi_account_member?.map((member: any) => member.address);
			const pureProxy = data.data?.account?.proxy?.real_account?.map((proxy: any) => ({ address: proxy.account_display.address, proxyType: proxy.proxy_type }));
			const threshold = data.data?.account?.multisig?.multi_account_threshold;
			const info = ['name', 'email', 'github', 'twitter', 'matrix', 'discord'].map((key) => data.data?.account?.[key]);

			const multisigData: IMultisig = {
				address: multisig,
				pureProxy: pureProxy,
				signatories: multisigMembers,
				threshold: threshold,
				...info
			};
			responseData.multisig.push(multisigData);
		}

		// fetch for proxy addresses
		responseData.proxy = await getProxyAddresses(real_account, url);

		// fetch for proxied by addresses
		responseData.proxiedBy = await getProxyAddresses(proxyAddresses, url);

		return {
			data: responseData,
			error: null,
			status: 200
		};
	} catch (error) {
		console.error('Error in getAccountsFromAddress:', error);
		return {
			data: null,
			error: (error as Error).message,
			status: 500
		};
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<IMultisigAndProxyResponse | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const { address } = req.body;

	if (!address) return res.status(400).json({ message: 'Missing address parameter in url.' });

	const substrateAddress = getSubstrateAddress(String(address));
	if (!substrateAddress) return res.status(400).json({ message: messages.INVALID_ADDRESS });

	const data = await getAccountsFromAddress({ address: substrateAddress, network: network });

	return res.status(200).json({ data: data.data, error: data.error, status: data.status });
}

export default withErrorHandling(handler);
