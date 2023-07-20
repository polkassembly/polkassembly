// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import {
	DownOutlined,
	LogoutOutlined,
	SettingOutlined,
	UserOutlined
} from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, Layout, Menu, MenuProps } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { NextComponentType, NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, ReactNode, useEffect, useState } from 'react';
import { isExpired } from 'react-jwt';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { getLocalStorageToken, logout } from 'src/services/auth.service';
import {
	AuctionAdminIcon,
	BountiesIcon,
	CalendarIcon,
	DemocracyProposalsIcon,
	DiscussionsIcon,
	FellowshipGroupIcon,
	GovernanceGroupIcon,
	MembersIcon,
	MotionsIcon,
	NewsIcon,
	OverviewIcon,
	ParachainsIcon,
	PreimagesIcon,
	ReferendaIcon,
	RootIcon,
	StakingAdminIcon,
	TipsIcon,
	TreasuryGroupIcon,
	TreasuryProposalsIcon,
	ChildBountiesIcon,
	TechComProposalIcon,
	DelegatedIcon
} from 'src/ui-components/CustomIcons';
import checkGov2Route from 'src/util/checkGov2Route';
import styled from 'styled-components';

import { isFellowshipSupported } from '~src/global/fellowshipNetworks';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';

import Footer from './Footer';
import GovernanceSwitchButton from './GovernanceSwitchButton';
import NavHeader from './NavHeader';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import OpenGovHeaderBanner from './OpenGovHeaderBanner';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getSiderMenuItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[]
): MenuItem {
	return {
		children,
		icon,
		key,
		label,
		type: key === 'tracksHeading' ? 'group' : ''
	} as MenuItem;
}

const getUserDropDown = (
	handleLogout: any,
	img?: string | null,
	username?: string
): MenuItem => {
	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: (
				<Link
					className="text-navBlue hover:text-pink_primary font-medium flex items-center gap-x-2"
					href={`/user/${username}`}
				>
					<UserOutlined />
					<span>View Profile</span>
				</Link>
			)
		},
		{
			key: 'settings',
			label: (
				<Link
					className="text-navBlue hover:text-pink_primary font-medium flex items-center gap-x-2"
					href="/settings?tab=account"
				>
					<SettingOutlined />
					<span>Settings</span>
				</Link>
			)
		},
		{
			key: 'logout',
			label: (
				<Link
					className="text-navBlue hover:text-pink_primary font-medium flex items-center gap-x-2"
					onClick={handleLogout}
					href="/"
				>
					<LogoutOutlined />
					<span>Logout</span>
				</Link>
			)
		}
	];

	const AuthDropdown = ({ children }: { children: ReactNode }) => (
		<Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']}>
			{children}
		</Dropdown>
	);

	return getSiderMenuItem(
		<AuthDropdown>
			<div className="flex items-center justify-between gap-x-2">
				<span className="truncate w-[85%] normal-case">
					{username || ''}
				</span>{' '}
				<DownOutlined className="text-navBlue hover:text-pink_primary text-base" />
			</div>
		</AuthDropdown>,
		'userMenu',
		<AuthDropdown>
			{img ? (
				<Avatar className="-ml-2.5 mr-2" size={40} src={img} />
			) : (
				<Avatar
					className="-ml-2.5 mr-2"
					size={40}
					icon={<UserOutlined />}
				/>
			)}
		</AuthDropdown>
	);
};

interface Props {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}

