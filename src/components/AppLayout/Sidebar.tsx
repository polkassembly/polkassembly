// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @next/next/no-img-element */
/* eslint-disable sort-keys */
import React, { memo, useState } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import { isFellowshipSupported } from '~src/global/fellowshipNetworks';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, MenuProps, Menu as AntdMenu, Layout, Drawer } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
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
	StakingAdminIcon,
	TipsIcon,
	TreasuryGroupIcon,
	TreasuryProposalsIcon,
	ChildBountiesIcon,
	TechComProposalIcon,
	DelegatedIcon,
	RootIcon,
	UpgradeCommitteePIPsIcon,
	CommunityPIPsIcon,
	ArchivedIcon
} from 'src/ui-components/CustomIcons';

import PaLogo from './PaLogo';
import styled from 'styled-components';
import UserDropdown from './UserDropdown';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import ToggleButton from '~src/ui-components/ToggleButton';
import BigToggleButton from '~src/ui-components/ToggleButton/BigToggleButton';
import OpenGovHeaderBanner from './OpenGovHeaderBanner';
import { ISidebar } from './types';
import { delegationSupportedNetworks } from '../Post/Tabs/PostStats/util/constants';

const { Content, Sider } = Layout;

interface Props {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}

const CustomContent = memo(function CustomContent({ Component, pageProps }: Props) {
	return (
		<Content className={'mx-auto my-6 min-h-[90vh] w-[94vw] max-w-7xl flex-initial lg:w-[85vw] lg:opacity-100 2xl:w-5/6'}>
			<Component {...pageProps} />
		</Content>
	);
});

type MenuItem = Required<MenuProps>['items'][number];
const Menu = styled(AntdMenu)`
	.ant-menu-sub.ant-menu-inline {
		background: ${(props: any) => {
			return props.theme === 'dark' ? '#0D0D0D' : '#fff';
		}} !important;
	}

	.ant-menu-item-selected {
		.ant-menu-title-content > span {
			color: var(--pink_primary) !important;
		}
		.ant-menu-item-icon {
			color: var(--pink_primary) !important;
		}
		background: ${(props: any) => (props.theme === 'dark' ? 'none' : '#fff')} !important;
	}
`;

function getSiderMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
	label = <span className='text-xs font-medium text-lightBlue  dark:text-icon-dark-inactive'>{label}</span>;
	return {
		children,
		icon,
		key,
		label,
		type: ['tracksHeading', 'pipsHeading'].includes(key as string) ? 'group' : ''
	} as MenuItem;
}

