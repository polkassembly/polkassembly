// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { DownOutlined, LogoutOutlined, SettingOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, Layout, Menu, MenuProps, Modal } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { NextComponentType, NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, ReactNode, useEffect, useState } from 'react';
import { isExpired } from 'react-jwt';
import { useApiContext, useNetworkContext, useUserDetailsContext } from 'src/context';
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
	ApplayoutIdentityIcon,
	ArchivedIcon
} from 'src/ui-components/CustomIcons';
import styled from 'styled-components';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { isFellowshipSupported } from '~src/global/fellowshipNetworks';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';

import Footer from './Footer';
import NavHeader from './NavHeader';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import OpenGovHeaderBanner from './OpenGovHeaderBanner';
import dynamic from 'next/dynamic';
import { poppins } from 'pages/_app';

import IdentityCaution from '~assets/icons/identity-caution.svg';
import CloseIcon from '~assets/icons/close-icon.svg';
import DelegationDashboardEmptyState from '~assets/icons/delegation-empty-state.svg';
import getEncodedAddress from '~src/util/getEncodedAddress';
import PaLogo from './PaLogo';

const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});
const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getSiderMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
	return {
		children,
		icon,
		key,
		label,
		type: ['tracksHeading', 'pipsHeading'].includes(key as string) ? 'group' : ''
	} as MenuItem;
}

export const onchainIdentitySupportedNetwork: Array<string> = [AllNetworks.POLKADOT];