const AppLayout = ({ className, Component, pageProps }: Props) => {
	const { network } = useNetworkContext();
	const { setUserDetailsContextState, username, picture } =
		useUserDetailsContext();
	const [sidedrawer, setSidedrawer] = useState<boolean>(false);
	const router = useRouter();
	const [previousRoute, setPreviousRoute] = useState(router.asPath);

	useEffect(() => {
		const handleRouteChange = () => {
			if (
				router.asPath.split('/')[1] !== 'discussions' &&
				router.asPath.split('/')[1] !== 'post'
			) {
				setPreviousRoute(router.asPath);
			}
		};
		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	useEffect(() => {
		if (!global?.window) return;
		const authToken = getLocalStorageToken();
		if (authToken && isExpired(authToken)) {
			logout(setUserDetailsContextState);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.asPath]);

	useEffect(() => {
		if (
			!window ||
			!(window as any).ethereum ||
			!(window as any).ethereum.on
		)
			return;
		(window as any).ethereum.on('accountsChanged', () => {
			window.location.reload();
		});
	}, []);

	const gov1Items: { [x: string]: ItemType[] } = {
		overviewItems: [
			getSiderMenuItem(
				'Overview',
				'/',
				<OverviewIcon className="text-white" />
			),
			getSiderMenuItem(
				'Discussions',
				'/discussions',
				<DiscussionsIcon className="text-white mt-1.5" />
			),
			getSiderMenuItem(
				'Calendar',
				'/calendar',
				<CalendarIcon className="text-white" />
			),
			// getSiderMenuItem('News', '/news', <NewsIcon className='text-white' />),
			getSiderMenuItem(
				'Parachains',
				'/parachains',
				<ParachainsIcon className="text-white mt-3" />
			)
		],
		democracyItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						'Proposals',
						'/proposals',
						<DemocracyProposalsIcon className="text-white" />
					),
					getSiderMenuItem(
						'Referenda',
						'/referenda',
						<ReferendaIcon className="text-white" />
					)
			  ]
			: [],
		councilItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						'Motions',
						'/motions',
						<MotionsIcon className="text-white" />
					),
					getSiderMenuItem(
						'Members',
						'/council',
						<MembersIcon className="text-white" />
					)
			  ]
			: [],
		treasuryItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						'Proposals',
						'/treasury-proposals',
						<TreasuryProposalsIcon className="text-white" />
					),
					getSiderMenuItem(
						'Bounties',
						'/bounties',
						<BountiesIcon className="text-white" />
					),
					getSiderMenuItem(
						'Child Bounties',
						'/child_bounties',
						<ChildBountiesIcon className="ml-0.5" />
					),
					getSiderMenuItem(
						'Tips',
						'/tips',
						<TipsIcon className="text-white" />
					)
			  ]
			: [],
		techCommItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						'Proposals',
						'/tech-comm-proposals',
						<TechComProposalIcon className="text-white" />
					)
			  ]
			: [],
		allianceItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						'Announcements',
						'/alliance/announcements',
						<NewsIcon className="text-white" />
					),
					getSiderMenuItem(
						'Motions',
						'/alliance/motions',
						<MotionsIcon className="text-white" />
					),
					getSiderMenuItem(
						'Unscrupulous',
						'/alliance/unscrupulous',
						<ReferendaIcon className="text-white" />
					),
					getSiderMenuItem(
						'Members',
						'/alliance/members',
						<MembersIcon className="text-white" />
					)
			  ]
			: []
	};

	if (isGrantsSupported(network)) {
		gov1Items['overviewItems'].splice(
			2,
			0,
			getSiderMenuItem(
				'Grants',
				'/grants',
				<BountiesIcon className="text-white" />
			)
		);
	}

	if (
		typeof window !== 'undefined' &&
		window.screen.width < 1024 &&
		isOpenGovSupported(network)
	) {
		gov1Items.overviewItems = [
			getSiderMenuItem(
				<GovernanceSwitchButton
					previousRoute={previousRoute}
					className="flex lg:hidden"
				/>,
				'opengov',
				''
			),
			...gov1Items.overviewItems
		];
	}

	let items: MenuProps['items'] = [...gov1Items.overviewItems];

	if (chainProperties[network]?.subsquidUrl) {
		items = items.concat([
			getSiderMenuItem('Democracy', 'democracy_group', null, [
				...gov1Items.democracyItems
			]),

			getSiderMenuItem('Treasury', 'treasury_group', null, [
				...gov1Items.treasuryItems
			]),

			getSiderMenuItem('Council', 'council_group', null, [
				...gov1Items.councilItems
			]),

			getSiderMenuItem('Tech. Comm.', 'tech_comm_group', null, [
				...gov1Items.techCommItems
			])
		]);
	}

	let collapsedItems: MenuProps['items'] = [...gov1Items.overviewItems];

	if (chainProperties[network]?.subsquidUrl) {
		collapsedItems = collapsedItems.concat([
			...gov1Items.democracyItems,
			...gov1Items.treasuryItems,
			...gov1Items.councilItems,
			...gov1Items.techCommItems
		]);
	}

	if (network === AllNetworks.COLLECTIVES) {
		const fellowshipItems = [
			getSiderMenuItem(
				'Members',
				'/fellowship',
				<MembersIcon className="text-white" />
			),
			getSiderMenuItem(
				'Member Referenda',
				'/member-referenda',
				<FellowshipGroupIcon className="text-sidebarBlue" />
			)
		];
		items = [
			...gov1Items.overviewItems,
			getSiderMenuItem('Alliance', 'alliance_group', null, [
				...gov1Items.allianceItems
			]),
			getSiderMenuItem(
				'Fellowship',
				'fellowship_group',
				null,
				fellowshipItems
			)
		];
		collapsedItems = [
			...gov1Items.overviewItems,
			...gov1Items.allianceItems,
			...fellowshipItems
		];
	} else if (network === AllNetworks.WESTENDCOLLECTIVES) {
		items = [
			...gov1Items.overviewItems,
			getSiderMenuItem('Alliance', 'alliance_group', null, [
				...gov1Items.allianceItems
			])
		];
		collapsedItems = [
			...gov1Items.overviewItems,
			...gov1Items.allianceItems
		];
	}

	const gov2TrackItems: { [x: string]: ItemType[] } = {
		mainItems: [],
		governanceItems: [],
		treasuryItems: [],
		fellowshipItems: [getSiderMenuItem('Members', '/members')]
	};

	if (isFellowshipSupported(network)) {
		gov2TrackItems?.fellowshipItems?.splice(
			0,
			1,
			getSiderMenuItem('Members', '/fellowship'),
			getSiderMenuItem('Member Referenda', '/member-referenda')
		);
	}

	if (network && networkTrackInfo[network]) {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			if (
				!networkTrackInfo[network][trackName] ||
				!('group' in networkTrackInfo[network][trackName])
			)
				continue;

			const menuItem = getSiderMenuItem(
				trackName.split(/(?=[A-Z])/).join(' '),
				`/${trackName
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase()}`
			);

			switch (networkTrackInfo[network][trackName].group) {
				case 'Governance':
					gov2TrackItems.governanceItems.push(menuItem);
					break;
				case 'Treasury':
					gov2TrackItems.treasuryItems.push(
						getSiderMenuItem(
							trackName.split(/(?=[A-Z])/).join(' '),
							`/${trackName
								.split(/(?=[A-Z])/)
								.join('-')
								.toLowerCase()}`
						)
					);
					break;
				case 'Whitelist':
					gov2TrackItems.fellowshipItems.push(
						getSiderMenuItem(
							trackName.split(/(?=[A-Z])/).join(' '),
							`/${trackName
								.split(/(?=[A-Z])/)
								.join('-')
								.toLowerCase()}`
						)
					);
					break;
				default: {
					const icon =
						trackName === PostOrigin.ROOT ? (
							<RootIcon />
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<AuctionAdminIcon className="ml-0.5" />
						) : (
							<StakingAdminIcon />
						);
					gov2TrackItems.mainItems.push(
						getSiderMenuItem(
							trackName.split(/(?=[A-Z])/).join(' '),
							`/${trackName
								.split(/(?=[A-Z])/)
								.join('-')
								.toLowerCase()}`,
							icon
						)
					);
				}
			}
		}
	}

	let gov2OverviewItems = [
		getSiderMenuItem(
			'Overview',
			'/opengov',
			<OverviewIcon className="text-white mt-1" />
		),
		getSiderMenuItem(
			'Discussions',
			'/discussions',
			<DiscussionsIcon className="text-white mt-1.5" />
		),
		getSiderMenuItem(
			'Calendar',
			'/calendar',
			<CalendarIcon className="text-white" />
		),
		// getSiderMenuItem('News', '/news', <NewsIcon className='text-white' />),
		getSiderMenuItem(
			'Parachains',
			'/parachains',
			<ParachainsIcon className="text-white mt-2.5" />
		),
		getSiderMenuItem(
			'Preimages',
			'/preimages',
			<PreimagesIcon className="mt-1" />
		)
	];

	if (['kusama', 'polkadot'].includes(network)) {
		gov2OverviewItems.splice(
			1,
			0,
			getSiderMenuItem(
				'Delegation',
				'/delegation',
				<DelegatedIcon className="mt-1.5" />
			)
		);
	}
	if (isGrantsSupported(network)) {
		gov2OverviewItems.splice(
			2,
			0,
			getSiderMenuItem(
				'Grants',
				'/grants',
				<BountiesIcon className="text-white" />
			)
		);
	}

	if (
		typeof window !== 'undefined' &&
		window.screen.width < 1024 &&
		(isOpenGovSupported(network) || network === 'polkadot')
	) {
		gov2OverviewItems = [
			getSiderMenuItem(
				<GovernanceSwitchButton
					previousRoute={previousRoute}
					className="flex lg:hidden"
				/>,
				'/',
				''
			),
			...gov2OverviewItems
		];
	}

	const gov2Items: MenuProps['items'] = [
		...gov2OverviewItems,
		// Tracks Heading
		getSiderMenuItem(
			<span className="text-lightBlue hover:text-navBlue ml-2 uppercase text-base font-medium">
				Tracks
			</span>,
			'tracksHeading',
			null
		),
		...gov2TrackItems.mainItems,
		getSiderMenuItem(
			'Governance',
			'gov2_governance_group',
			<GovernanceGroupIcon className="text-sidebarBlue" />,
			[...gov2TrackItems.governanceItems]
		),
		getSiderMenuItem(
			'Whitelist',
			'gov2_fellowship_group',
			<FellowshipGroupIcon className="text-sidebarBlue" />,
			[...gov2TrackItems.fellowshipItems]
		)
	];

	if (isFellowshipSupported(network)) {
		gov2Items.splice(
			gov2Items.length - 1,
			1,
			getSiderMenuItem(
				'Fellowship',
				'gov2_fellowship_group',
				<FellowshipGroupIcon className="text-sidebarBlue mt-1" />,
				[...gov2TrackItems.fellowshipItems]
			)
		);
	}

	if (!['moonbeam', 'moonbase', 'moonriver'].includes(network)) {
		gov2Items.splice(
			-1,
			0,
			getSiderMenuItem(
				'Treasury',
				'gov2_treasury_group',
				<TreasuryGroupIcon className="text-sidebarBlue" />,
				[...gov2TrackItems.treasuryItems]
			)
		);
	}

	const gov2CollapsedItems: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,
		getSiderMenuItem(
			'Governance',
			'gov2_governance_group',
			<GovernanceGroupIcon className="text-white" />,
			[...gov2TrackItems.governanceItems]
		),
		getSiderMenuItem(
			'Whitelist',
			'gov2_fellowship_group',
			<FellowshipGroupIcon className="text-white" />,
			[...gov2TrackItems.fellowshipItems]
		)
	];

	if (isFellowshipSupported(network)) {
		gov2CollapsedItems.splice(
			gov2CollapsedItems.length - 1,
			1,
			getSiderMenuItem(
				'Fellowship',
				'gov2_fellowship_group',
				<FellowshipGroupIcon className="text-white" />,
				[...gov2TrackItems.fellowshipItems]
			)
		);
	}

	if (!['moonbeam', 'moonbase', 'moonriver'].includes(network)) {
		gov2CollapsedItems.splice(
			-1,
			0,
			getSiderMenuItem(
				'Treasury',
				'gov2_treasury_group',
				<TreasuryGroupIcon className="text-white" />,
				[...gov2TrackItems.treasuryItems]
			)
		);
	}

	const isGov2Route: boolean = checkGov2Route(
		router.pathname,
		router.query,
		previousRoute,
		network
	);

	const handleMenuClick = (menuItem: any) => {
		if (['userMenu', 'tracksHeading'].includes(menuItem.key)) return;
		router.push(menuItem.key);
		setSidedrawer(false);
	};

	const handleLogout = async () => {
		logout(setUserDetailsContextState);
		router.replace(router.asPath);
	};

	const userDropdown = getUserDropDown(handleLogout, picture, username!);

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isGov2Route) {
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (username) {
		sidebarItems = [userDropdown, ...sidebarItems];
	}

	return (
		<Layout className={className}>
			<NavHeader
				sidedrawer={sidedrawer}
				setSidedrawer={setSidedrawer}
				previousRoute={previousRoute}
			/>
			<Layout hasSider>
				<Sider
					trigger={null}
					collapsible={false}
					collapsed={true}
					onMouseOver={() => setSidedrawer(true)}
					style={{
						transform: sidedrawer
							? 'translateX(-80px)'
							: 'translateX(0px)',
						transitionDuration: '0.3s'
					}}
					className={
						'hidden overflow-y-hidden sidebar bg-white lg:block bottom-0 left-0 h-screen fixed z-40'
					}
				>
					<Menu
						theme="light"
						mode="inline"
						selectedKeys={[router.pathname]}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${
							username ? 'auth-sider-menu' : ''
						} mt-[60px]`}
					/>
				</Sider>
				<Drawer
					placement="left"
					closable={false}
					onClose={() => setSidedrawer(false)}
					open={sidedrawer}
					getContainer={false}
					style={{
						bottom: 0,
						height: '100vh',
						left: 0,
						position: 'fixed',
						top: '60px'
					}}
				>
					<Menu
						theme="light"
						mode="inline"
						selectedKeys={[router.pathname]}
						defaultOpenKeys={[
							'democracy_group',
							'treasury_group',
							'council_group',
							'tech_comm_group',
							'alliance_group'
						]}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${
							username ? 'auth-sider-menu' : ''
						} mt-[60px]`}
						onMouseLeave={() => setSidedrawer(false)}
					/>
				</Drawer>
				{['kusama', 'polkadot'].includes(network) &&
				['/', '/opengov', '/gov-2'].includes(router.asPath) ? (
					<Layout className="min-h-[calc(100vh - 10rem)] bg-[#F5F6F8]">
						{/* Dummy Collapsed Sidebar for auto margins */}
						<OpenGovHeaderBanner />
						<div className="flex flex-row">
							<div className="hidden lg:block bottom-0 left-0 w-[80px] -z-50"></div>
							<CustomContent
								Component={Component}
								pageProps={pageProps}
							/>
						</div>
					</Layout>
				) : (
					<Layout
						className={`min-h-[calc(100vh - 10rem)] bg-[#F5F6F8] flex flex-row ${
							network === 'polkadot' &&
							router.asPath === '/opengov'
								? 'bg-[rgba(0,0,0,0.65)]'
								: ''
						}`}
					>
						{/* Dummy Collapsed Sidebar for auto margins */}
						<div className="hidden lg:block bottom-0 left-0 w-[80px] -z-50"></div>
						<CustomContent
							Component={Component}
							pageProps={pageProps}
						/>
					</Layout>
				)}
			</Layout>
			<Footer />
		</Layout>
	);
};

