// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SettingOutlined, MenuOutlined } from '@ant-design/icons';
import 'react-cmdk/dist/cmdk.css';
import CommandPalette, { filterItems, getItemIndex, useHandleOpenCommandPalette } from 'react-cmdk';
import React, { useMemo, useState } from 'react';
import DemocracyProposalsSVG from '~assets/sidebar/democracy_proposals.svg';
import TreasuryProposalsSVG from '~assets/sidebar/treasury_proposals.svg';
import ReferendaSVG from '~assets/sidebar/referenda.svg';
import Gov2FellowshipGroupSVG from '~assets/sidebar/gov2_fellowship_group.svg';
import BountiesSVG from '~assets/sidebar/bounties.svg';
import TipsSVG from '~assets/sidebar/tips.svg';
import MotionsSVG from '~assets/sidebar/motions.svg';
import MembersSVG from '~assets/sidebar/members.svg';
import CalendarSVG from '~assets/sidebar/calendar.svg';
import OverviewSVG from '~assets/sidebar/overview.svg';
import DiscussionsSVG from '~assets/sidebar/discussions.svg';
import ParachainsSVG from '~assets/sidebar/parachains.svg';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkContext, useUserDetailsContext } from '~src/context';

const CMDK = () => {
	const [page, setPage] = useState('home');
	const [open, setOpen] = useState<boolean>(false);
	const [search, setSearch] = useState('');
	useHandleOpenCommandPalette(setOpen);
	const { network } = useNetworkContext();
	const { isLoggedOut } = useUserDetailsContext();

	function onPageEscape(page: any) {
		if (page.id === 'home') {
			setOpen(false);
			return;
		}
		setPage('home');
	}
	const homeMenus = getHomeMenu(network);
	if (isLoggedOut()) {
		if (homeMenus && Array.isArray(homeMenus) && homeMenus.length > 0) {
			const index = homeMenus?.[0]?.items?.findIndex((item) => item?.value === 'settings');
			if (index >= 0) {
				homeMenus[0].items.splice(index, 1);
			}
		}
	}
	const foldedMenu = homeMenus.filter((menu: any) => menu.name && menu.items.length);

	const pages = useMemo(() => {
		const subPageItems = foldedMenu.map((m: any) => {
			const filteredItems = filterItems(
				[
					{
						heading: m.name,
						id: m.name,
						items: m.items.map((i: any, idx: any) => {
							return {
								children: i.name,
								href: i.pathname,
								icon: () => i.icon,
								id: m.name + '-' + i.name + `-${idx}`
							};
						})
					}
				],
				search
			);
			return {
				filteredItems,
				id: m.name,
				searchPrefix: [m.name.toLowerCase()]
			};
		});

		const homepageItem = {
			filteredItems: filterItems(
				[
					{
						id: 'home',
						items: [
							...commonMenus.items.map((i) => {
								return {
									children: i.name,
									href: i.pathname,
									icon: () => i.icon,
									id: i.name
								};
							}),
							...foldedMenu.map((m: any) => {
								return {
									children: typeof m?.name === 'string'? m.name.split('_').map((str: string) => {
										if (str === 'OPENGOV') {
											return 'OpenGov';
										} else {
											return str?.charAt(0) + str?.slice(1)?.toLowerCase();
										}
									}).join(' '): '',
									closeOnSelect: false,
									icon: () => <MenuOutlined className='text-[#C2CFE0]' />,
									id: m.name,
									onClick() {
										setSearch('');
										setPage(m.name);
									}
								};
							})
						]
					},
					...(search? subPageItems.map((i) => i.filteredItems).flat(): [])
				],
				search
			),
			id: 'home'
		};
		return [homepageItem, ...subPageItems];
	},[foldedMenu, search]);
	return (
		<CommandPalette
			page={page}
			onChangeSearch={setSearch}
			isOpen={open}
			onChangeOpen={setOpen}
			search={search}
		>
			{
				pages.map((page) => {
					return (
						<CommandPalette.Page
							key={page.id}
							id={page.id}
							onEscape={() => onPageEscape(page)}
							searchPrefix={(page as any)?.searchPrefix}
						>
							{page?.filteredItems?.length ? (
								page.filteredItems.map((list) => (
									<CommandPalette.List key={list.id} heading={list.heading}>
										{list.items.map(({ id, ...rest }) => (
											<CommandPalette.ListItem
												key={id}
												index={getItemIndex(page.filteredItems, id)}
												{...rest}
											/>
										))}
									</CommandPalette.List>
								))
							) : (
								<CommandPalette.FreeSearchAction />
							)}
						</CommandPalette.Page>
					);
				})
			}
		</CommandPalette>
	);
};

export default CMDK;

const commonMenus = {
	items: [
		{
			icon: <OverviewSVG />,
			name: 'Overview',
			pathname: '/',
			value: 'overview'
		},
		{
			icon: <SettingOutlined />,
			name: 'Settings',
			pathname: '/settings',
			value: 'settings'
		},
		{
			icon: <CalendarSVG />,
			name: 'Calendar',
			pathname: '/calendar',
			value: 'calendar'
		},
		{
			icon: <DiscussionsSVG />,
			name: 'Discussions',
			pathname: '/discussions',
			value: 'discussions'
		},
		{
			icon: <ParachainsSVG />,
			name: 'Parachains',
			pathname: '/parachains',
			value: 'parachains'
		}
	]
};

