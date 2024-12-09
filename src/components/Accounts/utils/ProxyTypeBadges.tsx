// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import React from 'react';

interface ProxyTypeBadgesProps {
	text: string;
}

const getStyles = (text: string) => {
	switch (text) {
		case 'Staking':
			return {
				displayText: 'STAKING',
				textColor: '#A519CC',
				bgColor: '#A519CC14',
				borderColor: '#A519CC'
			};
		case 'IdentityJudgement':
			return {
				displayText: 'IDENTITY JUDGEMENT',
				textColor: '#E6761B',
				bgColor: '#E6761B14',
				borderColor: '#E6761B'
			};
		case 'NonTransfer':
			return {
				displayText: 'NON TRANSFER',
				textColor: '#317A06',
				bgColor: '#317A0614',
				borderColor: '#317A06'
			};
		case 'Governance':
			return {
				displayText: 'GOVERNANCE',
				textColor: '#F20D79',
				bgColor: '#F20D7914',
				borderColor: '#F20D79'
			};
		case 'Auction':
			return {
				displayText: 'AUCTION',
				textColor: '#D3A201',
				bgColor: '#D3A20114',
				borderColor: '#D3A201'
			};
		case 'PURE PROXY':
			return {
				displayText: 'PURE PROXY',
				textColor: '#2060EB',
				bgColor: '#2060EB14',
				borderColor: '#2060EB'
			};
		default:
			return {
				displayText: 'ANY',
				textColor: '#B8216F',
				bgColor: '#B8216F14',
				borderColor: '#B8216F'
			};
	}
};

const ProxyTypeBadges: React.FC<ProxyTypeBadgesProps> = ({ text }) => {
	const { displayText, textColor, bgColor, borderColor } = getStyles(text);

	return (
		<div
			className={'h-min rounded-[5px] border border-solid px-3 py-[2px] text-xs font-medium'}
			style={{
				color: textColor,
				backgroundColor: bgColor,
				borderColor: borderColor
			}}
		>
			{displayText}
		</div>
	);
};

export default ProxyTypeBadges;
