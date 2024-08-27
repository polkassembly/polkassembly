// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Layout, Menu as AntdMenu, MenuProps, Tooltip } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import {
	AuctionAdminIcon,
	BountiesIcon,
	DemocracyProposalsIcon,
	DiscussionsIcon,
	FellowshipIconNew,
	GovernanceIconNew,
	MembersIcon,
	MotionsIcon,
	NewsIcon,
	OverviewIcon,
	ParachainsIcon,
	PreimagesIcon,
	ReferendaIcon,
	StakingAdminIcon,
	TipsIcon,
	TreasuryIconNew,
	TreasuryProposalsIcon,
	ChildBountiesIcon,
	TechComProposalIcon,
	RootIcon,
	WishForChangeIcon,
	UpgradeCommitteePIPsIcon,
	CommunityPIPsIcon,
	ArchivedIcon,
	RoundedDollarIcon,
	SelectedOverview,
	SelectedRoot,
	SelectedAll,
	AllPostIcon,
	SelectedWishForChange,
	SelectedAuctionAdmin,
	SelectedStakingAdmin,
	SelectedGovernance,
	SelectedWhitelist,
	SelectedTreasury,
	SelectedDiscussions,
	SelectedPreimages,
	SelectedBountiesIcon
} from 'src/ui-components/CustomIcons';
import styled from 'styled-components';
import { isFellowshipSupported } from '~src/global/fellowshipNetworks';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { IActiveProposalCount, PostOrigin } from '~src/types';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import { poppins } from 'pages/_app';
import PaLogo from './PaLogo';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { logout } from '~src/redux/userDetails';
import { useTheme } from 'next-themes';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import { getSpanStyle } from '~src/ui-components/TopicTag';
import getUserDropDown, { MenuItem } from './menuUtils';
import { trackEvent } from 'analytics';

const { Sider } = Layout;

