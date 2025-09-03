// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountFlags } from '@polkadot/api-derive/types';
import { IIdentityInfo } from '~src/types';
import React from 'react';
import styled from 'styled-components';

interface Props {
	className?: string;
	identity?: IIdentityInfo | null;
	flags?: DeriveAccountFlags;
	web3Name?: string;
	theme?: string;
}

const IdentityBadge = ({ className, identity, flags }: Props) => {
	const judgements = identity?.judgements.filter(([, judgement]: any[]): boolean => !judgement?.FeePaid);
	const isGood = judgements?.some(([, judgement]: any[]): boolean => ['KnownGood', 'Reasonable'].includes(judgement));
	const isBad = judgements?.some(([, judgement]: any[]): boolean => ['Erroneous', 'LowQuality'].includes(judgement));
	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const CouncilEmoji = () => (
		<span
			aria-label='council member'
			className='-mt-1'
			role='img'
		>
			👑
		</span>
	);
	const infoElem = (
		<span className='flex items-center'>
			{isGood ? <CheckCircleFilled style={{ color }} /> : <MinusCircleFilled style={{ color }} />}
			<span className='w-1'></span>
			{flags?.isCouncil && <CouncilEmoji />}
		</span>
	);

	return (
		<div
			className={className}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
		>
			<div>{infoElem}</div>
		</div>
	);
};

export default styled(IdentityBadge)`
	i.green.circle.icon {
		color: green_primary !important;
	}

	i.grey.circle.icon {
		color: grey_primary !important;
	}
	.ant-tooltip-content .ant-tooltip-inner {
		width: 363px !important;
	}
`;