const getUserDropDown = (
	handleSetIdentityClick: any,
	isIdentityUnverified: boolean,
	isGood: boolean,
	handleLogout: any,
	network: string,
	img?: string | null,
	username?: string,
	identityUsername?: string,
	className?: string
): MenuItem => {
	const profileUsername = identityUsername || username || '';
	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: (
				<Link
					className='flex items-center gap-x-2 font-medium text-lightBlue hover:text-pink_primary'
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
					className='flex items-center gap-x-2 font-medium text-lightBlue hover:text-pink_primary'
					href='/settings?tab=account'
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
					href='/'
					className='flex items-center gap-x-2 font-medium text-lightBlue hover:text-pink_primary'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleLogout(username);
					}}
				>
					<LogoutOutlined />
					<span>Logout</span>
				</Link>
			)
		}
	];

	if (onchainIdentitySupportedNetwork.includes(network)) {
		dropdownMenuItems.splice(1, 0, {
			key: 'set on-chain identity',
			label: (
				<Link
					className={`-ml-1 flex items-center gap-x-2 font-medium text-lightBlue hover:text-pink_primary ${className}`}
					href={''}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						handleSetIdentityClick();
					}}
				>
					<span className='ml-[2px] text-lg'>
						<ApplayoutIdentityIcon />
					</span>
					<span>Set on-chain identity</span>
					{isIdentityUnverified && (
						<span className='flex items-center'>
							<IdentityCaution />
						</span>
					)}
				</Link>
			)
		});
	}

	const AuthDropdown = ({ children }: { children: ReactNode }) => (
		<Dropdown
			menu={{ items: dropdownMenuItems }}
			trigger={['click']}
			className='profile-dropdown'
		>
			{children}
		</Dropdown>
	);

	return getSiderMenuItem(
		<AuthDropdown>
			<div className='flex items-center justify-between gap-x-2'>
				<div className={`flex gap-2 text-sm ${!isGood && isIdentityUnverified && 'w-[85%]'}`}>
					<span className={`normal-case ${!isGood && isIdentityUnverified && 'truncate'}`}>
						{profileUsername && profileUsername?.length > 12 && isGood && !isIdentityUnverified ? `${profileUsername?.slice(0, 12)}...` : profileUsername}
					</span>
					{isGood && !isIdentityUnverified && (
						<CheckCircleFilled
							style={{ color: 'green' }}
							className='rounded-full border-none bg-transparent text-sm'
						/>
					)}
				</div>
				<DownOutlined className='text-base text-navBlue hover:text-pink_primary' />
			</div>
		</AuthDropdown>,
		'userMenu',
		<AuthDropdown>
			{img ? (
				<Avatar
					className='-ml-2.5 mr-2'
					size={40}
					src={img}
				/>
			) : (
				<Avatar
					className='-ml-2.5 mr-2'
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
	const { api, apiReady } = useApiContext();
	const { setUserDetailsContextState, username, picture, loginAddress } = useUserDetailsContext();
	const [sidedrawer, setSidedrawer] = useState<boolean>(false);
	const router = useRouter();
	const [previousRoute, setPreviousRoute] = useState(router.asPath);
	const [open, setOpen] = useState<boolean>(false);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024 && isOpenGovSupported(network)) || false;
	const [identityMobileModal, setIdentityMobileModal] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(true);
	const [isGood, setIsGood] = useState<boolean>(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');

	useEffect(() => {
		const handleRouteChange = () => {
			if (router.asPath.split('/')[1] !== 'discussions' && router.asPath.split('/')[1] !== 'post') {
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
		if (!window || !(window as any).ethereum || !(window as any).ethereum.on) return;
		(window as any).ethereum.on('accountsChanged', () => {
			window.location.reload();
		});
	}, []);

	useEffect(() => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;
		const address = localStorage.getItem('loginAddress');
		const encoded_addr = address ? getEncodedAddress(address, network) : '';

		if (!encoded_addr) return;

		api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				if (info.identity.displayParent && info.identity.display) {
					// when an identity is a sub identity `displayParent` is set
					// and `display` get the sub identity
					setMainDisplay(info.identity.displayParent);
				} else {
					// There should not be a `displayParent` without a `display`
					// but we can't be too sure.
					setMainDisplay(info.identity.displayParent || info.identity.display || info.nickname || '');
				}
				const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
				const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);
				const isGood = info.identity?.judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
				setIsGood(Boolean(isGood));
				setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginAddress]);

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
								<PaLogo
									className={`${sidedrawer ? 'ml-2' : 'ml-0'}h-full`}
									sidedrawer={sidedrawer}
								/>
								<div className={`${sidedrawer ? 'ml-[38px] w-56' : ''} border-bottom -mx-4 my-2`}></div>
							</div>
						</div>
				  )
				: null,
			getSiderMenuItem('Overview', '/', <OverviewIcon className='text-white' />),
			getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 text-white' />),
			getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='text-white' />),
			// getSiderMenuItem('News', '/news', <NewsIcon className='text-white' />),
			getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-3 text-white' />)
		],
		democracyItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Proposals', '/proposals', <DemocracyProposalsIcon className='text-white' />),
					getSiderMenuItem('Referenda', '/referenda', <ReferendaIcon className='text-white' />)
			  ]
			: [],
		councilItems: chainProperties[network]?.subsquidUrl
			? [getSiderMenuItem('Motions', '/motions', <MotionsIcon className='text-white' />), getSiderMenuItem('Members', '/council', <MembersIcon className='text-white' />)]
			: [],
		treasuryItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Proposals', '/treasury-proposals', <TreasuryProposalsIcon className='text-white' />),
					getSiderMenuItem('Tips', '/tips', <TipsIcon className='text-white' />)
			  ]
			: [],
		techCommItems: chainProperties[network]?.subsquidUrl ? [getSiderMenuItem('Proposals', '/tech-comm-proposals', <TechComProposalIcon className='text-white' />)] : [],
		allianceItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Announcements', '/alliance/announcements', <NewsIcon className='text-white' />),
					getSiderMenuItem('Motions', '/alliance/motions', <MotionsIcon className='text-white' />),
					getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className='text-white' />),
					getSiderMenuItem('Members', '/alliance/members', <MembersIcon className='text-white' />)
			  ]
			: [],
		PIPsItems:
			chainProperties[network]?.subsquidUrl && network === 'polymesh'
				? [
						getSiderMenuItem('Technical Committee', '/technical', <RootIcon className='mt-1.5 text-white' />),
						getSiderMenuItem('Upgrade Committee', '/upgrade', <UpgradeCommitteePIPsIcon className='mt-1.5 text-white' />),
						getSiderMenuItem('Community', '/community', <CommunityPIPsIcon className='mt-1.5 text-white' />)
				  ]
				: []
	};
	if (isGrantsSupported(network)) {
		gov1Items['overviewItems'].splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='text-white' />));
	}

	let items: MenuProps['items'] = isOpenGovSupported(network) ? [] : [...gov1Items.overviewItems];

	if (chainProperties[network]?.subsquidUrl && network !== 'polymesh') {
		items = items.concat([
			getSiderMenuItem('Democracy', 'democracy_group', null, [...gov1Items.democracyItems]),

			getSiderMenuItem(
				'Treasury',
				'treasury_group',
				null,
				isOpenGovSupported(network)
					? !['moonbeam', 'moonbase', 'moonriver'].includes(network)
						? [...gov1Items.treasuryItems]
						: [
								...gov1Items.treasuryItems,
								getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='text-white' />),
								getSiderMenuItem('Child Bounties', '/child_bounties', <ChildBountiesIcon className='ml-0.5' />)
						  ]
					: [
							...gov1Items.treasuryItems,
							getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='text-white' />),
							getSiderMenuItem('Child Bounties', '/child_bounties', <ChildBountiesIcon className='ml-0.5' />)
					  ]
			),

			getSiderMenuItem('Council', 'council_group', null, [...gov1Items.councilItems]),

			getSiderMenuItem('Tech. Comm.', 'tech_comm_group', null, [...gov1Items.techCommItems])
		]);
	}

	let collapsedItems: MenuProps['items'] = isOpenGovSupported(network) ? [] : [...gov1Items.overviewItems];

	if (chainProperties[network]?.subsquidUrl && network !== 'polymesh') {
		collapsedItems = collapsedItems.concat([...gov1Items.democracyItems, ...gov1Items.treasuryItems, ...gov1Items.councilItems, ...gov1Items.techCommItems]);
	}
	if (network === 'polymesh') {
		items = items.concat(
			getSiderMenuItem(<span className='ml-2 cursor-text text-base font-medium uppercase text-lightBlue hover:text-navBlue'>PIPs</span>, 'pipsHeading', null),
			...gov1Items.PIPsItems
		);
		collapsedItems = collapsedItems.concat([...gov1Items.PIPsItems]);
	}

	if (network === AllNetworks.COLLECTIVES) {
		const fellowshipItems = [
			getSiderMenuItem('Members', '/fellowship', <MembersIcon className='text-white' />),
			getSiderMenuItem('Member Referenda', '/member-referenda', <FellowshipGroupIcon className='text-sidebarBlue' />)
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

	if (isFellowshipSupported(network)) {
		gov2TrackItems?.fellowshipItems?.splice(0, 1, getSiderMenuItem('Members', '/fellowship'), getSiderMenuItem('Member Referenda', '/member-referenda'));
	}

	if (network && networkTrackInfo[network]) {
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
					const icon = trackName === PostOrigin.ROOT ? <RootIcon /> : trackName === PostOrigin.AUCTION_ADMIN ? <AuctionAdminIcon className='ml-0.5' /> : <StakingAdminIcon />;
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
							<PaLogo
								className={`${sidedrawer ? 'ml-2' : 'ml-0'}h-full`}
								sidedrawer={sidedrawer}
							/>
							<div className={`${sidedrawer ? 'ml-[38px] w-56' : ''} border-bottom -mx-4 my-2`}></div>
						</div>
					</div>
			  )
			: null,
		getSiderMenuItem('Overview', '/opengov', <OverviewIcon className='mt-1 text-white' />),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 text-white' />),
		getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='text-white' />),
		// getSiderMenuItem('News', '/news', <NewsIcon className='text-white' />),
		getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-2.5 text-white' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1' />)
	];

	if (['kusama', 'polkadot'].includes(network)) {
		gov2OverviewItems.splice(2, 0, getSiderMenuItem('Delegation', '/delegation', <DelegatedIcon className='mt-1.5' />));
	}
	if (isGrantsSupported(network)) {
		gov2OverviewItems.splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='text-white' />));
	}

	let gov2Items: MenuProps['items'] = [
		...gov2OverviewItems,
		// Tracks Heading
		getSiderMenuItem(<span className='ml-2 text-base font-medium uppercase text-lightBlue hover:text-navBlue'>Tracks</span>, 'tracksHeading', null),
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='text-sidebarBlue' />, [...gov2TrackItems.governanceItems]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-sidebarBlue' />, [...gov2TrackItems.fellowshipItems])
	];

	const gov2CollapsedItems: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='text-white' />, [...gov2TrackItems.governanceItems]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-white' />, [...gov2TrackItems.fellowshipItems])
	];

	if (isFellowshipSupported(network)) {
		gov2Items.splice(
			gov2Items.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 text-sidebarBlue' />, [...gov2TrackItems.fellowshipItems])
		);
	}

	if (!['moonbeam', 'moonbase', 'moonriver'].includes(network)) {
		if (network !== 'picasso') {
			let items = [...gov2TrackItems.treasuryItems];
			if (isOpenGovSupported(network)) {
				items = items.concat(getSiderMenuItem('Bounties', '/bounties', null), getSiderMenuItem('Child Bounties', '/child_bounties', null));
			}
			gov2Items.splice(-1, 0, getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='text-sidebarBlue' />, [...items]));
		} else {
			gov2Items.splice(gov2Items.length - 2, 1);
		}
	}

	if (isFellowshipSupported(network)) {
		gov2CollapsedItems.splice(
			gov2CollapsedItems.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-white' />, [...gov2TrackItems.fellowshipItems])
		);
	}

	if (!['moonbeam', 'moonbase', 'moonriver'].includes(network)) {
		if (network !== 'picasso') {
			gov2CollapsedItems.splice(-1, 0, getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='text-white' />, [...gov2TrackItems.treasuryItems]));
		} else {
			gov2CollapsedItems.splice(gov2CollapsedItems.length - 2, 1);
		}
	}

	const handleMenuClick = (menuItem: any) => {
		if (['userMenu', 'tracksHeading', 'pipsHeading'].includes(menuItem.key)) return;
		router.push(menuItem.key);
		setSidedrawer(false);
	};
	const handleLogout = async (username: string) => {
		logout(setUserDetailsContextState);
		router.replace(router.asPath);
		if (!router.query?.username) return;
		if (router.query?.username.includes(username)) {
			router.replace('/');
		}
	};

	const handleIdentityButtonClick = () => {
		const address = localStorage.getItem('identityAddress');
		if (isMobile) {
			setIdentityMobileModal(true);
		} else {
			if (address?.length) {
				setOpen(!open);
			} else {
				setOpenAddressLinkedModal(true);
			}
		}
	};
	if (network !== AllNetworks.POLYMESH) {
		gov2Items = [...gov2Items, getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='text-lightBlue' />, [...items])];
	}

	const userDropdown = getUserDropDown(
		handleIdentityButtonClick,
		isIdentityUnverified,
		isGood,
		handleLogout,
		network,
		picture,
		username!,
		mainDisplay!,
		`${className} ${poppins.className} ${poppins.variable}`
	);

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isOpenGovSupported(network)) {
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (isMobile) {
		sidebarItems = [getSiderMenuItem('', '', <div className='mt-[60px]' />), username && isMobile ? userDropdown : null, ...sidebarItems];
	}

	return (
		<Layout className={className}>
			<NavHeader
				sidedrawer={sidedrawer}
				setSidedrawer={setSidedrawer}
				previousRoute={previousRoute}
				displayName={mainDisplay}
				isVerified={isGood && !isIdentityUnverified}
			/>
			<Layout hasSider>
				<Sider
					trigger={null}
					collapsible={false}
					collapsed={true}
					onMouseOver={() => setSidedrawer(true)}
					style={{ transform: sidedrawer ? 'translateX(-80px)' : 'translateX(0px)', transitionDuration: '0.3s' }}
					className={'sidebar fixed bottom-0 left-0 z-[1005] hidden h-screen overflow-y-hidden bg-white lg:block'}
				>
					<Menu
						theme='light'
						mode='inline'
						selectedKeys={[router.pathname]}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${username ? 'auth-sider-menu' : ''}`}
					/>
				</Sider>
				<Drawer
					placement='left'
					closable={false}
					className='menu-container'
					onClose={() => setSidedrawer(false)}
					open={sidedrawer}
					getContainer={false}
					style={{
						bottom: 0,
						height: '100vh',
						left: 0,
						position: 'fixed',
						zIndex: '1005'
					}}
				>
					<Menu
						theme='light'
						mode='inline'
						selectedKeys={[router.pathname]}
						defaultOpenKeys={['democracy_group', 'treasury_group', 'council_group', 'tech_comm_group', 'alliance_group']}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${username ? 'auth-sider-menu' : ''} mt-[60px]`}
						onMouseLeave={() => setSidedrawer(false)}
					/>
				</Drawer>
				{['moonbeam', 'moonriver'].includes(network) && ['/', 'opengov', '/gov-2'].includes(router.asPath) ? (
					<Layout className='min-h-[calc(100vh - 10rem)] bg-[#F5F6F8]'>
						{/* Dummy Collapsed Sidebar for auto margins */}
						<OpenGovHeaderBanner network={'moonbeam'} />
						<div className='flex flex-row'>
							<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
							<CustomContent
								Component={Component}
								pageProps={pageProps}
							/>
						</div>
					</Layout>
				) : (
					<Layout className={'min-h-[calc(100vh - 10rem)] flex flex-row bg-[#F5F6F8]'}>
						{/* Dummy Collapsed Sidebar for auto margins */}
						<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
						<CustomContent
							Component={Component}
							pageProps={pageProps}
						/>
					</Layout>
				)}
			</Layout>
			{onchainIdentitySupportedNetwork.includes(network) && (
				<OnChainIdentity
					open={open}
					setOpen={setOpen}
					openAddressLinkedModal={openAddressLinkedModal}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				/>
			)}

			<Footer />
			<Modal
				zIndex={999}
				open={identityMobileModal}
				footer={false}
				closeIcon={<CloseIcon />}
				onCancel={() => setIdentityMobileModal(false)}
				className={`${poppins.className} ${poppins.variable} w-[600px] max-sm:w-full`}
				title={<span className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#E1E6EB] px-6 pb-3 text-xl font-semibold'>On-chain identity</span>}
			>
				<div className='flex flex-col items-center gap-6 py-4 text-center'>
					<DelegationDashboardEmptyState />
					<span>Please use your desktop computer to verify on chain identity</span>
				</div>
			</Modal>
		</Layout>
	);
};

