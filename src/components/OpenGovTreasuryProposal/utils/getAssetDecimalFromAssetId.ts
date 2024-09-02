// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from '~src/global/networkConstants';

interface Args {
	network: string;
	assetId: string | null;
}
const getAssetDecimalFromAssetId = ({ assetId, network }: Args) => {
	return chainProperties?.[network]?.supportedAssets?.find(({ genralIndex }) => genralIndex == assetId)?.tokenDecimal || null;
};

export default getAssetDecimalFromAssetId;