const CustomContent = memo(function CustomContent({
	Component,
	pageProps
}: Props) {
	return (
		<Content
			className={
				'lg:opacity-100 flex-initial mx-auto min-h-[90vh] w-[94vw] lg:w-[85vw] 2xl:w-5/6 my-6 max-w-7xl'
			}
		>
			<Component {...pageProps} />
		</Content>
	);
});

export default styled(AppLayout)`
	.ant-drawer .ant-drawer-mask {
		position: fixed !important;
	}

	.ant-drawer .ant-drawer-content {
		height: auto !important;
	}

	.ant-drawer-content-wrapper,
	.ant-drawer-content {
		max-width: 256px !important;
		box-shadow: none !important;
		min-width: 60px !important;
	}

	.ant-drawer-body {
		text-transform: capitalize !important;
		padding: 0 !important;

		ul {
			margin-top: 0 !important;
		}
	}

	.ant-menu-item .anticon,
	.ant-menu-item-icon {
		font-size: 20px !important;
	}

	.ant-menu-item .delegation {
		font-size: 20px !important;
	}
	.ant-menu-item .delegation .opacity {
		opacity: 1 !important;
		margin-top: -17px !important;
	}

	.ant-menu-item-selected {
		background: #fff !important;

		.ant-menu-title-content {
			color: var(--pink_primary) !important;
		}
	}

	.ant-menu-title-content:hover {
		color: var(--pink_primary) !important;
	}

	.ant-menu-item::after {
		border-right: none !important;
	}

	.ant-menu-title-content {
		color: #485f7d !important;
		font-weight: 500;
		font-size: 14px;
		line-height: 21px;
		letter-spacing: 0.01em;
	}

	.auth-sider-menu {
		list-style: none !important;
	}

	.auth-sider-menu > li:first-child {
		margin-bottom: 25px;
		margin-top: 15px;
	}

	.ant-empty-image {
		display: flex;
		justify-content: center;
	}

	.sidebar .ant-menu-item-selected .anticon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%)
			saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}

	.sidebar .ant-menu-item-selected .opacity {
		background-color: var(--pink_primary) !important;
	}
	.ant-menu-inline-collapsed-noicon {
		color: var(--lightBlue);
	}

	.ant-menu-item-selected {
		.ant-menu-inline-collapsed-noicon {
			color: var(--pink_primary);
		}
	}

	.ant-menu-sub {
		background: #fff !important;
	}
`;