const CustomContent = memo(function CustomContent({ Component, pageProps }: Props) {
	return (
		<Content className={'mx-auto my-6 min-h-[90vh] w-[94vw] max-w-7xl flex-initial lg:w-[85vw] lg:opacity-100 2xl:w-5/6'}>
			<Component {...pageProps} />
		</Content>
	);
});

export default styled(AppLayout)`
	.svgLogo svg {
		height: 60%;
	}

	.border-bottom {
		border-bottom: 1px solid #d2d8e0;
	}
	.border-right {
		border-right: 1px solid #d2d8e0;
	}

	#rc-menu-uuid-75314-4- {
		border-bottom: 1px solid gray;
	}

	#rc-menu-uuid-44115-4- .logo-container {
		height: 100px !important;
	}

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

	.ant-empty-image {
		display: flex;
		justify-content: center;
	}

	.sidebar .ant-menu-item-selected .anticon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
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

	.ant-menu-item > .logo-container {
		height: 100px;
	}

	.logo-container:hover {
		background: #fff !important;
	}

	.menu-container {
		top: 0px;
	}

	@media (max-width: 468px) and (min-width: 380px) {
		.menu-container {
			top: 62px !important;
		}

		.logo-display-block {
			display: none !important;
		}

		.user-container {
			display: flex !important;
			width: 200px !important;
			border: none !important;
			background-color: #fff !important;
		}

		.logo-container {
			display: flex !important;
		}

		.user-image {
			font-size: 14px !important;
		}

		.user-info {
			font-size: 14px !important;
		}

		.user-info-dropdown {
			transform: scale(0.7);
		}
	}
`;
