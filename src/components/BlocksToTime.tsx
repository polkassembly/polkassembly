// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React from 'react';
import blockToTime from 'src/util/blockToTime';

import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	blocks: number | BN;
	className?: string;
}

const BlocksToTime = ({ blocks, className }: Props) => {
	const { network } = useNetworkSelector();
	const blocktime: number = chainProperties?.[network]?.blockTime;

	return (
		<div className={className}>
			<>
				{blockToTime(blocks, network, blocktime)['time']} ({blocks} blocks)
			</>
		</div>
	);
};

export default BlocksToTime;