interface SidebarProps {
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (collapsed: boolean) => void;
	className?: string;
	totalActiveProposalsCount: IActiveProposalCount;
	isGood: boolean;
	mainDisplay: string;
	isIdentitySet: boolean;
	isIdentityUnverified: boolean;
	sidedrawer: boolean;
	setOpenAddressLinkedModal: (open: boolean) => void;
	setIdentityMobileModal: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	className,
	sidebarCollapsed,
	setSidebarCollapsed,
	totalActiveProposalsCount,
	isGood,
	mainDisplay,
	isIdentitySet,
	setIdentityMobileModal,
	sidedrawer,
	isIdentityUnverified,
	setOpenAddressLinkedModal
}) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { username, picture, loginAddress } = currentUser;
	const router = useRouter();
	const [open, setOpen] = useState<boolean>(false);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const [activeGovernance, setActiveGovernance] = useState(false);
	const [activeTreasury, setActiveTreasury] = useState(false);
	const [activeWhitelist, setActiveWhitelist] = useState(false);
	const [activeParachain, setActiveParachain] = useState(false);
	const [governanceDropdownOpen, setGovernanceDropdownOpen] = useState(false);
	const [treasuryDropdownOpen, setTreasuryDropdownOpen] = useState(false);
	const [whitelistDropdownOpen, setWhitelistDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const treasuryDropdownRef = useRef<HTMLDivElement>(null);
	const whitelistDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) ||
				(treasuryDropdownRef.current && !treasuryDropdownRef.current.contains(event.target as Node)) ||
				(whitelistDropdownRef.current && !whitelistDropdownRef.current.contains(event.target as Node))
			) {
				setGovernanceDropdownOpen(false);
				setTreasuryDropdownOpen(false);
				setWhitelistDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [governanceDropdownOpen, treasuryDropdownOpen, whitelistDropdownOpen]);

	useEffect(() => {
		const currentPath = router.pathname;
		const isActive = gov2TrackItems.governanceItems.some((item) => item?.key === currentPath);
		const isTreasuryActive = gov2TrackItems.treasuryItems.some((item) => item?.key === currentPath);
		const isWhitelistActive = gov2TrackItems.fellowshipItems.some((item) => item?.key === currentPath);
		const isParachainActive = currentPath.includes('parachains');
		console.log('Active governance state:', isActive);
		console.log('Active treasury state:', isTreasuryActive);
		console.log('Active whitelist state:', isWhitelistActive);
		console.log('Active parachain state:', isParachainActive);

		setActiveGovernance(isActive);
		setActiveTreasury(isTreasuryActive);
		setActiveWhitelist(isWhitelistActive);
		setActiveParachain(isParachainActive);
	}, [router.pathname]);

	function getSiderMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
		label = <span className={`w-5 text-xs font-medium ${sidebarCollapsed ? 'text-white' : 'text-lightBlue'}  `}>{label}</span>;
		return {
			children,
			icon,
			key,
			label,
			type: ['tracksHeading', 'pipsHeading'].includes(key as string) ? 'group' : ''
		} as MenuItem;
	}
	const Menu = styled(AntdMenu)<MenuProps>`
		.ant-menu-sub.ant-menu-inline {
			background: ${(props: any) => {
				/* eslint-disable react/prop-types */
				return props?.theme === 'dark' ? '#0D0D0D' : '#fff';
			}} !important;
		}
		.ant-menu-item {
			${sidebarCollapsed && 'width: 50%;'};
			padding: 1px 22px 1px 18px;
		}

		.ant-menu-item-selected {
			background: ${(props: any) => (props?.theme === 'dark' ? '#540E33' : '#FFF2F9')} !important;
		}
	`;

	const handleMenuClick = (menuItem: any) => {
		if (['userMenu'].includes(menuItem.key)) return;
		router.push(menuItem.key);
	};

	const handleLogout = async (username: string) => {
		dispatch(logout());
		if (!router.query?.username) return;
		if (router.query?.username.includes(username)) {
			router.push(isOpenGovSupported(network) ? '/opengov' : '/');
		}
	};
	const handleRemoveIdentity = () => {
		if (loginAddress) {
			dispatch(setOpenRemoveIdentityModal(true));
		} else {
			dispatch(setOpenRemoveIdentitySelectAddressModal(true));
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
	const gov1Items: { [x: string]: ItemType[] } = {
		AdvisoryCommittee:
			chainProperties[network]?.subsquidUrl && network === AllNetworks.ZEITGEIST
				? [
						getSiderMenuItem(
							<div className='flex items-center justify-between'>
								Motions
								<span
									className={`text-[10px] ${
										totalActiveProposalsCount?.advisoryCommitteeMotionsCount
											? getSpanStyle('AdvisoryCommitteeMotions', totalActiveProposalsCount['advisoryCommitteeMotionsCount'])
											: ''
									} rounded-lg px-2 py-1`}
								>
									{totalActiveProposalsCount?.advisoryCommitteeMotionsCount ? `${totalActiveProposalsCount['advisoryCommitteeMotionsCount']}` : ''}
								</span>
							</div>,
							'/advisory-committee/motions',
							<MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						),
						getSiderMenuItem('Members', '/advisory-committee/members', <MembersIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
				  ]
				: [],
		PIPsItems:
			chainProperties[network]?.subsquidUrl && network === AllNetworks.POLYMESH
				? [
						getSiderMenuItem(
							<div className='flex items-center justify-between'>
								Technical Committee
								<span
									className={`text-[10px] ${
										totalActiveProposalsCount?.technicalPipsCount ? getSpanStyle('TechnicalCommittee', totalActiveProposalsCount['technicalPipsCount']) : ''
									} rounded-lg px-2 py-1`}
								>
									{totalActiveProposalsCount?.technicalPipsCount ? `${totalActiveProposalsCount['technicalPipsCount']}` : ''}
								</span>
							</div>,
							'/technical',
							<>
								{router.pathname.includes('/root') || router.pathname.includes('/technical') ? (
									<SelectedRoot className='-ml-2 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
								) : (
									<RootIcon className='-ml-2  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
								)}
							</>
						),
						getSiderMenuItem(
							<div className='flex items-center justify-between'>
								Upgrade Committee
								<span
									className={`text-[10px] ${
										totalActiveProposalsCount?.upgradePipsCount ? getSpanStyle('UpgradeCommittee', totalActiveProposalsCount['upgradePipsCount']) : ''
									} rounded-lg px-2 py-1`}
								>
									{totalActiveProposalsCount?.upgradePipsCount ? `${totalActiveProposalsCount['upgradePipsCount']}` : ''}{' '}
								</span>
							</div>,
							'/upgrade',
							<UpgradeCommitteePIPsIcon className='-ml-2 mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						),
						getSiderMenuItem(
							<div className='flex items-center justify-between'>
								Community
								<span
									className={`text-[10px] ${
										totalActiveProposalsCount?.communityPipsCount ? getSpanStyle('Community', totalActiveProposalsCount['communityPipsCount']) : ''
									} rounded-lg px-2 py-1`}
								>
									{totalActiveProposalsCount?.communityPipsCount ? `${totalActiveProposalsCount['communityPipsCount']}` : ''}{' '}
								</span>
							</div>,
							'/community',
							<CommunityPIPsIcon className='-ml-2 mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						)
				  ]
				: [],
		allianceItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Announcements', '/alliance/announcements', <NewsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Motions
							<span
								className={`text-[10px] ${
									totalActiveProposalsCount?.allianceMotionsCount ? getSpanStyle('Motions', totalActiveProposalsCount['allianceMotionsCount']) : ''
								} rounded-lg px-2 py-1`}
							>
								{totalActiveProposalsCount?.allianceMotionsCount ? `${totalActiveProposalsCount['allianceMotionsCount']}` : ''}
							</span>
						</div>,
						'/alliance/motions',
						<MotionsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className=' -ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/alliance/members', <MembersIcon className=' -ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		councilItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Motions
							<span
								className={`text-[10px] ${
									totalActiveProposalsCount?.councilMotionsCount ? getSpanStyle('Council', totalActiveProposalsCount['councilMotionsCount']) : ''
								} rounded-lg px-2 py-1`}
							>
								{totalActiveProposalsCount?.councilMotionsCount ? `${totalActiveProposalsCount['councilMotionsCount']}` : ''}
							</span>
						</div>,
						'/motions',
						<MotionsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem('Members', '/council', <MembersIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],

		democracyItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Proposals
							<span
								className={`text-[10px] ${
									totalActiveProposalsCount?.democracyProposalsCount ? getSpanStyle('Democracy', totalActiveProposalsCount['democracyProposalsCount']) : ''
								} rounded-lg px-2 py-1`}
							>
								{totalActiveProposalsCount?.democracyProposalsCount ? `${totalActiveProposalsCount['democracyProposalsCount']}` : ''}
							</span>
						</div>,
						'/proposals',
						<DemocracyProposalsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Referenda
							<span
								className={`text-[10px] ${
									totalActiveProposalsCount?.referendumsCount ? getSpanStyle('Referendum', totalActiveProposalsCount['referendumsCount']) : ''
								} rounded-lg px-2 py-1`}
							>
								{totalActiveProposalsCount?.referendumsCount ? `${totalActiveProposalsCount['referendumsCount']}` : ''}
							</span>
						</div>,
						'/referenda',
						<ReferendaIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
			  ]
			: [],

		overviewItems: [
			!isMobile ? getSiderMenuItem('', '', null) : null,
			getSiderMenuItem(
				'Overview',
				'/',
				<>
					{' '}
					{router.pathname === '/' || router.pathname === '/opengov' ? (
						<SelectedOverview className='-ml-2  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					) : (
						<OverviewIcon className='-ml-2 mt-[2px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					)}
				</>
			),
			getSiderMenuItem(
				'Discussions',
				'/discussions',
				<>
					{router.pathname === '/discussions' ? (
						<SelectedDiscussions className='-ml-[10px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					) : (
						<DiscussionsIcon className='-ml-2  mt-1  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					)}
				</>
			)
		],

		techCommItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Proposals
							<span
								className={`text-[10px] ${
									totalActiveProposalsCount?.techCommetteeProposalsCount ? getSpanStyle('Technical', totalActiveProposalsCount['techCommetteeProposalsCount']) : ''
								} rounded-lg px-2 py-1`}
							>
								{totalActiveProposalsCount?.techCommetteeProposalsCount ? `${totalActiveProposalsCount['techCommetteeProposalsCount']}` : ''}
							</span>
						</div>,
						'/tech-comm-proposals',
						<TechComProposalIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
			  ]
			: [],

		treasuryItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Proposals
							<span
								className={`text-[10px] ${
									totalActiveProposalsCount?.treasuryProposalsCount ? getSpanStyle('Treasury', totalActiveProposalsCount['treasuryProposalsCount']) : ''
								} rounded-lg px-2 py-1`}
							>
								{totalActiveProposalsCount?.treasuryProposalsCount ? `${totalActiveProposalsCount['treasuryProposalsCount']}` : ''}
							</span>
						</div>,
						'/treasury-proposals',
						<TreasuryProposalsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Tips
							<span className={`text-[10px] ${totalActiveProposalsCount?.tips ? getSpanStyle('Tips', totalActiveProposalsCount['tips']) : ''} rounded-lg px-2 py-1`}>
								{totalActiveProposalsCount?.tips ? `${totalActiveProposalsCount['tips']}` : ''}
							</span>
						</div>,
						'/tips',
						<TipsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
			  ]
			: []
	};
	if (isGrantsSupported(network)) {
		gov1Items['overviewItems'].splice(
			3,
			0,
			getSiderMenuItem('Grants', '/grants', <BountiesIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		);
	}

	let items: MenuProps['items'] = isOpenGovSupported(network) ? [] : [...gov1Items.overviewItems];

	if (chainProperties[network]?.subsquidUrl && network !== AllNetworks.POLYMESH) {
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
										getSiderMenuItem(
											<div className='flex items-center justify-between'>
												Bounties
												<span
													className={`text-[10px] ${
														totalActiveProposalsCount?.['bountiesCount'] ? getSpanStyle('Bounties', totalActiveProposalsCount['bountiesCount']) : ''
													} rounded-lg px-2 py-1`}
												>
													{totalActiveProposalsCount?.['bountiesCount'] ? `${totalActiveProposalsCount['bountiesCount']}` : ''}
												</span>
											</div>,
											'/bounties',
											<BountiesIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
										),
										getSiderMenuItem(
											<div className='flex items-center justify-between'>
												Child Bounties
												<span
													className={`text-[10px] ${
														totalActiveProposalsCount?.['childBountiesCount'] ? getSpanStyle('ChildBounties', totalActiveProposalsCount['childBountiesCount']) : ''
													} rounded-lg px-2 py-1`}
												>
													{totalActiveProposalsCount?.['childBountiesCount'] ? `${totalActiveProposalsCount['childBountiesCount']}` : ''}
												</span>
											</div>,
											'/child_bounties',
											<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
										)
									]
							  ]
							: [
									...gov1Items.treasuryItems,
									getSiderMenuItem(
										<div className='flex items-center justify-between'>
											Bounties
											<span
												className={`text-[10px] ${
													totalActiveProposalsCount?.['bountiesCount'] ? getSpanStyle('Bounties', totalActiveProposalsCount['bountiesCount']) : ''
												} rounded-lg px-2 py-1`}
											>
												{totalActiveProposalsCount?.['bountiesCount'] ? `${totalActiveProposalsCount['bountiesCount']}` : ''}
											</span>
										</div>,
										'/bounties',
										<BountiesIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
									),
									getSiderMenuItem(
										<div className='flex items-center justify-center'>
											Child Bounties
											<span
												className={`text-[10px] ${
													totalActiveProposalsCount?.['childBountiesCount'] ? getSpanStyle('ChildBounties', totalActiveProposalsCount['childBountiesCount']) : ''
												} rounded-lg px-2 py-1`}
											>
												{totalActiveProposalsCount?.['childBountiesCount'] ? `${totalActiveProposalsCount['childBountiesCount']}` : ''}
											</span>
										</div>,
										'/child_bounties',
										<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
									)
							  ]
						: [AllNetworks.POLIMEC, AllNetworks.ROLIMEC].includes(network)
						? [...gov1Items.treasuryItems.slice(0, 1)]
						: [
								...gov1Items.treasuryItems,
								getSiderMenuItem(
									<div className='flex items-center justify-between'>
										Bounties
										<span
											className={`text-[10px] ${
												totalActiveProposalsCount?.['bountiesCount'] ? getSpanStyle('Bounties', totalActiveProposalsCount['bountiesCount']) : ''
											} rounded-lg px-2 py-1`}
										>
											{totalActiveProposalsCount?.['bountiesCount'] ? `${totalActiveProposalsCount['bountiesCount']}` : ''}
										</span>
									</div>,
									'/bounties',
									<BountiesIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
								),
								getSiderMenuItem(
									<div className='flex items-center justify-between'>
										Child Bounties
										<span
											className={`text-[10px] ${
												totalActiveProposalsCount?.['childBountiesCount'] ? getSpanStyle('ChildBounties', totalActiveProposalsCount['childBountiesCount']) : ''
											} rounded-lg px-2 py-1`}
										>
											{totalActiveProposalsCount?.['childBountiesCount'] ? `${totalActiveProposalsCount['childBountiesCount']}` : ''}
										</span>
									</div>,
									'/child_bounties',
									<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
								)
						  ]
				),

				getSiderMenuItem('Council', 'council_group', null, [...gov1Items.councilItems]),

				getSiderMenuItem('Tech. Comm.', 'tech_comm_group', null, [...gov1Items.techCommItems])
			]);
		}
	}

	let collapsedItems: MenuProps['items'] = isOpenGovSupported(network) ? [] : [...gov1Items.overviewItems];

	if (chainProperties[network]?.subsquidUrl && network !== AllNetworks.POLYMESH) {
		collapsedItems = collapsedItems.concat([...gov1Items.democracyItems, ...gov1Items.treasuryItems, ...gov1Items.councilItems, ...gov1Items.techCommItems]);
	}
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
			getSiderMenuItem('Members', '/fellowship', <MembersIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Member Referenda', '/member-referenda', <FellowshipIconNew className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
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
		fellowshipItems: [getSiderMenuItem('Members', '/members')],
		governanceItems: [],
		mainItems: [],
		treasuryItems: []
	};

	if (isFellowshipSupported(network)) {
		gov2TrackItems?.fellowshipItems?.splice(0, 1, getSiderMenuItem('Members', '/fellowship'), getSiderMenuItem('Member Referenda', '/member-referenda'));
	}

	if (network && networkTrackInfo[network]) {
		gov2TrackItems.mainItems.push(
			getSiderMenuItem(
				<div className='flex items-center justify-between py-1'>
					<span className='pt-1'>All</span>

					{!sidebarCollapsed && (
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.allCount ? getSpanStyle('All', totalActiveProposalsCount.allCount) : ''
							} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.allCount ? `${totalActiveProposalsCount.allCount}` : ''}
						</span>
					)}
				</div>,
				'/all-posts',
				<div className='relative'>
					{router.pathname.includes('/all-posts') ? (
						<SelectedAll className='-ml-[10px] scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
					) : (
						<AllPostIcon className='-ml-3 mt-1 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					)}
					<div
						className={`absolute -right-2 -top-2 z-50 ${
							router.pathname.includes('/all-posts') ? 'mt-5' : 'mt-7'
						} rounded-[9px] px-[2px]  text-[10px] font-semibold text-white md:-right-[6px] md:-top-6`}
						style={{
							opacity: sidebarCollapsed ? 1 : 0,
							transition: 'opacity 0.3s ease-in-out'
						}}
					>
						<span
							className={`text-[9px] ${
								totalActiveProposalsCount?.allCount ? getSpanStyle('All', totalActiveProposalsCount.allCount) : ''
							}  rounded-md px-1 py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.allCount ? `${totalActiveProposalsCount.allCount}` : ''}
						</span>
					</div>
				</div>
			)
		);
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			if (!networkTrackInfo[network][trackName] || !('group' in networkTrackInfo[network][trackName])) continue;

			const activeProposal = totalActiveProposalsCount?.[networkTrackInfo[network][trackName]?.trackId];

			const menuItem = getSiderMenuItem(
				<div className='flex justify-between'>
					{trackName.split(/(?=[A-Z])/).join(' ')}
					<span
						className={`text-[10px] ${
							activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
						} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
					>
						{activeProposal && activeProposal >= 1 ? `${activeProposal}` : ''}
					</span>{' '}
				</div>,
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
							<div className='flex  justify-between'>
								{trackName.split(/(?=[A-Z])/).join(' ')}
								<span
									className={`text-[10px] ${
										activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
									} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
								>
									{activeProposal && activeProposal >= 1 ? `${activeProposal}` : ''}
								</span>{' '}
							</div>,
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
							<div className='flex justify-between'>
								{trackName.split(/(?=[A-Z])/).join(' ')}
								{!sidebarCollapsed && (
									<span
										className={`text-[10px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
									>
										{activeProposal && activeProposal >= 1 ? `${activeProposal}` : ''}
									</span>
								)}
							</div>,
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
							<>
								{router.pathname.includes('/root') ? (
									<SelectedRoot className='-ml-1 mt-[10px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
								) : (
									<RootIcon className=' mt-1.5 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
								)}
							</>
						) : trackName === PostOrigin.ROOT ? (
							<>
								{router.pathname.includes('/root') ? (
									<SelectedRoot className='-ml-[10px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
								) : (
									<RootIcon className='-ml-3 mt-1.5 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive lg:-ml-2' />
								)}
							</>
						) : trackName === PostOrigin.WISH_FOR_CHANGE ? (
							<>
								{router.pathname.includes('/wish-for-change') ? (
									<SelectedWishForChange className={`-ml-[10px] ${sidebarCollapsed ? 'mt-1' : ''}  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive`} />
								) : (
									<WishForChangeIcon className='-ml-3 mt-[1px] scale-90 font-medium  text-lightBlue dark:text-icon-dark-inactive lg:-ml-2' />
								)}
							</>
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<>
								{' '}
								{router.pathname.includes('/auction-admin') ? (
									<SelectedAuctionAdmin className='-ml-[10px] scale-90  text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
								) : (
									<AuctionAdminIcon className='-ml-3 mt-[1px] scale-90 font-medium  text-lightBlue dark:text-icon-dark-inactive lg:-ml-1' />
								)}
							</>
						) : (
							<>
								{' '}
								{router.pathname.includes('/staking-admin') ? (
									<SelectedStakingAdmin className='-ml-[10px] -mt-1 scale-90   text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
								) : (
									<StakingAdminIcon className='-ml-3 mt-[1px] scale-90 font-medium  text-lightBlue dark:text-icon-dark-inactive lg:-ml-2' />
								)}
							</>
						);

					gov2TrackItems.mainItems.push(
						getSiderMenuItem(
							<div className='flex justify-between'>
								<span className='pt-1'>{trackName.split(/(?=[A-Z])/).join(' ')}</span>
								{!sidebarCollapsed && (
									<span
										className={`text-[10px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} rounded-lg px-[7px] py-1 text-[#96A4B6] dark:text-[#595959]`}
									>
										{activeProposal && activeProposal >= 1 ? `${activeProposal}` : ''}
									</span>
								)}
							</div>,
							`/${trackName
								.split(/(?=[A-Z])/)
								.join('-')
								.toLowerCase()}`,
							<div className='relative'>
								{icon}
								<div
									className='absolute -right-2 -top-2 z-50 mt-7 rounded-[9px] px-[2px] py-1 text-[9px] font-semibold text-white md:-right-2 md:-top-7'
									style={{
										opacity: sidedrawer ? 0 : 1,
										transition: 'opacity 0.3s ease-in-out'
									}}
								>
									<span
										className={`text-[9px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} rounded-md px-[7px] py-1 text-[#96A4B6] dark:text-[#595959]`}
									>
										{activeProposal && activeProposal >= 1 ? `${activeProposal}` : ''}
									</span>
								</div>
							</div>
						)
					);
				}
			}
		}
	}

	if (['polkadot'].includes(network)) {
		gov2TrackItems.mainItems.push(
			getSiderMenuItem(
				<div className=' flex items-center '>
					Bounties
					<div className={`${poppins.className} ${poppins.variable} ml-2 rounded-[9px] bg-[#407bfe]  px-[6px] text-[10px] font-semibold text-white md:-right-6 md:-top-2`}>NEW</div>
				</div>,
				'/bounty',
				<div className={`relative  ${!sidedrawer && 'mt-2'}`}>
					{router.pathname.includes('/bounty') ? (
						<SelectedBountiesIcon className='-ml-[10px] scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
					) : (
						<RoundedDollarIcon className='-ml-3 scale-90  font-medium text-lightBlue dark:text-icon-dark-inactive lg:-ml-2' />
					)}
					<div
						className={' absolute -right-2  rounded-[9px] bg-[#407bfe] px-1 py-1 text-[9px] font-semibold text-white md:-right-2 md:-top-[4px]'}
						style={{
							opacity: sidedrawer ? 0 : 1,
							transition: 'opacity 0.3s ease-in-out'
						}}
					>
						NEW
					</div>
				</div>
			)
		);
	}

	const gov2OverviewItems = [
		!isMobile ? getSiderMenuItem('', '', null) : null,

		getSiderMenuItem(
			'Overview',
			'/opengov',
			<>
				{router.pathname === '/' || router.pathname === '/opengov' ? (
					<SelectedOverview className='-ml-2 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<OverviewIcon className='-ml-3 mt-1.5  scale-90  font-medium text-lightBlue dark:text-icon-dark-inactive lg:-ml-2' />
				)}
			</>
		),
		getSiderMenuItem(
			'Discussions',
			'/discussions',
			<>
				{router.pathname === '/discussions' ? (
					<SelectedDiscussions className='-ml-[10px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<DiscussionsIcon className='-ml-2  mt-1  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>
		),
		getSiderMenuItem(
			'Preimages',
			'/preimages',
			<>
				{router.pathname === '/preimages' ? (
					<SelectedPreimages className='-ml-[10px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<PreimagesIcon className='-ml-2  mt-1  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>
		),
		getSiderMenuItem(
			<div
				style={{
					borderTop: '2px dotted #ccc',
					paddingTop: '15px'
				}}
				className='flex items-center'
			>
				<span className='-ml-1 text-xs font-medium uppercase text-lightBlue  dark:text-icon-dark-inactive'>Tracks</span>
			</div>,
			'tracksHeading',
			null
		)
	];

	if (isGrantsSupported(network)) {
		gov2OverviewItems.splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
	}

	let gov2Items: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,
		getSiderMenuItem(
			'Governance',
			'gov2_governance_group',
			<>
				{activeGovernance ? (
					<SelectedGovernance className='-ml-2  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<GovernanceIconNew className='-ml-2  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>,
			[...gov2TrackItems.governanceItems]
		),
		getSiderMenuItem(
			'Whitelist',
			'gov2_fellowship_group',
			<div>
				{activeWhitelist ? (
					<SelectedWhitelist className='-ml-2  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<FellowshipIconNew className='-ml-2  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</div>,
			[...gov2TrackItems.fellowshipItems]
		)
	];

	const handleGovernanceClick = () => {
		setGovernanceDropdownOpen(!governanceDropdownOpen);
		setTreasuryDropdownOpen(false);
		setWhitelistDropdownOpen(false);
	};

	const handleTreasuryClick = () => {
		setTreasuryDropdownOpen(!treasuryDropdownOpen);
		setGovernanceDropdownOpen(false);
		setWhitelistDropdownOpen(false);
	};

	const handleWhitelistClick = () => {
		setWhitelistDropdownOpen(!whitelistDropdownOpen);
		setGovernanceDropdownOpen(false);
		setTreasuryDropdownOpen(false);
	};

	let gov2CollapsedItems: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,

		getSiderMenuItem(
			<Tooltip
				title='Governance'
				placement='left'
			>
				<div
					className='relative cursor-pointer'
					style={{ padding: '10%', marginRight: '-13px' }}
					onClick={handleGovernanceClick}
				>
					{activeGovernance ? (
						<SelectedGovernance className='-ml-8 w-20 scale-90 rounded-lg bg-[#FFF2F9] pt-2 text-2xl font-medium text-[#E5007A] dark:text-icon-dark-inactive' />
					) : (
						<GovernanceIconNew
							className={`-ml-8 mt-1 w-20  scale-90 font-medium ${
								activeGovernance ? ' -ml-7 w-20 rounded-lg bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue'
							}  text-2xl dark:text-icon-dark-inactive`}
						/>
					)}
				</div>
			</Tooltip>,
			'gov2_governance_group',
			null,
			[...gov2TrackItems.governanceItems]
		),

		getSiderMenuItem(
			<Tooltip
				title='Whitelist'
				placement='left'
			>
				<div
					onClick={handleWhitelistClick}
					className='relative cursor-pointer'
					style={{ padding: '10%', marginRight: '-13px' }}
				>
					{activeWhitelist ? (
						<SelectedWhitelist className='-ml-8 w-20 scale-90 rounded-lg bg-[#FFF2F9] pt-2 text-2xl font-medium text-[#E5007A] dark:text-icon-dark-inactive' />
					) : (
						<FellowshipIconNew
							className={`-ml-8 mt-1 w-20 scale-90 font-medium ${
								activeWhitelist ? 'rounded-lg bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue'
							} text-2xl dark:text-icon-dark-inactive`}
						/>
					)}
				</div>
			</Tooltip>,
			'gov2_fellowship_group',
			null,
			[...gov2TrackItems.fellowshipItems]
		),

		getSiderMenuItem(
			<Tooltip
				title='Parachains'
				placement='left'
			>
				<div
					className='-mb-[14px] -ml-10  w-[110px] '
					style={{
						borderTop: '2px dotted #ccc',
						paddingTop: '12px'
					}}
				>
					<Link href='/parachains'>
						<div
							className={`ml-14 flex w-10 cursor-pointer items-center justify-center rounded-lg  pt-3  hover:bg-[#000000] hover:bg-opacity-[4%] ${
								activeParachain ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive'
							}`}
						>
							<ParachainsIcon className=' scale-90 text-xl font-medium ' />
						</div>
					</Link>
				</div>
			</Tooltip>,
			'tracksHeading',
			<p className='m-0 p-0'></p>
		)
	];

	if (isFellowshipSupported(network)) {
		gov2Items.splice(
			gov2Items.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipIconNew className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO].includes(network)) {
		let items = [...gov2TrackItems.treasuryItems];
		if (isOpenGovSupported(network)) {
			items = items.concat(
				getSiderMenuItem(
					<div className='flex items-center  justify-between'>
						{network === 'polkadot' ? 'On-chainBounties' : 'Bounties'}
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.['bountiesCount'] && totalActiveProposalsCount['bountiesCount'] >= 1
									? getSpanStyle('bounties', totalActiveProposalsCount['bountiesCount'])
									: ''
							} rounded-lg px-2  py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.['bountiesCount'] ? `${totalActiveProposalsCount['bountiesCount']}` : ''}
						</span>
					</div>,
					'/bounties',
					null
				),
				getSiderMenuItem(
					<div className='flex items-center justify-between'>
						Child Bounties
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.['childBountiesCount'] && totalActiveProposalsCount['childBountiesCount'] >= 1
									? getSpanStyle('childBounties', totalActiveProposalsCount['childBountiesCount'])
									: ''
							} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.['childBountiesCount'] ? `${totalActiveProposalsCount['childBountiesCount']}` : ''}
						</span>
					</div>,
					'/child_bounties',
					null
				)
			);
		}
		gov2Items.splice(
			-1,
			0,
			getSiderMenuItem(
				'Treasury',
				'gov2_treasury_group',
				<div>
					{activeTreasury ? (
						<SelectedTreasury className='-ml-2 scale-90 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					) : (
						<TreasuryIconNew className='-ml-2 mt-1 scale-90 text-2xl font-medium dark:text-icon-dark-inactive' />
					)}
				</div>,
				[...items]
			)
		);
	}

	if (isFellowshipSupported(network)) {
		gov2CollapsedItems.splice(
			gov2CollapsedItems.length - 1,
			1,
			getSiderMenuItem(
				'Fellowship',
				'gov2_fellowship_group',
				<div>
					{' '}
					<FellowshipIconNew className=' scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
				</div>,
				[...gov2TrackItems.fellowshipItems]
			)
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO].includes(network)) {
		gov2CollapsedItems.splice(
			-1,
			0,
			getSiderMenuItem(
				<Tooltip
					title='Treasury'
					placement='left'
				>
					<div
						className='relative cursor-pointer'
						style={{ padding: '10%', marginRight: '-13px' }}
						onClick={handleTreasuryClick}
					>
						{activeTreasury ? (
							<SelectedTreasury className='-ml-8 w-20 scale-90 rounded-lg bg-[#FFF2F9] pt-2 text-2xl font-medium text-[#E5007A] dark:text-icon-dark-inactive' />
						) : (
							<TreasuryIconNew className='-ml-8 mt-1 w-20 scale-90  text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
						)}
					</div>
				</Tooltip>,
				'gov2_treasury_group',
				null,
				[...gov2TrackItems.treasuryItems]
			)
		);
	}

	const userDropdown = getUserDropDown({
		className: `${className} ${poppins.className} ${poppins.variable}`,
		handleLogout: handleLogout,
		handleRemoveIdentity: handleRemoveIdentity,
		handleSetIdentityClick: handleIdentityButtonClick,
		identityUsername: mainDisplay,
		img: picture,
		isGood: isGood,
		isIdentityExists: isIdentitySet,
		isIdentityUnverified: isIdentityUnverified,
		network: network,
		username: username || ''
	});

	const menuItems = [
		userDropdown,
		getSiderMenuItem(
			'Overview',
			'/',
			<>
				{router.pathname === '/' || router.pathname === '/opengov' ? (
					<SelectedOverview className='mt-1.5  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<OverviewIcon className='-ml-2 mt-1.5 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>
		),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='-ml-2 scale-90' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='scale-90' />),
		getSiderMenuItem('Treasury', '/treasury', <TreasuryIconNew className=' scale-90' />)
	];

	if (network === 'polkadot') {
		menuItems.push(
			getSiderMenuItem('Democracy', '/democracy', <DemocracyProposalsIcon className='scale-90' />),
			getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='scale-90' />),
			getSiderMenuItem('Motions', '/motions', <MotionsIcon className='-ml-2 scale-90' />)
		);
	} else if (network === 'kusama') {
		menuItems.push(
			getSiderMenuItem('Referenda', '/referenda', <ReferendaIcon className='scale-90' />),
			getSiderMenuItem('Tech. Comm.', '/tech-comm', <TechComProposalIcon className='scale-90' />)
		);
	}

	if (isOpenGovSupported(network)) {
		menuItems.push(
			getSiderMenuItem(
				'Governance',
				'/governance',
				<>
					{activeGovernance ? (
						<SelectedGovernance className='-ml-2 -mt-2 h-10 w-10 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
					) : (
						<GovernanceIconNew
							className={`-ml-7 w-20 scale-90  font-medium ${
								activeGovernance ? ' -ml-7 w-20 rounded-lg bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue'
							} text-2xl dark:text-icon-dark-inactive`}
						/>
					)}
				</>
			),
			getSiderMenuItem('Fellowship', '/fellowship', <FellowshipIconNew className='-ml-2 scale-90' />)
		);
	}
	if ([AllNetworks.MOONBEAM, AllNetworks.PICASSO].includes(network)) {
		gov2Items = gov2Items.concat(
			getSiderMenuItem('Treasury', 'gov1_treasury_group', <TreasuryIconNew className=' font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		);
		gov2CollapsedItems = [
			...gov2CollapsedItems,
			getSiderMenuItem(
				'Treasury',
				'treasury_group',
				<div>
					<TreasuryIconNew className='-ml-1 mt-1.5 scale-90 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />
				</div>,
				gov1Items.treasuryItems
			)
		];
	}

	if (![AllNetworks.POLYMESH].includes(network)) {
		if (AllNetworks.WESTEND.includes(network)) {
			gov2Items = [
				...gov2Items,
				getSiderMenuItem(
					<div
						className='-mb-2 flex items-center'
						style={{
							borderTop: '4px dotted #ccc',
							paddingTop: '12px'
						}}
					>
						<ParachainsIcon className='mt-3 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						<span className='ml-2 text-xs font-medium uppercase text-lightBlue hover:text-navBlue dark:text-icon-dark-inactive'>Parachains</span>
					</div>,
					'/parachains',
					null
				),
				getSiderMenuItem('Archived', '', <ArchivedIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
					getSiderMenuItem(
						'Treasury',
						'treasury_group',
						<TreasuryIconNew className=' scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />,
						gov1Items.treasuryItems.slice(0, 1)
					)
				])
			];
		} else {
			gov2Items = [
				...gov2Items,
				getSiderMenuItem(
					<div
						className='-mb-2 w-full '
						style={{
							borderTop: '2px dotted #ccc',
							paddingTop: '12px'
						}}
					>
						<Link href='/parachains'>
							<div className='-ml-3 flex cursor-pointer items-center rounded-lg pl-2 hover:bg-[#000000] hover:bg-opacity-[4%] lg:ml-0'>
								<ParachainsIcon className='mt-3 scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
								<span className='ml-2 hidden text-xs font-medium uppercase text-lightBlue dark:text-icon-dark-inactive  lg:block'>Parachains</span>
							</div>{' '}
						</Link>
					</div>,
					'tracksHeading',
					null
				),
				getSiderMenuItem('Archived', '', <ArchivedIcon className=' -ml-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
			];
		}
		gov2CollapsedItems = [
			...gov2CollapsedItems,
			getSiderMenuItem('Archived', '/archived', <ArchivedIcon className='-ml-2 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		];
	}

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isOpenGovSupported(network)) {
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (isMobile) {
		sidebarItems = [username && isMobile ? userDropdown : null, ...sidebarItems];
	}
	const isActive = (path: string) => router.pathname === path;
	function toPascalCase(str: string): string {
		return str.replace(/-/g, ' ').replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
	}

	return (
		<Sider
			trigger={null}
			collapsible
			collapsed={sidebarCollapsed}
			onCollapse={(collapsed) => {
				setSidebarCollapsed(collapsed);
			}}
			style={{ transform: 'translateX(0px)', transitionDuration: '0.3s' }}
			className={`sidebar fixed bottom-0 left-0 z-[101] h-screen pt-20 lg:pt-0 ${sidebarCollapsed ? 'min-w-[80px]' : 'min-w-[230px]'}  bg-white dark:bg-section-dark-overlay`}
		>
			<div className='flex h-full flex-col'>
				<div className='flex flex-col'>
					{sidebarCollapsed && governanceDropdownOpen && (
						<div
							ref={dropdownRef}
							className='absolute left-20 top-[300px] z-[1100] w-[180px] rounded-lg bg-white p-4 px-5 shadow-lg dark:bg-[#0D0D0D]'
						>
							<div className='text-center'>
								{gov2TrackItems.governanceItems.map((item, index) => {
									const formattedLabel = toPascalCase(item?.key?.toString().replace('/', '') as string);

									return (
										<p
											key={index}
											className='rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] dark:hover:bg-opacity-[8%]'
										>
											<Link
												href={item?.key as string}
												className='m-0 inline-block w-full p-0 text-left text-[#243A57] dark:text-[#FFFFFF]'
											>
												<span>{formattedLabel}</span>
											</Link>
										</p>
									);
								})}
							</div>
						</div>
					)}
					{sidebarCollapsed && whitelistDropdownOpen && (
						<div
							ref={whitelistDropdownRef}
							className='absolute left-20 top-[380px] z-[1100] w-[180px] rounded-lg bg-white p-4 px-3 shadow-lg dark:bg-[#0D0D0D]'
						>
							<ul className='text-center'>
								{gov2TrackItems.fellowshipItems.map((item, index) => {
									const formattedLabel = toPascalCase(item?.key?.toString().replace('/', '') as string);

									return (
										<p
											key={index}
											className='rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] dark:hover:bg-opacity-[8%]'
										>
											<Link
												href={item?.key as string}
												className='inline-block w-full text-left text-[#243A57] dark:text-[#FFFFFF]'
											>
												<span>{formattedLabel}</span>
											</Link>
										</p>
									);
								})}
							</ul>
						</div>
					)}

					{sidebarCollapsed && treasuryDropdownOpen && (
						<div
							ref={treasuryDropdownRef}
							className='absolute left-20 top-[380px] z-[1100] w-[190px] rounded-lg bg-white p-4 px-5 shadow-lg dark:bg-[#0D0D0D]'
						>
							<ul className='text-center'>
								{gov2TrackItems.treasuryItems.map((item, index) => {
									const formattedLabel = toPascalCase(item?.key?.toString().replace('/', '') as string);

									return (
										<p
											key={index}
											className='rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] dark:hover:bg-opacity-[8%]'
										>
											<Link
												href={item?.key as string}
												className='inline-block w-full text-left text-[#243A57] dark:text-[#FFFFFF]'
											>
												<span>{formattedLabel}</span>
											</Link>
										</p>
									);
								})}
							</ul>
						</div>
					)}

					<Menu
						theme={theme as any}
						mode='inline'
						selectedKeys={[router.pathname]}
						items={gov2Items.slice(0, 1)}
						className={`${username ? 'auth-sider-menu' : ''}   dark:bg-section-dark-overlay`}
					/>
					{!isMobile && (
						<>
							<div
								className={` ${
									sidedrawer ? '-ml-20 mt-2 w-[300px]' : 'mt-0'
								} svgLogo logo-container logo-display-block fixed mt-[2px] flex h-[70px] items-center justify-center bg-transparent`}
							>
								<div>
									<div className={`${sidedrawer ? 'ml-28' : 'ml-5'} h-full`}>
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
						</>
					)}
					{!sidebarCollapsed ? (
						<>
							<div className=' flex justify-center gap-2 md:mt-7'>
								<div className='activeborderhover group relative'>
									<Link
										href='/'
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
												userId: currentUser?.id || '',
												userName: currentUser?.username || ''
											});
											handleIdentityButtonClick();
										}}
									>
										<img
											src='/assets/head1.svg'
											alt='Head 1'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute   bottom-10 left-12 mb-2 hidden w-[90px] -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											On-chain identity
											<div className='absolute left-4 top-7 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>

								<div className={`activeborderhover group relative ${isActive('/leaderboard') ? '  activeborder  rounded-lg' : ''}`}>
									<Link href='/leaderboard'>
										<img
											src='/assets/head2.svg'
											alt='Head 2'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Leaderboard
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>

								<div className={`activeborderhover group relative ${isActive('/delegation where are you') ? '  activeborder  rounded-lg' : ''}`}>
									<Link href='/delegation'>
										<img
											src='/assets/head3.svg'
											alt='Head 3'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Delegation
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>

								<div className={`activeborderhover group relative ${isActive('/calendar') ? '  activeborder  rounded-lg' : ''}`}>
									<Link href='/calendar'>
										<img
											src='/assets/head4.svg'
											alt='Head 4'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute -left-4 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Calendar
											<div className='absolute left-16 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
							</div>
						</>
					) : (
						<>
							<div className=' ml-5 flex flex-col justify-center gap-2 md:mt-7'>
								<div className='activeborderhover group relative w-10 '>
									<Link
										href={''}
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
												userId: currentUser?.id || '',
												userName: currentUser?.username || ''
											});
											handleIdentityButtonClick();
										}}
									>
										<img
											src='/assets/head1.svg'
											alt='Head 1'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute -bottom-5 left-[87px] z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											On-chain identity
											<div className='absolute  right-11 top-[10px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className={`activeborderhover group relative w-10 ${isActive('/leaderboard') ? '  activeborder  rounded-lg' : ''}`}>
									<Link href='/leaderboard'>
										<img
											src='/assets/head2.svg'
											alt='Head 2'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute  bottom-0 left-[100px] z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Leaderboard
											<div className='absolute left-1 top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className={`activeborderhover group relative w-10 ${isActive('/delegation') ? '  activeborder  rounded-lg' : ''}`}>
									<Link href='/delegation'>
										<img
											src='/assets/head3.svg'
											alt='Head 3'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute  bottom-0 left-[100px] z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Delegation
											<div className='absolute left-1 top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className={`activeborderhover group relative w-10 ${isActive('/calendar') ? '  activeborder  rounded-lg' : ''}`}>
									<Link href='/calendar'>
										<img
											src='/assets/head4.svg'
											alt='Head 4'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute  bottom-0 left-[95px] z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Calendar
											<div className='absolute left-1 top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
							</div>
						</>
					)}
				</div>
				<div className={`hide-scrollbar  ${!sidebarCollapsed ? 'mt-2  h-[650px] overflow-y-auto pb-2' : 'mt-2 h-[420px] overflow-y-auto  pb-2 lg:h-[345px]'} `}>
					<Menu
						theme={theme as any}
						mode='inline'
						selectedKeys={[router.pathname]}
						items={sidebarItems.slice(1)}
						onClick={handleMenuClick}
						className={`${username ? 'auth-sider-menu' : ''} ${sidebarCollapsed && 'flex flex-col items-center    '}  ml-2 pr-2 dark:bg-section-dark-overlay`}
					/>
				</div>
				{!sidebarCollapsed ? (
					<>
						<div className='fixed bottom-0 left-0 w-full bg-white py-3 dark:bg-section-dark-overlay'>
							<div className='mt-5 flex items-center justify-center gap-2'>
								<div className='group relative'>
									<Link href='https://townhallgov.com/'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot1.svg' : '/assets/foot1.svg'}
											alt='Foot1'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Townhall
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://polkasafe.xyz/'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot2.svg' : '/assets/foot2.svg'}
											alt='Foot2'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Polkasafe
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://collectives.polkassembly.io/'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot3.svg' : '/assets/foot3.svg'}
											alt='Foot3'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Fellowship
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://staking.polkadot.cloud/#/overview'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot4.svg' : '/assets/foot4.svg'}
											alt='Foot4'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute -left-0 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Staking
											<div className='absolute left-14  top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						<div className='fixed bottom-0 left-0 z-[1000]  w-full bg-white py-3 dark:bg-section-dark-overlay'>
							<div className='mt-5 flex flex-col items-center justify-center gap-2'>
								<div className='group relative'>
									<Link href='https://townhallgov.com/'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot1.svg' : '/assets/foot1.svg'}
											alt='Foot1'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Townhall
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://polkasafe.xyz/'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot2.svg' : '/assets/foot2.svg'}
											alt='Foot2'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Polkasafe
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://collectives.polkassembly.io/'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot3.svg' : '/assets/foot3.svg'}
											alt='Foot3'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Fellowship
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://staking.polkadot.cloud/#/overview'>
										<img
											src={theme === 'dark' ? '/assets/darkfoot4.svg' : '/assets/foot4.svg'}
											alt='Foot4'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
											Staking
											<div className='absolute left-1/2  top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</Sider>
	);
};

export default Sidebar;
