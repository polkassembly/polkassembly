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

	const styleMap: Record<string, string> = {
		Auction: 'bg-[#FEF7DD] dark:bg-[#302921] text-[#75610E] dark:text-[#BFA889]',
		AuctionAdmin: 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]',
		BigSpender: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		BigTipper: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		Bounties: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		ChildBounties: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		Community: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		Council: 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]',
		Democracy: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		FellowshipAdmin: 'bg-[#FEF7DD] dark:bg-[#302921] text-[#75610E] dark:text-[#BFA889]',
		General: 'bg-[#FDF5F0] dark:bg-[#380E0E] text-[#EF884A] dark:text-[#DB8383]',
		GeneralAdmin: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		Governance: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		LeaseAdmin: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		MediumSpender: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		Members: 'bg-[#FEF7DD] dark:bg-[#302921] text-[#75610E] dark:text-[#BFA889]',
		ReferendumCanceller: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		ReferendumKiller: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		Root: 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]',
		SmallSpender: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		SmallTipper: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		Staking: 'bg-[#EEF8FF] dark:bg-[#1C2945] text-[#093874] dark:text-[#96AAD6]',
		StakingAdmin: 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]',
		Technical: 'bg-[#FEF7DD] dark:bg-[#302921] text-[#75610E] dark:text-[#BFA889]',
		Treasurer: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		Treasury: 'bg-[#FFF4EB] dark:bg-[#302234] text-[#AC6A30] dark:text-[#CCAED4]',
		Upgrade: 'bg-[#FDF5F0] dark:bg-[#380E0E] text-[#EF884A] dark:text-[#DB8383]',
		Whitelist: 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]',
		WhitelistedCaller: 'bg-[#FEF7DD] dark:bg-[#302921] text-[#75610E] dark:text-[#BFA889]',
		WishForChange: 'bg-[#FFEDF2] dark:bg-[#0B353C] text-[#CD1F59] dark:text-[#93C9D1]'
	};

	return styleMap[normalizedTrackName] || 'bg-[#ECECEC] dark:bg-[#333333] text-[#666666] dark:text-[#CCCCCC]';
};
