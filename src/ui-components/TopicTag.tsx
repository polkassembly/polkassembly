// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
	className?: string;
	topic: string;
}

const TopicTag = ({ className, topic }: Props) => {
	return <Tag className={`${className} ${topic} px-3 py-1 text-xs`}>{topic}</Tag>;
};

export default styled(TopicTag)`
	font-weight: 500;
	background-color: var(--grey_primary);
	color: white;
	border: none;
	border-radius: 5px;
	text-transform: capitalize;

	@media only screen and (max-width: 576px) {
		padding: 0.2rem 0.4rem;
	}

	&.Democracy,
	&.Community,
	&.Staking {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#1C2945' : '#EEF8FF')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#96AAD6' : '#093874')} !important;
	}
	&.Council,
	&.Root,
	&.Whitelist {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0B353C' : '#FFEDF2')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#93C9D1' : '#CD1F59')};
	}
	&.Treasury,
	&.Governance {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#302234' : '#FFF4EB')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#CCAED4' : '#AC6A30')} !important;
	}
	&.Technical,
	&.Tech,
	&.Auction {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#302921' : '#FEF7DD')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#BFA889' : '#75610E')} !important;
	}
	&.General,
	&.Upgrade {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#380E0E' : '#FDF5F0')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#DB8383' : '#EF884A')} !important;
	}
`;

export const getSpanStyle = (trackName: string, activeProposal: number | undefined): string => {
	if (activeProposal === undefined || activeProposal <= 0) return '';

	const normalizedTrackName = trackName.replace(/\s+/g, '');

	switch (normalizedTrackName) {
		case 'LeaseAdmin':
		case 'GeneralAdmin':
		case 'ReferendumCanceller':
		case 'ReferendumKiller':
		case 'Democracy':
		case 'Community':
		case 'Staking':
			return 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]';

		case 'Root':
		case 'WishForChange':
		case 'StakingAdmin':
		case 'AuctionAdmin':
		case 'Council':
		case 'Whitelist':
			return 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]';

		case 'BigSpender':
		case 'MediumSpender':
		case 'SmallSpender':
		case 'BigTipper':
		case 'SmallTipper':
		case 'Treasurer':
		case 'Bounties':
		case 'ChildBounties':
		case 'Treasury':
		case 'Governance':
			return 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]';

		case 'Members':
		case 'WhitelistedCaller':
		case 'FellowshipAdmin':
		case 'Technical':
		case 'Tech':
		case 'Auction':
			return 'bg-[#FEF7DD] dark:bg-[#302921] text-[#75610E] dark:text-[#BFA889]';

		case 'General':
		case 'Upgrade':
			return 'bg-[#FDF5F0] dark:bg-[#380E0E] text-[#EF884A] dark:text-[#DB8383]';

		default:
			return 'bg-[#ECECEC] dark:bg-[#333333] text-[#666666] dark:text-[#CCCCCC]';
	}
};