const Sidebar = ({ Component, pageProps, className, displayName, isIdentityExists, isVerified, setOpenAddressLinkedModal, setOpenIdentityModal }: ISidebar) => {
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const { username, picture } = useUserDetailsSelector();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [sidedrawer, setSidedrawer] = useState<boolean>(false);

	const handleMenuClick = (menuItem: any) => {
		if (['userMenu', 'tracksHeading', 'pipsHeading'].includes(menuItem.key)) return;
		router.push(menuItem.key);
		{
			isMobile && setSidedrawer(false);
		}
	};

	const { network } = useNetworkSelector();
	const gov1Items: { [x: string]: ItemType[] } = {
		overviewItems: [
			!isMobile
				? getSiderMenuItem(
						'',
						'',
						<div
							className={`${className} ${
								sidedrawer ? '-ml-20 mt-2 w-[300px]' : 'mt-0'
							} svgLogo logo-container logo-display-block flex h-[66px] items-center justify-center bg-transparent`}
						>
							<div>
								<div className={`${sidedrawer ? 'ml-2' : 'ml-0'} h-full`}>
									{sidedrawer ? (
										<img
											src={theme === 'dark' ? '/assets/PALogoDark.svg' : '/assets/pa-logo-black.svg'}
											alt='polkassembly logo'
										/>
									) : (
										<PaLogo sidedrawer={sidedrawer} />
									)}
								</div>
								<div className={`${sidedrawer ? 'ml-[38px] w-[255px]' : ''} border-bottom border-b-1 -mx-4 my-2 dark:border-separatorDark`}></div>
							</div>
						</div>
				  )
				: null,
			getSiderMenuItem('Overview', '/', <OverviewIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-3 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		],
		democracyItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Proposals', '/proposals', <DemocracyProposalsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Referenda', '/referenda', <ReferendaIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		councilItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Motions', '/motions', <MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/council', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		treasuryItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Proposals', '/treasury-proposals', <TreasuryProposalsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Tips', '/tips', <TipsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		techCommItems: chainProperties[network]?.subsquidUrl
			? [getSiderMenuItem('Proposals', '/tech-comm-proposals', <TechComProposalIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)]
			: [],
		allianceItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Announcements', '/alliance/announcements', <NewsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Motions', '/alliance/motions', <MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/alliance/members', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		PIPsItems:
			chainProperties[network]?.subsquidUrl && network === AllNetworks.POLYMESH
				? [
						getSiderMenuItem('Technical Committee', '/technical', <RootIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
						getSiderMenuItem('Upgrade Committee', '/upgrade', <UpgradeCommitteePIPsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
						getSiderMenuItem('Community', '/community', <CommunityPIPsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
				  ]
				: [],
		AdvisoryCommittee:
			chainProperties[network]?.subsquidUrl && network === AllNetworks.ZEITGEIST
				? [
						getSiderMenuItem('Motions', '/advisory-committee/motions', <MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
						getSiderMenuItem('Members', '/advisory-committee/members', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
				  ]
				: []
	};

	let items: MenuProps['items'] = isOpenGovSupported(network) ? [] : [...gov1Items.overviewItems];

	let collapsedItems: MenuProps['items'] = isOpenGovSupported(network) ? [] : [...gov1Items.overviewItems];

	if (network === AllNetworks.POLYMESH) {
		items = items.concat(
			getSiderMenuItem(
				<span className='ml-2 cursor-text text-xs font-medium uppercase text-lightBlue  hover:text-navBlue dark:text-icon-dark-inactive'>PIPs</span>,
				'pipsHeading',
				null
			),
			...gov1Items.PIPsItems
		);
		collapsedItems = collapsedItems.concat([...gov1Items.PIPsItems]);
	}

	if (network === AllNetworks.ZEITGEIST) {
		items = [...items, getSiderMenuItem('Advisory Committee', 'advisory-committee', null, [...gov1Items.AdvisoryCommittee])];
		collapsedItems = [
			...collapsedItems,
			getSiderMenuItem('Advisory Committee', 'advisory-committee', <CommunityPIPsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov1Items.AdvisoryCommittee
			])
		];
	}
	if (network === AllNetworks.COLLECTIVES) {
		const fellowshipItems = [
			getSiderMenuItem('Members', '/fellowship', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Member Referenda', '/member-referenda', <FellowshipGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		];
		items = [
			...gov1Items.overviewItems,
			getSiderMenuItem('Alliance', 'alliance_group', null, [...gov1Items.allianceItems]),
			getSiderMenuItem('Fellowship', 'fellowship_group', null, fellowshipItems)
		];
		collapsedItems = [...gov1Items.overviewItems, ...gov1Items.allianceItems, ...fellowshipItems];
	} else if (network === AllNetworks.WESTENDCOLLECTIVES) {
		items = [...gov1Items.overviewItems, getSiderMenuItem('Alliance', 'alliance_group', null, [...gov1Items.allianceItems])];
		collapsedItems = [...gov1Items.overviewItems, ...gov1Items.allianceItems];
	}

	const gov2TrackItems: { [x: string]: ItemType[] } = {
		mainItems: [],
		governanceItems: [],
		treasuryItems: [],
		fellowshipItems: [getSiderMenuItem('Members', '/members')]
	};

	if (network && networkTrackInfo[network]) {
		gov2TrackItems.mainItems.push(getSiderMenuItem('All', '/all-posts', <OverviewIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />));

		for (const trackName of Object.keys(networkTrackInfo[network])) {
			if (!networkTrackInfo[network][trackName] || !('group' in networkTrackInfo[network][trackName])) continue;

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
						trackName === 'all' ? (
							<RootIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.ROOT ? (
							<RootIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<AuctionAdminIcon className='mt-[1px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : (
							<StakingAdminIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
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

	const gov2OverviewItems = [
		!isMobile
			? getSiderMenuItem(
					'',
					'',
					<div
						className={`${className} ${
							sidedrawer ? '-ml-20 mt-2 w-[300px]' : 'mt-0'
						} svgLogo logo-container logo-display-block flex h-[66px] items-center justify-center bg-transparent`}
					>
						<div>
							<div className={`${sidedrawer ? 'ml-2' : 'ml-0'} h-full`}>
								{sidedrawer ? (
									<img
										src={theme === 'dark' ? '/assets/PALogoDark.svg' : '/assets/pa-logo-black.svg'}
										alt='polkassembly logo'
									/>
								) : (
									<PaLogo sidedrawer={sidedrawer} />
								)}
							</div>
							<div className={`${sidedrawer ? 'ml-[38px] w-[255px]' : ''} border-bottom border-b-1 -mx-4 my-2 dark:border-separatorDark`}></div>
						</div>
					</div>
			  )
			: null,
		getSiderMenuItem('Overview', '/opengov', <OverviewIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-2.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
	];

	if (delegationSupportedNetworks.includes(network)) {
		gov2OverviewItems.splice(
			3,
			0,
			getSiderMenuItem('Delegation', '/delegation', <DelegatedIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		);
	}
	if (isGrantsSupported(network)) {
		gov2OverviewItems.splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
	}

	let gov2Items: MenuProps['items'] = [
		...gov2OverviewItems,
		// Tracks Heading
		getSiderMenuItem(
			<span className='-py-1 ml-2 text-xs font-medium uppercase text-lightBlue  hover:text-navBlue dark:text-icon-dark-inactive'>Tracks</span>,
			'tracksHeading',
			null
		),
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.governanceItems
		]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.fellowshipItems
		])
	];

	let gov2CollapsedItems: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.governanceItems
		]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.fellowshipItems
		])
	];

	if (isFellowshipSupported(network)) {
		gov2TrackItems?.fellowshipItems?.splice(0, 1, getSiderMenuItem('Members', '/fellowship'), getSiderMenuItem('Member Referenda', '/member-referenda'));

		gov2Items.splice(
			gov2Items.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
		gov2CollapsedItems.splice(
			gov2CollapsedItems.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO].includes(network)) {
		let items = [...gov2TrackItems.treasuryItems];
		if (isOpenGovSupported(network)) {
			items = items.concat(getSiderMenuItem('Bounties', '/bounties', null), getSiderMenuItem('Child Bounties', '/child_bounties', null));
		}
		gov2Items.splice(
			-1,
			0,
			getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
		);
		gov2CollapsedItems.splice(
			-1,
			0,
			getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.treasuryItems
			])
		);
	}

	if ([AllNetworks.MOONBEAM, AllNetworks.PICASSO].includes(network)) {
		gov2Items = gov2Items.concat(
			getSiderMenuItem('Treasury', 'gov1_treasury_group', <TreasuryGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		);
		gov2CollapsedItems = [
			...gov2CollapsedItems,
			getSiderMenuItem('Treasury', 'treasury_group', <TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		];
	}

	if (network !== AllNetworks.POLYMESH) {
		if ([AllNetworks.PICASSO].includes(network)) {
			items = items.concat([
				getSiderMenuItem('Democracy', 'democracy_group', null, [...gov1Items.democracyItems]),
				getSiderMenuItem('Council', 'council_group', null, [...gov1Items.councilItems]),
				getSiderMenuItem('Tech. Comm.', 'tech_comm_group', null, [...gov1Items.techCommItems])
			]);
		} else {
			items = items.concat([
				getSiderMenuItem('Democracy', 'democracy_group', null, [...gov1Items.democracyItems]),
				getSiderMenuItem(
					'Treasury',
					'treasury_group',
					null,
					isOpenGovSupported(network)
						? ![AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)
							? [...gov1Items.treasuryItems]
							: network === AllNetworks.MOONBEAM
							? [
									...[
										getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
										getSiderMenuItem(
											'Child Bounties',
											'/child_bounties',
											<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />
										)
									]
							  ]
							: [
									...gov1Items.treasuryItems,
									getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
									getSiderMenuItem(
										'Child Bounties',
										'/child_bounties',
										<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />
									)
							  ]
						: [AllNetworks.POLIMEC, AllNetworks.ROLIMEC].includes(network)
						? [...gov1Items.treasuryItems.slice(0, 1)]
						: [
								...gov1Items.treasuryItems,
								getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
								getSiderMenuItem(
									'Child Bounties',
									'/child_bounties',
									<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />
								)
						  ]
				),

				getSiderMenuItem('Council', 'council_group', null, [...gov1Items.councilItems]),

				getSiderMenuItem('Tech. Comm.', 'tech_comm_group', null, [...gov1Items.techCommItems])
			]);
		}
		collapsedItems = collapsedItems.concat([...gov1Items.democracyItems, ...gov1Items.treasuryItems, ...gov1Items.councilItems, ...gov1Items.techCommItems]);

		gov2Items = [
			...gov2Items,
			getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
		];
		gov2CollapsedItems = [...gov2CollapsedItems, getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)];
	}

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isOpenGovSupported(network)) {
		// if (loginAddress) gov2Items = [gov2Items.shift(), getReferendaDropdown(), ...gov2Items];
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (isMobile && username) {
		sidebarItems = [
			getSiderMenuItem(
				<UserDropdown
					key='user-dropdown'
					isIdentityExists={isIdentityExists}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
					setOpenIdentityModal={setOpenIdentityModal}
					displayName={displayName}
					isVerified={isVerified}
				/>,
				'userMenu',
				<UserDropdown
					key='user-dropdown'
					isIdentityExists={isIdentityExists}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
					setOpenIdentityModal={setOpenIdentityModal}
					displayName={displayName}
					isVerified={isVerified}
				>
					{picture ? (
						<Avatar
							className='-ml-2.5 mr-2'
							size={40}
							src={picture}
						/>
					) : (
						<Avatar
							className='-ml-2.5 mr-2'
							size={40}
							icon={<UserOutlined />}
						/>
					)}
				</UserDropdown>
			),
			...sidebarItems
		];
	}
	return (
		<Layout hasSider>
			<Sider
				trigger={null}
				collapsible={false}
				collapsed={true}
				onMouseOver={() => setSidedrawer(true)}
				style={{ transform: sidedrawer ? 'translateX(-80px)' : 'translateX(0px)', transitionDuration: '0.3s' }}
				className={'sidebar fixed bottom-0 left-0 z-[101] hidden h-screen overflow-y-hidden bg-white dark:bg-section-dark-overlay lg:block'}
			>
				<div className='flex h-full flex-col justify-between'>
					<Menu
						theme={theme as any}
						mode='inline'
						selectedKeys={[router.pathname]}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${username ? 'auth-sider-menu' : ''} dark:bg-section-dark-overlay`}
					/>
					<ToggleButton />
				</div>
			</Sider>
			<Drawer
				placement='left'
				closable={false}
				className={`menu-container dark:bg-section-dark-overlay ${sidedrawer && 'open-sider'}`}
				onClose={() => setSidedrawer(false)}
				open={sidedrawer}
				getContainer={false}
				style={{
					zIndex: '1005',
					position: 'fixed',
					height: '100vh',
					bottom: 0,
					left: 0
				}}
				contentWrapperStyle={{ position: 'fixed', height: '100vh', bottom: 0, left: 0 }}
			>
				<div
					className='flex h-full flex-col justify-between'
					onMouseLeave={() => setSidedrawer(false)}
				>
					<Menu
						theme={theme as any}
						mode='inline'
						selectedKeys={[router.pathname]}
						defaultOpenKeys={['democracy_group', 'treasury_group', 'council_group', 'tech_comm_group', 'alliance_group', 'advisory-committee']}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${username ? 'auth-sider-menu' : ''} dark:bg-section-dark-overlay`}
					/>

					<BigToggleButton />
				</div>
			</Drawer>
			{[''].includes(network) && ['/', '/opengov', '/gov-2'].includes(router.asPath) ? (
				<Layout className='min-h-[calc(100vh - 10rem)] bg-[#F5F6F8] dark:bg-section-dark-background'>
					{/* Dummy Collapsed Sidebar for auto margins */}
					<OpenGovHeaderBanner network={network} />
					<div className='flex flex-row'>
						<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
						<CustomContent
							Component={Component}
							pageProps={pageProps}
						/>
					</div>
				</Layout>
			) : ['/', '/opengov', '/gov-2'].includes(router.asPath) ? (
				<Layout className='min-h-[calc(100vh - 10rem)] bg-[#F5F6F8] dark:bg-section-dark-background'>
					{/* Dummy Collapsed Sidebar for auto margins */}
					<div className='flex flex-row'>
						<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
						<CustomContent
							Component={Component}
							pageProps={pageProps}
						/>
					</div>
				</Layout>
			) : (
				<Layout className={'min-h-[calc(100vh - 10rem)] flex flex-row bg-[#F5F6F8] dark:bg-section-dark-background'}>
					{/* Dummy Collapsed Sidebar for auto margins */}
					<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
					<CustomContent
						Component={Component}
						pageProps={pageProps}
					/>
				</Layout>
			)}
		</Layout>
	);
};

export default Sidebar;