const democracy = {
	items: [
		{
			icon: <DemocracyProposalsSVG />,
			name: 'Democracy',
			pathname: '/proposals',
			value: 'democracyProposals'
		},
		{
			icon: <ReferendaSVG />,
			name: 'Referenda',
			pathname: '/referenda',
			value: 'referenda'
		}
	],
	name: 'DEMOCRACY'
};

const treasury = {
	items: [
		{
			icon: <TreasuryProposalsSVG />,
			name: 'Treasury',
			pathname: '/treasury-proposals',
			value: 'treasuryProposals'
		},
		{
			icon: <BountiesSVG />,
			name: 'Bounties',
			pathname: '/bounties',
			value: 'bounties'
		},
		{
			icon: <BountiesSVG />,
			name: 'Child Bounties',
			pathname: '/child_bounties',
			value: 'childBounties'
		},
		{
			icon: <TipsSVG />,
			name: 'Tips',
			pathname: '/tips',
			value: 'tips'
		}
	],
	name: 'TREASURY'
};

const council = {
	items: [
		{
			icon: <MotionsSVG />,
			name: 'Motions',
			pathname: '/motions',
			value: 'motions'
		},
		{
			icon: <MembersSVG />,
			name: 'Council Members',
			pathname: '/council',
			value: 'councilMembers'
		}
	],
	name: 'COUNCIL'
};

const techComm = {
	items: [
		{
			icon: <DemocracyProposalsSVG />,
			name: 'Proposals',
			pathname: '/tech-comm-proposals',
			value: 'techCommProposals'
		}
	],
	name: 'TECH.COMM.'
};

const getHomeMenu = (network: string) => {
	return [
		commonMenus,
		getReferenda(network),
		getFellowship(network),
		getWhitelist(network),
		democracy,
		treasury,
		council,
		techComm
	];
};

const getReferenda = (network: string) => {
	const items: any[] = [];
	if (networkTrackInfo && networkTrackInfo[network]) {
		Object.values(networkTrackInfo[network]).forEach((v) => {
			if (v && !v.fellowshipOrigin && !['whitelisted_caller', 'fellowship_admin'].includes(v.name)) {
				items.push({
					icon: (
						<span
							className='w-6 h-6 bg-grey_secondary text-xs leading-none font-medium text-white rounded-full flex items-center justify-center'
						>
							{v.trackId}
						</span>
					),
					name: v?.name?.split('_')?.map((s: string) => s?.charAt(0)?.toUpperCase() + s?.slice(1)).join(' '),
					pathname: v?.name?.split('_')?.join('-') || '',
					value: v.name
				});
			}
		});
	}
	return {
		items,
		name: 'OPENGOV_REFERENDA'
	};
};

const getFellowship = (network: string) => {
	const items: any[] = [];
	if (networkTrackInfo && networkTrackInfo[network]) {
		let isFellowshipFound = false;
		let isWhiteListedCallerFound = false;
		let isFellowshipAdmin = false;
		Object.values(networkTrackInfo[network]).forEach((v) => {
			if (v.fellowshipOrigin) {
				isFellowshipFound = true;
			}
			if (v.name === 'whitelisted_caller') {
				isWhiteListedCallerFound = true;
			}
			if (v.name === 'fellowship_admin') {
				isFellowshipAdmin = true;
			}
		});
		if (isFellowshipFound) {
			items.push({
				icon: <Gov2FellowshipGroupSVG />,
				name: 'Members',
				pathname: '/fellowship',
				value: 'fellowshipMembers'
			});
			items.push({
				icon: <ReferendaSVG />,
				name: 'Member Referenda',
				pathname: '/member-referenda',
				value: 'memberReferenda'
			});
			if (isWhiteListedCallerFound) {
				items.push({
					icon: <Gov2FellowshipGroupSVG />,
					name: 'Whitelisted Caller',
					pathname: '/whitelisted-caller',
					value: 'whitelistedCaller'
				});
			}
			if (isFellowshipAdmin) {
				items.push({
					icon: <Gov2FellowshipGroupSVG />,
					name: 'Fellowship Admin',
					pathname: '/fellowship-admin',
					value: 'fellowshipAdmin'
				});
			}
		}
	}
	return {
		items,
		name: 'FELLOWSHIP'
	};
};

const getWhitelist = (network: string) => {
	const items: any[] = [];
	if (networkTrackInfo && networkTrackInfo[network]) {
		let isFellowshipNotFound = true;
		let isWhiteListedCallerFound = false;
		Object.values(networkTrackInfo[network]).forEach((v) => {
			if (v.fellowshipOrigin) {
				isFellowshipNotFound = false;
			}
			if (v.name === 'whitelisted_caller') {
				isWhiteListedCallerFound = true;
			}
		});
		if (isFellowshipNotFound) {
			if (isWhiteListedCallerFound) {
				items.push({
					icon: <ReferendaSVG />,
					name: 'Whitelisted Caller',
					pathname: '/whitelisted-caller',
					value: 'whitelistedCaller'
				});
			}
			items.push({
				icon: <Gov2FellowshipGroupSVG />,
				name: 'Whitelist Members',
				pathname: '/members',
				value: 'whitelistMembers'
			});
		}
	}
	return {
		items,
		name: 'WHITELIST'
	};
};
