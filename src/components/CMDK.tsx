// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SettingOutlined } from '@ant-design/icons';
import 'react-cmdk/dist/cmdk.css';
import CommandPalette, { filterItems, getItemIndex, useHandleOpenCommandPalette } from 'react-cmdk';
import React, { useState } from 'react';
import DemocracyProposalsSVG from '~assets/sidebar/democracy_proposals.svg';
import TreasuryProposalsSVG from '~assets/sidebar/treasury_proposals.svg';
import ReferendaSVG from '~assets/sidebar/referenda.svg';
import BountiesSVG from '~assets/sidebar/bounties.svg';
import TipsSVG from '~assets/sidebar/tips.svg';
import MotionsSVG from '~assets/sidebar/motions.svg';
import MembersSVG from '~assets/sidebar/members.svg';
import CalendarSVG from '~assets/sidebar/calendar.svg';
import OverviewSVG from '~assets/sidebar/overview.svg';
import DiscussionsSVG from '~assets/sidebar/discussions.svg';
import ParachainsSVG from '~assets/sidebar/parachains.svg';

const CMDK = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [page, setPage] = useState<'root'>('root');
	const [open, setOpen] = useState<boolean>(false);
	const [search, setSearch] = useState('');
	useHandleOpenCommandPalette(setOpen);

	const filteredItems = filterItems(
		[
			{
				heading: 'Basic',
				id: 'basic',
				items: [
					{
						children: 'Home',
						href: '/',
						icon: OverviewSVG,
						id: 'home'
					},
					{
						children: 'Settings',
						href: '/settings',
						icon: SettingOutlined,
						id: 'settings'
					},
					{
						children: 'Calendar',
						href: '/calendar',
						icon: CalendarSVG,
						id: 'calendar'
					},
					{
						children: 'Discussions',
						href: '/discussions',
						icon: DiscussionsSVG,
						id: 'discussions'
					},
					{
						children: 'Parachains',
						href: '/parachains',
						icon: ParachainsSVG,
						id: 'parachains'
					}
				]
			},
			{
				heading: 'Gov 1',
				id: 'gov-1',
				items: [
					{
						children: 'Democracy Proposals',
						href: '/proposals',
						icon: DemocracyProposalsSVG,
						id: 'democracy_proposals'
					},
					{
						children: 'Referenda',
						href: '/referenda',
						icon: ReferendaSVG,
						id: 'referenda'
					},
					{
						children: 'Treasury Proposals',
						href: '/treasury-proposals',
						icon: TreasuryProposalsSVG,
						id: 'treasury_proposals'
					},
					{
						children: 'Bounties',
						href: '/bounties',
						icon: BountiesSVG,
						id: 'bounties'
					},
					{
						children: 'Child Bounties',
						href: '/child_bounties',
						icon: BountiesSVG,
						id: 'child_bounties'
					},
					{
						children: 'Tips',
						href: '/tips',
						icon: TipsSVG,
						id: 'tips'
					},
					{
						children: 'Motion',
						href: '/motions',
						icon: MotionsSVG,
						id: 'motions'
					},
					{
						children: 'Tech Comm. Proposals',
						href: '/tech-comm-proposals',
						icon: DemocracyProposalsSVG,
						id: 'tech_comm_proposals'
					},
					{
						children: 'Council Members',
						href: '/members',
						icon: MembersSVG,
						id: 'council_members'
					}
				]
			}
		],
		search
	);
	return (
		<CommandPalette
			onChangeSearch={setSearch}
			onChangeOpen={setOpen}
			search={search}
			isOpen={open}
			page={page}
		>
			<CommandPalette.Page id="root">
				{filteredItems.length ? (
					filteredItems.map((list) => (
						<CommandPalette.List key={list.id} heading={list.heading}>
							{list.items.map(({ id, ...rest }) => (
								<CommandPalette.ListItem
									key={id}
									index={getItemIndex(filteredItems, id)}
									{...rest}
								/>
							))}
						</CommandPalette.List>
					))
				) : (
					<CommandPalette.FreeSearchAction />
				)}
			</CommandPalette.Page>
		</CommandPalette>
	);
};

export default CMDK;