// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { IAddressProxyForEntry, MessageType } from '~src/auth/types';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import authServiceInstance from '~src/auth/auth';
import { Wallet } from '~src/types';

export interface IV1UserAddress {
	address: string;
	default: boolean;
	network: string;
	public_key: string;
	sign_message: string;
	user_id: number;
	verified: boolean;
	is_erc20?: boolean;
	wallet?: Wallet;
	isMultisig?: boolean;
	proxy_for?: IAddressProxyForEntry[];
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	const headerNetwork = String(req.headers['x-network']);
	const toolsPassphrase = String(req.headers['x-tools-passphrase']);

	if (toolsPassphrase !== process.env.TOOLS_PASSPHRASE) return res.status(401).json({ message: 'Unauthorized' });
	if (!headerNetwork || !isValidNetwork(headerNetwork)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { address = '', default: isDefault = true, network = '', user_id = 0, is_erc20 = false, wallet = '', isMultisig = false, proxy_for = [] } = req.body as IV1UserAddress;

	if (!user_id || !address || !wallet) return res.status(400).json({ message: 'Invalid params' });

	await authServiceInstance.createAddress(network, address, isDefault, user_id, is_erc20, wallet || Wallet.OTHER, isMultisig, proxy_for);

	return res.status(200).json({ message: 'Address created successfully' });
};
export default withErrorHandling(handler);
