// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { chainProperties } from '~src/global/networkConstants';

import useCurrentBlock from './useCurrentBlock';
import { useNetworkSelector } from '~src/redux/selectors';

const TWO_WEEKS = 2 * 7 * 24 * 60 * 60 * 1000;

export default function usePollEndBlock() {
	const { network } = useNetworkSelector();

	const blocktime: number = chainProperties?.[network]?.blockTime;
	const currenBlockNumber = useCurrentBlock()?.toNumber();
	const blockEnd = (currenBlockNumber || 0) + Math.floor(TWO_WEEKS / blocktime);

	return useMemo(() => {
		return blockEnd;
	}, [blockEnd]);
}
