// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React from 'react';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import blockToTime from 'src/util/blockToTime';
import styled from 'styled-components';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import Tooltip from '~src/basic-components/Tooltip';

interface Props {
	className?: string;
	endBlock: number;
}

const SpanContent = styled.span`
	font-size: xs;
	color: black_text;
`;

const BlockCountdown = ({ className, endBlock }: Props) => {
	const { network } = useNetworkSelector();

	const ZERO = new BN(0);
	const currentBlock = useCurrentBlock() || ZERO;
	const blocksRemaining = endBlock - currentBlock.toNumber();
	const blocktime: number = chainProperties?.[network]?.blockTime;

	return blocksRemaining !== endBlock && blocksRemaining > 0 ? (
		<Tooltip title={<SpanContent>{`#${endBlock}`}</SpanContent>}>
			<span className={`${className} blockCountdown`}>{blockToTime(blocksRemaining, network, blocktime)['time']}</span>
		</Tooltip>
	) : (
		<>#{endBlock}</>
	);
};

export default BlockCountdown;
