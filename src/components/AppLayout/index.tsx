// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @next/next/no-img-element */
/* eslint-disable sort-keys */
import { DownOutlined, LogoutOutlined, SettingOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Avatar, Drawer, Layout, Menu as AntdMenu, MenuProps, Modal } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { NextComponentType, NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, ReactNode, useEffect, useState } from 'react';
import { isExpired } from 'react-jwt';
import { useApiContext } from 'src/context';
import { getLocalStorageToken } from 'src/services/auth.service';
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
import { CloseIcon } from '~src/ui-components/CustomIcons';
import DelegationDashboardEmptyState from '~assets/icons/delegation-empty-state.svg';
import getEncodedAddress from '~src/util/getEncodedAddress';
import PaLogo from './PaLogo';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { logout } from '~src/redux/userDetails';
import { useTheme } from 'next-themes';
import { Dropdown } from '~src/ui-components/Dropdown';
import ToggleButton from '~src/ui-components/ToggleButton';
import BigToggleButton from '~src/ui-components/ToggleButton/BigToggleButton';

const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});
const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];
const Menu = styled(AntdMenu)`
	.ant-menu-sub.ant-menu-inline {
		background: ${(props) => {
			return props.theme === 'dark' ? '#0D0D0D' : '#fff';
		}} !important;
	}

	.ant-menu-item-selected {
		background: ${(props) => (props.theme === 'dark' ? 'none' : '#fff')} !important;
		.ant-menu-title-content {
			color: var(--pink_primary) !important;
		}
	}
`;

function getSiderMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
	label = <span className='font-medium text-lightBlue  dark:text-icon-dark-inactive'>{label}</span>;
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
					className='flex items-center gap-x-2 font-medium text-lightBlue  hover:text-pink_primary dark:text-icon-dark-inactive'
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
					className='flex items-center gap-x-2 font-medium text-lightBlue  hover:text-pink_primary dark:text-icon-dark-inactive'
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
					className='flex items-center gap-x-2 font-medium text-lightBlue  hover:text-pink_primary dark:text-icon-dark-inactive'
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
					className={`-ml-1 flex items-center gap-x-2 font-medium text-lightBlue  hover:text-pink_primary dark:text-icon-dark-inactive ${className}`}
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

	const AuthDropdown = ({ children }: { children: ReactNode }) => {
		const { resolvedTheme: theme } = useTheme();
		return (
			<Dropdown
				theme={theme}
				menu={{ items: dropdownMenuItems }}
				trigger={['click']}
				className='profile-dropdown'
				overlayClassName='z-[1056]'
			>
				{children}
			</Dropdown>
		);
	};

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
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { username, picture, loginAddress } = useUserDetailsSelector();
	const [sidedrawer, setSidedrawer] = useState<boolean>(false);
	const router = useRouter();
	const [previousRoute, setPreviousRoute] = useState(router.asPath);
	const [open, setOpen] = useState<boolean>(false);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [identityMobileModal, setIdentityMobileModal] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(true);
	const [isGood, setIsGood] = useState<boolean>(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const dispatch = useDispatch();

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
			dispatch(logout());
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
			getSiderMenuItem('Overview', '/', <OverviewIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-3 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		],
		democracyItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Proposals', '/proposals', <DemocracyProposalsIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Referenda', '/referenda', <ReferendaIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		councilItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Motions', '/motions', <MotionsIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/council', <MembersIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		treasuryItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Proposals', '/treasury-proposals', <TreasuryProposalsIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Tips', '/tips', <TipsIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		techCommItems: chainProperties[network]?.subsquidUrl
			? [getSiderMenuItem('Proposals', '/tech-comm-proposals', <TechComProposalIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)]
			: [],
		allianceItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Announcements', '/alliance/announcements', <NewsIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Motions', '/alliance/motions', <MotionsIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/alliance/members', <MembersIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		PIPsItems:
			chainProperties[network]?.subsquidUrl && network === 'polymesh'
				? [
						getSiderMenuItem('Technical Committee', '/technical', <RootIcon className='mt-1.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
						getSiderMenuItem('Upgrade Committee', '/upgrade', <UpgradeCommitteePIPsIcon className='mt-1.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
						getSiderMenuItem('Community', '/community', <CommunityPIPsIcon className='mt-1.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
				  ]
				: []
	};
	if (isGrantsSupported(network)) {
		gov1Items['overviewItems'].splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
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
					? ![AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)
						? [...gov1Items.treasuryItems]
						: network === AllNetworks.MOONBEAM
						? [
								...[
									getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
									getSiderMenuItem('Child Bounties', '/child_bounties', <ChildBountiesIcon className='ml-0.5 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />)
								]
						  ]
						: [
								...gov1Items.treasuryItems,
								getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
								getSiderMenuItem('Child Bounties', '/child_bounties', <ChildBountiesIcon className='ml-0.5 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />)
						  ]
					: [
							...gov1Items.treasuryItems,
							getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
							getSiderMenuItem('Child Bounties', '/child_bounties', <ChildBountiesIcon className='ml-0.5 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />)
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
			getSiderMenuItem(
				<span className='ml-2 cursor-text text-xs font-medium uppercase text-lightBlue  hover:text-navBlue dark:text-icon-dark-inactive'>PIPs</span>,
				'pipsHeading',
				null
			),
			...gov1Items.PIPsItems
		);
		collapsedItems = collapsedItems.concat([...gov1Items.PIPsItems]);
	}

	if (network === AllNetworks.COLLECTIVES) {
		const fellowshipItems = [
			getSiderMenuItem('Members', '/fellowship', <MembersIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Member Referenda', '/member-referenda', <FellowshipGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
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
					const icon =
						trackName === PostOrigin.ROOT ? (
							<RootIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<AuctionAdminIcon className='mt-[1px] font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : (
							<StakingAdminIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />
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
		getSiderMenuItem('Overview', '/opengov', <OverviewIcon className='mt-1 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-2.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
	];

	if (['kusama', 'polkadot'].includes(network)) {
		gov2OverviewItems.splice(3, 0, getSiderMenuItem('Delegation', '/delegation', <DelegatedIcon className='mt-1.5 font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
	}
	if (isGrantsSupported(network)) {
		gov2OverviewItems.splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
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
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.governanceItems
		]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 font-medium text-lightBlue dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.fellowshipItems
		])
	];

	let gov2CollapsedItems: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.governanceItems
		]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 font-medium text-lightBlue dark:text-icon-dark-inactive' />, [
			...gov2TrackItems.fellowshipItems
		])
	];

	if (isFellowshipSupported(network)) {
		gov2Items.splice(
			gov2Items.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER].includes(network)) {
		if (network !== 'picasso') {
			let items = [...gov2TrackItems.treasuryItems];
			if (isOpenGovSupported(network)) {
				items = items.concat(getSiderMenuItem('Bounties', '/bounties', null), getSiderMenuItem('Child Bounties', '/child_bounties', null));
			}
			gov2Items.splice(
				-1,
				0,
				getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
			);
		} else {
			gov2Items.splice(gov2Items.length - 2, 1);
		}
	}

	if (isFellowshipSupported(network)) {
		gov2CollapsedItems.splice(
			gov2CollapsedItems.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER].includes(network)) {
		if (network !== 'picasso') {
			gov2CollapsedItems.splice(
				-1,
				0,
				getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
					...gov2TrackItems.treasuryItems
				])
			);
		} else {
			gov2CollapsedItems.splice(gov2CollapsedItems.length - 2, 1);
		}
	}

	const handleMenuClick = (menuItem: any) => {
		if (['userMenu', 'tracksHeading', 'pipsHeading'].includes(menuItem.key)) return;
		router.push(menuItem.key);
		// setSidedrawer(false);
	};
	const handleLogout = async (username: string) => {
		dispatch(logout());
		if (!router.query?.username) return;
		if (router.query?.username.includes(username)) {
			router.push(isOpenGovSupported(network) ? '/opengov' : '/');
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
	if (network === AllNetworks.MOONBEAM) {
		gov2Items = gov2Items.concat(
			getSiderMenuItem('Treasury', 'gov1_treasury_group', <TreasuryGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		);
		gov2CollapsedItems = [
			...gov2CollapsedItems,
			getSiderMenuItem('Treasury', 'treasury_group', <TreasuryGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		];
	}

	if (network !== AllNetworks.POLYMESH) {
		gov2Items = [...gov2Items, getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])];
		gov2CollapsedItems = [...gov2CollapsedItems, getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)];
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
				theme={theme}
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
					className={'sidebar fixed bottom-0 left-0 z-[1005] hidden h-screen overflow-y-hidden bg-white dark:bg-section-dark-overlay lg:block'}
				>
					<div className='flex h-full flex-col justify-between'>
						<Menu
							theme={theme}
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
					// footer={<BigToggleButton />}
				>
					<div
						className='flex h-full flex-col justify-between'
						onMouseLeave={() => setSidedrawer(false)}
					>
						<Menu
							theme={theme}
							mode='inline'
							selectedKeys={[router.pathname]}
							defaultOpenKeys={['democracy_group', 'treasury_group', 'council_group', 'tech_comm_group', 'alliance_group']}
							items={sidebarItems}
							onClick={handleMenuClick}
							className={`${username ? 'auth-sider-menu' : ''} dark:bg-section-dark-overlay`}
						/>
						<BigToggleButton />
					</div>
				</Drawer>
				{[AllNetworks.MOONBEAM, AllNetworks.MOONRIVER].includes(network) && ['/', 'opengov', '/gov-2'].includes(router.asPath) ? (
					<Layout className='min-h-[calc(100vh - 10rem)] bg-[#F5F6F8] dark:bg-section-dark-background'>
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
			{onchainIdentitySupportedNetwork.includes(network) && (
				<OnChainIdentity
					open={open}
					setOpen={setOpen}
					openAddressLinkedModal={openAddressLinkedModal}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				/>
			)}

			<Footer theme={theme} />
			<Modal
				zIndex={100}
				open={identityMobileModal}
				footer={false}
				closeIcon={<CloseIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />}
				onCancel={() => setIdentityMobileModal(false)}
				className={`${poppins.className} ${poppins.variable} w-[600px] max-sm:w-full`}
				title={<span className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#E1E6EB] px-6 pb-3 text-xl font-semibold'>On-chain identity</span>}
				wrapClassName='dark:bg-modalOverlayDark'
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
	}
	.mobile-margin {
		margin-top: 60px !important;
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
	li .ant-menu-item-only-child {
		padding-left: 58px !important;
		margin-block: 0px !important;
	}
	.ant-menu .ant-menu-submenu-arrow {
		color: var(--lightBlue) !important;
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
	.open-sider .ant-menu-item {
		display: flex;
		margin-block: 2px !important;
	}
	.menu-container {
		top: 0px;
	}
	.ant-menu-submenu-title {
		margin-block: 2px !important;
	}

	.ant-menu-inline-collapsed-noicon {
		color: ${(props) => (props.theme == 'dark' ? '#909090' : '#485F7D')};
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
	.ant-drawer .ant-drawer-footer {
		border: none !important;
	}
`;
