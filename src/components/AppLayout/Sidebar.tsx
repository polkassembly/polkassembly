// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Layout, Menu as AntdMenu, MenuProps, Tooltip } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import {
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
	SelectedOverview,
	SelectedRoot,
	SelectedWishForChange,
	SelectedGovernance,
	SelectedWhitelist,
	SelectedTreasury,
	SelectedDiscussions,
	SelectedPreimages,
	AnalyticsSVGIcon,
	AllPostIcon,
	BatchVotingIcon
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
import getUserDropDown, { MenuItem, SidebarFoot1, SidebarFoot2 } from './menuUtils';
import { trackEvent } from 'analytics';
import { RightOutlined } from '@ant-design/icons';

import ImageIcon from '~src/ui-components/ImageIcon';
import Popover from '~src/basic-components/Popover';
import { onchainIdentitySupportedNetwork } from '.';
import { delegationSupportedNetworks } from '../Post/Tabs/PostStats/util/constants';
import Image from 'next/image';
import { GlobalActions } from '~src/redux/global';

const { Sider } = Layout;

interface SidebarProps {
	sidebarCollapsed: boolean;
	className?: string;
	totalActiveProposalsCount: IActiveProposalCount;
	isGood: boolean;
	mainDisplay: string;
	isIdentitySet: boolean;
	isIdentityUnverified: boolean;
	sidedrawer: boolean;
	setOpenAddressLinkedModal: (open: boolean) => void;
	setIdentityMobileModal: (open: boolean) => void;
	setSidedrawer: (open: boolean) => void;
	setLoginOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	className,
	sidebarCollapsed,
	totalActiveProposalsCount,
	isGood,
	mainDisplay,
	isIdentitySet,
	setSidedrawer,
	setIdentityMobileModal,
	sidedrawer,
	isIdentityUnverified,
	setOpenAddressLinkedModal,
	setLoginOpen
}) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { username, picture, loginAddress } = currentUser;
	const router = useRouter();
	const [open, setOpen] = useState<boolean>(false);
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const [activeGovernance, setActiveGovernance] = useState(false);
	const [activeTreasury, setActiveTreasury] = useState(false);
	const [activeWhitelist, setActiveWhitelist] = useState(false);
	const [activeParachain, setActiveParachain] = useState(false);
	const [governanceDropdownOpen, setGovernanceDropdownOpen] = useState(false);
	const [treasuryDropdownOpen, setTreasuryDropdownOpen] = useState(false);
	const [whitelistDropdownOpen, setWhitelistDropdownOpen] = useState(false);
	const [archivedDropdownOpen, setArchivedDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const treasuryDropdownRef = useRef<HTMLDivElement>(null);
	const whitelistDropdownRef = useRef<HTMLDivElement>(null);
	const archivedDropdownRef = useRef<HTMLDivElement>(null);
	const isActive = (path: string) => router.pathname === path;

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) ||
				(treasuryDropdownRef.current && !treasuryDropdownRef.current.contains(event.target as Node)) ||
				(whitelistDropdownRef.current && !whitelistDropdownRef.current.contains(event.target as Node)) ||
				(archivedDropdownRef.current && !archivedDropdownRef.current.contains(event.target as Node))
			) {
				setGovernanceDropdownOpen(false);
				setTreasuryDropdownOpen(false);
				setWhitelistDropdownOpen(false);
				setArchivedDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [governanceDropdownOpen, treasuryDropdownOpen, whitelistDropdownOpen, archivedDropdownOpen]);
	const [openKeys, setOpenKeys] = useState<string[]>([]);

	const onOpenChange = (keys: string[]) => {
		const filteredKeys = keys.filter((key) => key !== '');
		setOpenKeys(filteredKeys);

		if (!sidebarCollapsed) {
			localStorage.setItem('openKeys', JSON.stringify(filteredKeys));
		}
	};

	const handleSidebarToggle = () => {
		if (sidebarCollapsed) {
			setOpenKeys([]);
		} else {
			const storedKeys = JSON.parse(localStorage.getItem('openKeys') || '[]');
			setOpenKeys(storedKeys);
		}
	};
	useEffect(() => {
		handleSidebarToggle();
	}, [sidebarCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const currentPath = router.pathname;
		const isActive = gov2TrackItems.governanceItems.some((item) => item?.key === currentPath);
		const isTreasuryActive = gov2TrackItems.treasuryItems.some((item) => item?.key === currentPath);
		const isWhitelistActive = gov2TrackItems.fellowshipItems.some((item) => item?.key === currentPath);
		const isParachainActive = currentPath.includes('parachains');
		setActiveGovernance(isActive);
		setActiveTreasury(isTreasuryActive);
		setActiveWhitelist(isWhitelistActive);
		setActiveParachain(isParachainActive);
	}, [router.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

	function getSiderMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
		const capitalizeLabel = (label: React.ReactNode): React.ReactNode => {
			if (typeof label === 'string') {
				return label.charAt(0).toUpperCase() + label.slice(1);
			}
			return label;
		};

		const capitalizedLabel = capitalizeLabel(label);
		label = <span className={`w-5 text-xs font-medium dark:text-icon-dark-inactive ${sidebarCollapsed ? 'text-white ' : 'text-lightBlue'}`}>{capitalizedLabel}</span>;

		return {
			children,
			icon,
			key,
			label,
			type: ['tracksHeading', 'pipsHeading'].includes(key as string) ? 'group' : ''
		} as MenuItem;
	}

	/* eslint-disable react/prop-types */
	const Menu = styled(AntdMenu)<MenuProps & { sidebarCollapsed: boolean; sidedrawer: boolean }>`
		.ant-menu-sub.ant-menu-inline {
			background: ${(props: any) => (props?.theme === 'dark' ? '#0D0D0D' : '#fff')} !important;
		}

		.ant-menu-item-selected {
			background: ${(props: any) => (props?.theme === 'dark' ? '#530d32' : '#fce5f2')} !important;
		}

		.ant-menu-item {
			width: ${(props: any) => (props.sidebarCollapsed && !props.sidedrawer ? '50%' : '200px')};
			padding: ${(props: any) => (props.sidebarCollapsed && !props.sidedrawer ? '1px 22px 1px 18px' : '1px 12px 1px 18px !important')};
			margin: ${(props: any) => {
				if (isMobile) {
					return !props.sidebarCollapsed && props.sidedrawer && '5px 10px 5px 25px';
				} else {
					return props.sidebarCollapsed && !props.sidedrawer ? '3px 13px 3px 15px' : '3px 20px 3px 15px';
				}
			}};
		}

	.ant-menu-submenu-title {
  ${(props: any) =>
		!props.sidebarCollapsed && props.sidedrawer
			? isMobile
				? `
        padding-left: 18px !important;  /* Adjust mobile-specific values here */
        border-right-width: 15px;
        margin-right: 15px;
        top: 1px;
		width:205px;
        padding-right: 15px;
        margin-left: 15px;

      `
				: `
        padding-left: 16px !important; /* Adjust non-mobile values here */
        border-right-width: 20px;
        margin-right: 10px;
        top: 1px;
        right: 5px;
        padding-right: 20px;
        margin-left: 20px;
        width: 199px;
      `
			: ''}
}

		.ant-menu-submenu.ant-menu-submenu-inline > .ant-menu-submenu-title {
		  ${() => {
				if (isMobile) {
					return `padding-left: 16px !important;
			margin-left: 25px !important;`;
				} else {
					return `padding-left: 16px !important;
			margin-left: 20px !important;`;
				}
			}}
		.ant-menu-item .ant-menu-item-only-child {
			margin-left: 10px;
		}
		.sidebar-selected-icon {
			filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
		}
		.ant-menu-inline .ant-menu-sub.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title {
			${(props: any) =>
				!props.sidebarCollapsed && props.sidedrawer
					? `
        padding-left: 6px !important;
        border-right-width: 20px;
        margin-right: 10px;
        top: 1px;
        right: 5px;
        padding-right: 20px;
        margin-left: 20px;
        width: 199px;
      `
					: ''}
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
		if (isMobile) {
			dispatch(GlobalActions.setIsSidebarCollapsed(true));
			setSidedrawer(false);
		}
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
							<div className=' flex items-center justify-between'>
								Advisory Motions
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
							<MotionsIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						),
						getSiderMenuItem('Members', '/advisory-committee/members', <MembersIcon className='-ml-2 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
				  ]
				: [],
		PIPsItems:
			chainProperties[network]?.subsquidUrl && network === AllNetworks.POLYMESH
				? [
						getSiderMenuItem(
							<div className='flex  items-center justify-between'>
								<span className='mr-10'>Technical Comm..</span>
								<span
									className={`text-[10px] ${
										totalActiveProposalsCount?.technicalPipsCount ? getSpanStyle('TechnicalCommittee', totalActiveProposalsCount['technicalPipsCount']) : ''
									} absolute right-4 top-1   rounded-lg px-2 py-1`}
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
								Upgrade Comm..
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
						<OverviewIcon className='-ml-2  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
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
							Tech Comm Proposals
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
							Treasury Proposals
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
						? ![AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER, AllNetworks.LAOSSIGMA].includes(network)
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
													} rounded-lg px-[4px] py-1`}
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
										<div className='flex items-center justify-between text-lightBlue  hover:text-navBlue dark:text-icon-dark-inactive'>
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
										<div className='flex items-center justify-center text-lightBlue  hover:text-navBlue dark:text-icon-dark-inactive'>
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
						: [AllNetworks.POLIMEC, AllNetworks.ROLIMEC, AllNetworks.LAOSSIGMA].includes(network)
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
									<BountiesIcon className='-ml-2 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
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
									<ChildBountiesIcon className='-ml-2 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
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

	const advisorycommitteDropdownContent = (
		<div className='text-center'>
			{gov1Items.AdvisoryCommittee.map((item, index) => {
				console.log('item', item);
				const formattedLabel =
					item && 'label' in item && typeof item.key === 'string' && item.key.includes('/') ? item.key.split('/')[2] || '' : item && 'label' in item ? item.label : '';

				return (
					<p
						key={index}
						className={`rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] 
            			${isActive(item?.key as string) ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive'} `}
					>
						<Link
							href={item?.key as string}
							className={`inline-block w-full text-left ${isActive(item?.key as string) ? 'font-medium text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}
						>
							<span>{formattedLabel}</span>
						</Link>
					</p>
				);
			})}
		</div>
	);

	if (network === AllNetworks.ZEITGEIST) {
		items = [...items, getSiderMenuItem('Advisory Committee', 'advisory-committee', null, [...gov1Items.AdvisoryCommittee])];
		collapsedItems = [
			...collapsedItems,
			getSiderMenuItem(
				<Popover
					content={advisorycommitteDropdownContent}
					placement='right'
					arrow={false}
					trigger='click'
					overlayClassName='z-[1100] w-[190px] left-16'
				>
					<Tooltip
						title='Advisory Committee'
						placement='left'
						className='text-xs'
					>
						<div className='relative w-10 cursor-pointer px-1'>
							<CommunityPIPsIcon className='-ml-1 mt-1.5 scale-90  text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
						</div>
					</Tooltip>
				</Popover>,
				'advisory-committee',
				null,
				[...gov1Items.AdvisoryCommittee]
			)
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
							className={`text-[9px] ${
								totalActiveProposalsCount?.allCount ? getSpanStyle('All', totalActiveProposalsCount.allCount) : ''
							}  w-5 rounded-lg px-[5px] py-1 text-center font-poppins text-[#485F7D] text-opacity-[80%] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.allCount > 9 ? (
								<>
									9<span className='text-[8px]'>+</span>
								</>
							) : (
								totalActiveProposalsCount?.allCount || ''
							)}
						</span>
					)}
				</div>,
				'/all-posts',
				<div className='relative'>
					{router.pathname.includes('/all-posts') ? (
						<AllPostIcon
							className={`${
								sidebarCollapsed ? '  -ml-[10px] ' : '-ml-[8px] mt-1 '
							} sidebar-selected-icon scale-90  text-2xl  font-medium text-lightBlue dark:text-icon-dark-inactive`}
						/>
					) : (
						<ImageIcon
							src='/assets/allpost.svg'
							className={`absolute ${sidebarCollapsed ? '-top-7  -ml-[10px] mt-[3px]' : '-top-4 -ml-[10px] mt-[1px]'}  h-6  w-6 scale-90 text-2xl font-medium  ${
								theme === 'dark' ? 'dark-icons' : 'text-lightBlue'
							}`}
							alt=''
						/>
					)}
					<div
						className={`absolute -right-2 -top-2 z-50 ${
							router.pathname.includes('/all-posts') ? 'mt-5' : ''
						} rounded-[9px] px-[2px]  text-[10px] font-semibold text-white md:-right-[6px] md:-top-6`}
						style={{
							opacity: sidebarCollapsed ? 1 : 0,
							transition: 'opacity 0.3s ease-in-out'
						}}
					>
						<span
							className={`text-[9px] ${
								totalActiveProposalsCount?.allCount ? getSpanStyle('All', totalActiveProposalsCount.allCount) : ''
							}   rounded-md px-1 py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.allCount > 9 ? (
								<>
									9<span className='text-[8px]'>+</span>
								</>
							) : (
								<span className='px-[3px]'>{totalActiveProposalsCount?.allCount}</span>
							)}
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
					<span className='pt-[6px] text-lightBlue dark:text-icon-dark-inactive'> {trackName.split(/(?=[A-Z])/).join(' ')}</span>
					<span
						className={`text-[10px] ${
							activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
						} rounded-lg px-[7px] py-1 text-[#96A4B6] dark:text-[#595959]`}
					>
						{activeProposal && activeProposal > 9 ? (
							<>
								9<span className='text-[7px]'>+</span>
							</>
						) : (
							activeProposal || ''
						)}
					</span>
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
								<span className='pt-1 text-[12px] text-lightBlue dark:text-icon-dark-inactive'>{trackName.split(/(?=[A-Z])/).join(' ')}</span>
								<span
									className={`text-[10px] ${
										activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
									} w-5 rounded-lg px-[5px] py-1 text-center text-[#96A4B6] dark:text-[#595959]`}
								>
									{activeProposal && activeProposal > 9 ? (
										<>
											9<span className='text-[7px]'>+</span>
										</>
									) : (
										activeProposal || ''
									)}
								</span>
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
							<div className='flex justify-between text-lightBlue dark:text-icon-dark-inactive'>
								<span className='pt-[5px]'> {trackName.split(/(?=[A-Z])/).join(' ')}</span>
								{!sidebarCollapsed && (
									<span
										className={`text-[10px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} rounded-lg px-[7px] py-1 text-[#96A4B6] dark:text-[#595959]`}
									>
										{activeProposal && activeProposal > 9 ? (
											<>
												9<span className='text-[7px]'>+</span>
											</>
										) : (
											activeProposal || ''
										)}
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
									<SelectedRoot className=' scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
								) : (
									<RootIcon className={`${sidebarCollapsed && 'mt-0.5'} scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive`} />
								)}
							</>
						) : trackName === PostOrigin.ROOT ? (
							<>
								{router.pathname.includes('/root') ? (
									<SelectedRoot
										className={`${sidebarCollapsed ? ' -ml-[10px]' : '-ml-[10px] -mt-0.5 '} scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive`}
									/>
								) : (
									<RootIcon className={`${sidebarCollapsed ? '-ml-2' : '-ml-[8px] mt-0.5'} scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive`} />
								)}
							</>
						) : trackName === PostOrigin.WISH_FOR_CHANGE ? (
							<>
								{router.pathname.includes('/wish-for-change') ? (
									<SelectedWishForChange
										className={`${sidebarCollapsed ? ' -ml-[10px]' : '-ml-[10px] -mt-1'} scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive`}
									/>
								) : (
									<WishForChangeIcon className={`${sidebarCollapsed ? '-ml-2' : '-ml-[8px] mt-0.5'} scale-90 text-xl font-medium text-lightBlue dark:text-icon-dark-inactive`} />
								)}
							</>
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<>
								{' '}
								{router.pathname.includes('/auction-admin') ? (
									<ImageIcon
										src='/assets/selected-icons/Auction Admin.svg'
										alt=''
										className={`${sidebarCollapsed ? 'absolute  -top-[28px] -ml-2' : '-ml-[10px]  '}  scale-90 text-2xl  font-medium text-lightBlue dark:text-icon-dark-inactive`}
									/>
								) : (
									<ImageIcon
										src='/assets/sidebar/auction.svg'
										alt=''
										className={`${sidebarCollapsed ? ' absolute -top-[28px]  -ml-[7px]' : ' -ml-[8px] -mt-2'}   h-6 w-6 scale-90 text-2xl  ${
											theme == 'dark' ? 'dark-icons' : 'text-lightBlue'
										} text-2xl font-medium `}
									/>
								)}
							</>
						) : (
							<>
								{' '}
								{router.pathname.includes('/staking-admin') ? (
									<ImageIcon
										src='/assets/selected-icons/Staking Admin.svg'
										alt=''
										className={`${
											sidebarCollapsed ? 'absolute -top-[29px] -ml-[10px] mt-0.5' : '-ml-[10px] '
										}  scale-90 text-2xl  font-medium text-lightBlue dark:text-icon-dark-inactive`}
									/>
								) : (
									<StakingAdminIcon
										className={`${sidebarCollapsed ? '-ml-[8px] text-2xl' : ' -ml-[8px]'} mt-1 scale-90   font-medium text-lightBlue dark:text-icon-dark-inactive`}
									/>
								)}
							</>
						);

					gov2TrackItems.mainItems.push(
						getSiderMenuItem(
							<div className='flex justify-between'>
								<span className='pt-1'>
									{trackName
										.split(/(?=[A-Z])/)
										.join(' ')
										.replace(/\b\w/g, (char) => char.toUpperCase())}
								</span>
								{!sidebarCollapsed && (
									<span
										className={`text-[10px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} w-5 rounded-lg px-[7px] py-1 text-[#96A4B6] dark:text-[#595959]`}
									>
										{activeProposal && activeProposal > 9 ? (
											<>
												9<span className='text-[7px]'>+</span>
											</>
										) : (
											activeProposal || ''
										)}
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
									className='absolute -right-2 -top-2 z-50 mt-7 rounded-[9px] px-[2px] py-1 text-[9px] font-semibold text-white md:-right-2 md:-top-8'
									style={{
										opacity: sidedrawer ? 0 : 1,
										transition: 'opacity 0.3s ease-in-out'
									}}
								>
									<span
										className={`text-[10px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} rounded-lg px-[7px] py-1 text-[#96A4B6] dark:text-[#595959]`}
									>
										{activeProposal && activeProposal > 9 ? (
											<>
												9<span className='text-[7px]'>+</span>
											</>
										) : (
											activeProposal || ''
										)}
									</span>
								</div>
							</div>
						)
					);
				}
			}
		}
	}

	const gov2OverviewItems = [
		!isMobile ? getSiderMenuItem('', '', null) : null,

		getSiderMenuItem(
			'Overview',
			'/opengov',
			<>
				{router.pathname === '/' || router.pathname === '/opengov' ? (
					<SelectedOverview className='-ml-2  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<OverviewIcon className='-ml-[7px]  mt-0.5   scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive ' />
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
					<DiscussionsIcon className='-ml-[7px]  mt-1  scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>
		),

		getSiderMenuItem(
			'Preimages',
			'/preimages',
			<>
				{router.pathname === '/preimages' ? (
					<SelectedPreimages className={`-ml-[10px] ${sidebarCollapsed ? '-mt-1' : '-mt-1'} scale-90 text-3xl font-medium text-lightBlue dark:text-icon-dark-inactive`} />
				) : (
					<PreimagesIcon className='-ml-2 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>
		),
		getSiderMenuItem(
			<div
				style={{
					borderTop: '2px dotted #ccc',
					paddingTop: '15px'
				}}
				className='flex items-center dark:border-[#4B4B4B]'
			>
				<span className={`${sidebarCollapsed ? '-ml-1' : 'ml-1'} text-xs font-medium uppercase text-lightBlue  dark:text-icon-dark-inactive`}>Tracks</span>
			</div>,
			'tracksHeading',
			null
		)
	];

	if (isOpenGovSupported(network)) {
		gov2OverviewItems.splice(
			3,
			0,
			getSiderMenuItem(
				<div className='flex w-fit gap-2'>
					<span>Gov Analytics</span>
					<div className={`${poppins.className} ${poppins.variable} rounded-[9px] bg-[#407bfe] px-1.5 text-[10px] font-medium text-white md:-right-6 md:-top-2`}>NEW</div>
				</div>,
				'/gov-analytics',
				<div className='relative -ml-2'>
					<AnalyticsSVGIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					<div
						className={' absolute -right-2 mt-2 rounded-[9px] bg-[#407bfe] px-1.5 py-[3px] text-[10px] font-semibold text-white md:-right-6 md:-top-2'}
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

	if (isOpenGovSupported(network) && ![AllNetworks.MOONBASE, AllNetworks.MOONRIVER, AllNetworks.LAOSSIGMA, AllNetworks.MOONBEAM, AllNetworks.PICASSO].includes(network)) {
		gov2OverviewItems.splice(
			3,
			0,
			getSiderMenuItem(
				<div className='flex w-fit gap-2'>
					<span>Batch Voting</span>
					<div className={`${poppins.className} ${poppins.variable} rounded-[9px] bg-[#407bfe] px-1.5 text-[10px] font-medium text-white md:-right-6 md:-top-2`}>NEW</div>
				</div>,
				'/batch-voting',
				<div className='relative -ml-2'>
					<BatchVotingIcon className='text-8xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
					<div
						className={' absolute -right-2 mt-2 rounded-[9px] bg-[#407bfe] px-1.5 py-[3px] text-[10px] font-semibold text-white md:-right-6 md:-top-2'}
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
					<GovernanceIconNew className='-ml-2 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</>,
			[...gov2TrackItems.governanceItems]
		),
		getSiderMenuItem(
			'Whitelist',
			'gov2_fellowship_group',
			<div>
				{activeWhitelist ? (
					<SelectedWhitelist className='-ml-2 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				) : (
					<FellowshipIconNew className='-ml-2  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
				)}
			</div>,
			[...gov2TrackItems.fellowshipItems]
		)
	];

	const governanceDropdownContent = (
		<div className='text-center'>
			{gov2TrackItems?.governanceItems.map((item, index) => {
				let formattedLabel;
				if (item && 'label' in item) {
					if (typeof item.label === 'string') {
						formattedLabel = toPascalCase(item?.label);
					} else if (React.isValidElement(item?.label)) {
						if (item.label) {
							formattedLabel = item.label;
						}
					}
				}

				return (
					<p
						key={index}
						className={`rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] 
					${item && 'label' in item ? (isActive(item.key as any) ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive') : ''} `}
					>
						<Link
							href={typeof item?.key === 'string' ? item.key : ''}
							className={`inline-block w-full text-left ${isActive(item?.key as string) ? 'font-medium text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}
						>
							<span>{formattedLabel}</span>
						</Link>
					</p>
				);
			})}
		</div>
	);

	// whitelist dropdown
	const whitelistDropdownContent = (
		<div className='text-left'>
			{gov2TrackItems?.fellowshipItems.map((item, index) => {
				let formattedLabel;
				if (item && 'label' in item) {
					if (typeof item?.label === 'string') {
						formattedLabel = toPascalCase(item.label);
					} else if (React.isValidElement(item.label)) {
						formattedLabel = item?.label;
					}
				}

				return (
					<p
						key={index}
						className={`rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] 
            		${isActive(item?.key as string) ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive'} `}
					>
						<Link
							href={item?.key as string}
							className={`inline-block w-full text-left ${isActive(item?.key as string) ? 'font-medium text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}
						>
							<span>{formattedLabel}</span>
						</Link>
					</p>
				);
			})}
		</div>
	);

	let gov2CollapsedItems: MenuProps['items'] = [
		...gov2OverviewItems,
		...gov2TrackItems.mainItems,

		getSiderMenuItem(
			<Popover
				content={governanceDropdownContent}
				placement='right'
				arrow={false}
				trigger='click'
				overlayClassName='z-[1100] w-[190px] left-16'
			>
				<Tooltip
					title='Governance'
					placement='left'
					className='text-xs'
				>
					<div
						className='relative cursor-pointer px-1'
						style={{ marginRight: '-13px', padding: '10%' }}
					>
						{activeGovernance ? (
							<SelectedGovernance className='-ml-9 w-20 scale-90 rounded-lg bg-[#FFF2F9] pt-1 text-2xl font-medium text-[#E5007A] dark:bg-[#520f32] dark:text-icon-dark-inactive' />
						) : (
							<GovernanceIconNew
								className={`mt-1 w-20 ${sidebarCollapsed ? '-ml-9' : '-ml-2'} ${governanceDropdownOpen && 'bg-black bg-opacity-[8%]'} scale-90 font-medium ${
									activeGovernance ? '-ml-7 w-20 rounded-lg bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue'
								} text-2xl dark:text-icon-dark-inactive`}
							/>
						)}
					</div>
				</Tooltip>
			</Popover>,
			'gov2_governance_group',
			null,
			[...gov2TrackItems.governanceItems]
		),

		getSiderMenuItem(
			<Popover
				content={whitelistDropdownContent}
				placement='right'
				arrow={false}
				trigger='click'
				overlayClassName='z-[1100] w-[180px] '
			>
				<Tooltip
					title='Whitelist'
					placement='left'
					className='text-xs'
				>
					<div
						className='relative cursor-pointer px-1'
						style={{ marginRight: '-13px', padding: '10%' }}
					>
						{activeWhitelist ? (
							<SelectedWhitelist className='-ml-9 w-20 scale-90 rounded-lg bg-[#FFF2F9] pt-1 text-2xl font-medium text-[#E5007A] dark:bg-[#520f32] dark:text-icon-dark-inactive' />
						) : (
							<FellowshipIconNew
								className={`-ml-9 mt-1 w-20 scale-90  font-medium ${activeWhitelist ? 'rounded-lg bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue'} text-2xl  ${
									whitelistDropdownOpen && 'bg-black bg-opacity-[8%]'
								} dark:text-icon-dark-inactive`}
							/>
						)}
					</div>
				</Tooltip>
			</Popover>,
			'gov2_fellowship_group',
			null,
			[...gov2TrackItems.fellowshipItems]
		),
		getSiderMenuItem(
			<Tooltip
				title='Parachains'
				placement='left'
				className='text-xs'
			>
				<div
					className=' -ml-12   h-[44px] px-1 dark:border-[#4B4B4B] '
					style={{
						borderTop: '2px dotted #ccc',
						marginBottom: '5px',
						paddingTop: '12px'
					}}
				>
					<Link href='/parachains'>
						<div
							className={`ml-[50px] flex w-10 cursor-pointer items-center justify-center rounded-lg  pt-1  hover:bg-[#000000] hover:bg-opacity-[4%] ${
								activeParachain ? 'bg-[#FFF2F9] text-[#E5007A] dark:bg-[#520f32]' : 'text-lightBlue dark:text-icon-dark-inactive'
							}`}
						>
							<ParachainsIcon className=' mt-2 scale-90 text-xl font-medium ' />
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
			getSiderMenuItem(
				'Fellowship',
				'gov2_fellowship_group',
				<FellowshipIconNew className='-ml-1 mt-1 scale-90 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />,
				[...gov2TrackItems.fellowshipItems]
			)
		);
	}
	let bountiesSubItems: ItemType[] = [];
	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO, AllNetworks.LAOSSIGMA].includes(network)) {
		let items = [...gov2TrackItems.treasuryItems];

		if (['polkadot'].includes(network)) {
			bountiesSubItems.push(
				getSiderMenuItem(
					<div className='ml-[2px] flex  items-center gap-1.5 text-lightBlue hover:text-navBlue dark:text-icon-dark-inactive'>Dashboard</div>,
					'/bounty-dashboard',
					null
				)
			);
		}
		if (isOpenGovSupported(network)) {
			bountiesSubItems = bountiesSubItems.concat(
				getSiderMenuItem(
					<div className='flex items-center justify-between  text-lightBlue hover:text-navBlue dark:text-icon-dark-inactive'>
						Bounties
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.['bountiesCount'] && totalActiveProposalsCount['bountiesCount'] >= 1
									? getSpanStyle('bounties', totalActiveProposalsCount['bountiesCount'])
									: ''
							} rounded-lg px-[5px] py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.['bountiesCount'] > 9 ? (
								<>
									9<span className='text-[7px]'>+</span>
								</>
							) : (
								totalActiveProposalsCount?.['bountiesCount'] || ''
							)}
						</span>
					</div>,
					network === AllNetworks.POLKADOT ? '/bounties-listing' : '/bounties',
					null
				),
				getSiderMenuItem(
					<div className='flex items-center justify-between  text-lightBlue hover:text-navBlue dark:text-icon-dark-inactive'>
						Child Bounties
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.['childBountiesCount'] && totalActiveProposalsCount['childBountiesCount'] >= 1
									? getSpanStyle('childBounties', totalActiveProposalsCount['childBountiesCount'])
									: ''
							} rounded-lg px-[5px] py-1 text-[#96A4B6] dark:text-[#595959]`}
						>
							{totalActiveProposalsCount?.['childBountiesCount'] > 9 ? (
								<>
									9<span className='text-[7px]'>+</span>
								</>
							) : (
								totalActiveProposalsCount?.['childBountiesCount'] || ''
							)}
						</span>
					</div>,
					'/child_bounties',
					null
				)
			);
		}

		const bountiesMenuItem = getSiderMenuItem(
			'Bounties',
			'gov2_bounties_group',
			<div>
				<BountiesIcon className='-ml-1 mt-1 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
			</div>,
			[...bountiesSubItems]
		);

		gov2TrackItems.treasuryItems.push(bountiesMenuItem);

		items = items.concat(bountiesMenuItem);

		gov2Items.splice(
			8,
			0,
			getSiderMenuItem(
				'Treasury',
				'gov2_treasury_group',
				<div>
					{activeTreasury ? (
						<SelectedTreasury className='-ml-2 scale-90 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					) : (
						<TreasuryIconNew className='-ml-2  scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />
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
					<FellowshipIconNew className=' -ml-1 scale-90 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />
				</div>,
				[...gov2TrackItems.fellowshipItems]
			)
		);
	}

	const treasuryDropdownContent = (
		<div className='text-left'>
			{gov2TrackItems.treasuryItems.map((item, index) => {
				const uniqueKey = item && 'label' in item ? `${item.label}-${index}` : `null-${index}`;

				let formattedLabel;
				if (item && 'label' in item) {
					if (typeof item.label === 'string') {
						formattedLabel = toPascalCase(item.label);
					} else if (React.isValidElement(item.label)) {
						formattedLabel = item.label;
					}
				}
				if (item && item.key === 'gov2_bounties_group') {
					const bountiesPopoverContent = (
						<div className='w-[150px] pt-2'>
							{bountiesSubItems.map((subItem, subIndex) => {
								if (!subItem) return null;
								const uniqueSubKey = `${subItem?.key}-${subIndex}`;

								let formattedSubLabel;
								if (subItem && 'label' in subItem) {
									if (typeof subItem.label === 'string') {
										formattedSubLabel = subItem.label
											?.toString()
											.replace(/^\//, '')
											.split('_')
											.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
											.join(' ');
									} else if (React.isValidElement(subItem.label)) {
										formattedSubLabel = subItem.label;
									}
								}

								if (formattedSubLabel === 'Bounty') {
									formattedSubLabel = 'Dashboard';
								}

								return (
									<p
										key={uniqueSubKey}
										className={`rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-[#FFFFFF14] ${
											isActive(subItem?.key as string) ? 'text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'
										}`}
									>
										<Link href={subItem?.key as string}>
											<span className={`block px-2 py-1 text-left ${isActive(subItem?.key as string) ? 'text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}>
												{formattedSubLabel || ''}
											</span>
										</Link>
									</p>
								);
							})}
						</div>
					);

					return (
						<div
							key={uniqueKey}
							className='relative'
						>
							<Popover
								content={bountiesPopoverContent}
								placement='right'
								trigger='hover'
								overlayClassName='z-[1200]'
							>
								<p
									className={`flex cursor-pointer justify-between rounded-lg px-2 py-1 hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] ${
										isActive(item?.key as string) ? ' text-[#E5007A]' : 'text-[#243A57] dark:text-icon-dark-inactive'
									}`}
								>
									<span className='flex items-center gap-2 font-medium'>
										<BountiesIcon className='text-xl text-[#243A57] dark:text-[#FFFFFF]' />
										<span className='text-[#243A57] dark:text-[#FFFFFF]'>Bounties</span>
									</span>
									<RightOutlined />
								</p>
							</Popover>
						</div>
					);
				}

				return (
					<p
						key={uniqueKey}
						className={`rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#FFFFFF14] ${
							isActive(item?.key as string) ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'
						}`}
					>
						<Link href={item?.key as string}>
							<span className={`inline-block w-full text-left ${isActive(item?.key as string) ? 'font-medium text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}>
								{formattedLabel || ''}
							</span>
						</Link>
					</p>
				);
			})}
		</div>
	);

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO, AllNetworks.LAOSSIGMA].includes(network)) {
		gov2CollapsedItems.splice(
			8,
			0,
			getSiderMenuItem(
				<Popover
					content={treasuryDropdownContent}
					placement='right'
					arrow={false}
					trigger='click'
					overlayClassName='z-[1100] w-[190px] left-16'
				>
					<Tooltip
						title='Treasury'
						placement='left'
						className='text-xs'
					>
						<div
							className='relative cursor-pointer px-1'
							style={{ marginRight: '-13px', padding: '10%' }}
						>
							{activeTreasury ? (
								<SelectedTreasury className='-ml-9 w-20 scale-90 rounded-lg bg-[#FFF2F9] pt-1 text-2xl font-medium text-[#E5007A] dark:bg-[#520f32] dark:text-icon-dark-inactive' />
							) : (
								<TreasuryIconNew
									className={`-ml-9 mt-1 w-20 scale-90 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive ${treasuryDropdownOpen && 'bg-black bg-opacity-[8%]'}`}
								/>
							)}
						</div>
					</Tooltip>
				</Popover>,
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
					<OverviewIcon className='-ml-1 mt-0.5 scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
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
		gov2Items.concat(
			getSiderMenuItem(
				'Treasury',
				'gov1_treasury_group',
				<TreasuryIconNew className='-ml-2 -mt-1 text-2xl font-medium text-lightBlue dark:text-icon-dark-inactive' />,
				gov1Items.treasuryItems
			)
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
						className='-mb-2  flex items-center dark:border-[#4B4B4B]'
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
						gov1Items.treasuryItems.slice(2, 0)
					)
				])
			];
		} else {
			gov2Items = [
				...gov2Items,
				getSiderMenuItem(
					<div
						className='-mb-2 ml-2 mr-3 w-[200px] dark:border-[#4B4B4B]  md:w-full lg:ml-0  lg:mr-0'
						style={{
							borderTop: '2px dotted #ccc',
							paddingTop: '12px'
						}}
					>
						<Link href='/parachains'>
							<div
								className={`flex cursor-pointer items-center rounded-lg pl-3 hover:bg-[#000000] hover:bg-opacity-[4%] ${
									activeParachain ? 'bg-[#FFF2F9] font-medium text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive'
								}`}
							>
								<ParachainsIcon className='-ml-1 mt-3 scale-90 text-xl font-medium ' />
								<span className='ml-2 pl-1 text-xs font-medium lg:block'>Parachains</span>
							</div>{' '}
						</Link>
					</div>,
					'tracksHeading',
					null
				),
				getSiderMenuItem('Archived', 'group', <ArchivedIcon className=' -ml-2 scale-90  font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
			];
		}

		const archivedDropdownContent = (
			<div className='text-left'>
				{items.map((item, index) => {
					const formattedLabel =
						typeof item?.key === 'string'
							? item.key
									.replace('_group', '')
									.split('_')
									.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ')
							: '';

					if (item && typeof item?.key === 'string' && item?.key.includes('_group')) {
						return (
							<Popover
								key={index}
								content={
									<div className='w-[210px] '>
										{'children' in item &&
											item?.children?.map((subItem, subIndex) => {
												const formattedKey =
													typeof subItem?.key === 'string'
														? subItem.key
																.replace(/^\//, '')
																.split('-')
																.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
																.join(' ')
														: '';

												return (
													<div
														key={subIndex}
														className='rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-[#FFFFFF14]'
													>
														{subItem?.key && (
															<Link href={subItem.key.toString()}>
																<span
																	className={`font-medium ${
																		isActive(item?.key?.toString() || '') ? 'text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'
																	} flex items-center gap-2 px-2 py-1`}
																>
																	{'icon' in subItem && <span className='text-xl'>{subItem.icon}</span>} {formattedKey}
																</span>
															</Link>
														)}
													</div>
												);
											})}
									</div>
								}
								trigger='hover'
								placement='right'
								overlayClassName='z-[1200]'
							>
								<div
									className={`relative cursor-pointer rounded-lg px-2 py-1 text-[#243A57] hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] ${
										isActive(item?.key) ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive'
									}`}
								>
									<div className='flex items-center justify-between py-2'>
										<span className={`font-medium ${isActive(item?.key) ? 'text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}>{formattedLabel}</span>
										{'children' in item && item.children && (
											<span className='ml-2 cursor-pointer text-xs text-gray-500 dark:text-gray-400'>
												<RightOutlined />
											</span>
										)}
									</div>
								</div>
							</Popover>
						);
					}

					return (
						<p
							key={index}
							className={`rounded-lg px-2 py-1 hover:bg-gray-100 dark:text-[#FFFFFF] dark:hover:bg-[#FFFFFF14] ${
								isActive(item?.key as string) ? 'bg-[#FFF2F9] text-[#E5007A]' : 'text-lightBlue dark:text-icon-dark-inactive'
							}`}
						>
							<Link
								href={item?.key as string}
								className={`inline-block w-full text-left ${isActive(item?.key as string) ? 'font-medium text-[#E5007A]' : 'text-[#243A57] dark:text-[#FFFFFF]'}`}
							>
								<span>{formattedLabel}</span>
							</Link>
						</p>
					);
				})}
			</div>
		);
		const checkIfAnyItemIsActive = (items: MenuProps['items']): boolean => {
			return (items ?? []).some((item) => {
				if (item && item.key && isActive(item.key as string)) {
					return true;
				}

				if (item && 'children' in item) {
					return checkIfAnyItemIsActive(item.children);
				}

				return false;
			});
		};

		gov2CollapsedItems = [
			...gov2CollapsedItems,
			getSiderMenuItem(
				<Popover
					content={archivedDropdownContent}
					placement='right'
					arrow={false}
					trigger='click'
					overlayClassName='z-[1100] w-[180px] '
				>
					<Tooltip
						title='Archived'
						placement='left'
						className='text-xs'
					>
						<div
							className='relative cursor-pointer px-1'
							style={{ marginRight: '-13px', padding: '10%' }}
						>
							<ArchivedIcon
								className={`-ml-9 mt-1 w-20 scale-90 text-2xl ${
									checkIfAnyItemIsActive(items) ? 'bg-[#FFF2F9] text-[#E5007A] dark:bg-[#520f32]' : 'text-lightBlue dark:text-icon-dark-inactive'
								} font-medium ${archivedDropdownOpen && 'bg-black bg-opacity-[8%]'} `}
							/>
						</div>
					</Tooltip>
				</Popover>,
				'archived_group',
				null,
				[...items]
			)
		];
	}

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isOpenGovSupported(network)) {
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (isMobile) {
		sidebarItems = [username && isMobile ? userDropdown : null, ...sidebarItems];
	}
	function toPascalCase(str: string): string {
		return str.replace(/-/g, ' ').replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
	}

	return (
		<Sider
			trigger={null}
			collapsible
			collapsed={sidebarCollapsed}
			onCollapse={(collapsed) => {
				dispatch(GlobalActions.setIsSidebarCollapsed(collapsed));
			}}
			style={{
				transform: 'translateX(0px)',
				transition: 'width 0.3s ease, transform 0.3s ease'
			}}
			className={`sidebar fixed bottom-0 left-0 z-[101] h-screen pt-20 lg:pt-0 ${
				sidedrawer && isMobile ? ' min-w-[250px]' : sidebarCollapsed ? 'min-w-[80px]' : 'min-w-[230px]'
			} bg-white dark:bg-section-dark-overlay`}
		>
			<div className='flex h-full flex-col'>
				<div className='flex flex-col'>
					<Menu
						theme={theme as any}
						mode='inline'
						selectedKeys={[router.pathname]}
						items={gov2Items.slice(0, 1)}
						sidebarCollapsed={sidebarCollapsed}
						sidedrawer={sidedrawer}
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
									<Link href={`${isOpenGovSupported(network) ? '/opengov' : '/'}`}>
										{sidedrawer ? (
											<div className='ml-16 flex h-full items-center justify-center'>
												<Image
													src={theme === 'dark' ? '/assets/PALogoDark.svg' : '/assets/pa-logo-black.svg'}
													alt='polkassembly logo'
													width={150}
													height={50}
												/>
											</div>
										) : (
											<div className='ml-5 h-full'>
												<PaLogo sidedrawer={sidedrawer} />
											</div>
										)}
									</Link>
									<div className={`${sidedrawer ? 'ml-[38px] w-[255px]' : ''} border-bottom border-b-1 -mx-4 my-2 dark:border-separatorDark`}></div>
								</div>
							</div>
						</>
					)}

					{(onchainIdentitySupportedNetwork.includes(network) || delegationSupportedNetworks.includes(network) || network === 'polkadot') && (
						<>
							{!sidebarCollapsed ? (
								<div className={`flex ${sidedrawer ? 'justify-center ' : 'justify-center'} gap-2 md:mt-7`}>
									{onchainIdentitySupportedNetwork.includes(network) && (
										<div className='activeborderhover group relative'>
											<div
												onClick={(e) => {
													e.stopPropagation();
													e.preventDefault();
													if (typeof currentUser?.id === 'number' && !Number.isNaN(currentUser.id) && currentUser?.username) {
														trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
															userId: currentUser.id.toString(),
															userName: currentUser.username
														});
														handleIdentityButtonClick();
													} else {
														setLoginOpen(true);
													}
												}}
											>
												<Image
													src='/assets/head1.svg'
													alt='Head 1'
													width={40}
													height={40}
													className=' cursor-pointer'
												/>
												<div className='absolute bottom-10 left-10 mb-2 hidden w-[117px] -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[12px] text-xs font-semibold text-white group-hover:block'>
													On-chain identity
													<div className='absolute left-10 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
												</div>
											</div>
										</div>
									)}

									{network === 'polkadot' && (
										<div className={`activeborderhover group relative ${isActive('/leaderboard') ? '  activeborder  rounded-lg' : ''}`}>
											<Link href='/leaderboard'>
												<Image
													src='/assets/head2.svg'
													alt='Head 2'
													width={40}
													height={40}
													className=' cursor-pointer'
												/>
												<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
													Leaderboard
													<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
												</div>
											</Link>
										</div>
									)}

									{delegationSupportedNetworks.includes(network) && (
										<div className={`activeborderhover group relative ${isActive('/delegation') ? '  activeborder  rounded-lg' : ''}`}>
											<Link href='/delegation'>
												<Image
													src='/assets/head3.svg'
													alt='Head 3'
													width={40}
													height={40}
													className=' cursor-pointer'
												/>
												<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
													Delegation
													<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
												</div>
											</Link>
										</div>
									)}

									{/* Head 4 (Profile) */}
									<div className={`activeborderhover group relative ${isActive(`/user/${username}`) ? '  activeborder  rounded-lg' : ''}`}>
										<div
											onClick={() => {
												if (username?.length) {
													router.push(`/user/${username}`);
												} else {
													dispatch(GlobalActions.setIsSidebarCollapsed(true));
													setSidedrawer(false);
													setLoginOpen(true);
												}
											}}
										>
											<Image
												src='/assets/head4.svg'
												alt='Head 4'
												width={40}
												height={40}
												className=' cursor-pointer'
											/>
											<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
												Profile
												<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className='ml-5 flex flex-col justify-center gap-2 lg:mt-7'>
									{onchainIdentitySupportedNetwork.includes(network) && (
										<div
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												if (typeof currentUser?.id === 'number' && !Number.isNaN(currentUser.id) && currentUser?.username) {
													trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
														userId: currentUser.id.toString(),
														userName: currentUser.username
													});
													handleIdentityButtonClick();
												} else {
													setLoginOpen(true);
												}
											}}
											className='activeborderhover group relative w-10'
										>
											<div>
												<Image
													src='/assets/head1.svg'
													alt='Head 1'
													width={40}
													height={40}
													className='cursor-pointer'
												/>
												<div className='absolute -bottom-2 left-[103px] z-50 mb-2 hidden w-[112px] -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[12px] text-xs font-semibold text-white group-hover:block'>
													On-chain identity
													<div className='absolute left-[7px] top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
												</div>
											</div>
										</div>
									)}

									{network === 'polkadot' && (
										<div className={`activeborderhover group relative w-10 ${isActive('/leaderboard') ? '  activeborder  rounded-lg' : ''}`}>
											<Link href='/leaderboard'>
												<Image
													src='/assets/head2.svg'
													alt='Head 2'
													width={40}
													height={40}
													className=' cursor-pointer'
												/>
												<div className='absolute bottom-0 left-[90px] z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
													Leaderboard
													<div className='absolute left-[7px] top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
												</div>
											</Link>
										</div>
									)}

									{delegationSupportedNetworks.includes(network) && (
										<div className={`activeborderhover group relative w-10 ${isActive('/delegation') ? '  activeborder  rounded-lg' : ''}`}>
											<Link href='/delegation'>
												<Image
													src='/assets/head3.svg'
													alt='Head 3'
													width={40}
													height={40}
													className=' cursor-pointer'
												/>
												<div className='absolute bottom-0 left-[87px] z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
													Delegation
													<div className='absolute left-[7px] top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
												</div>
											</Link>
										</div>
									)}

									{/* Head 4 (Profile) */}
									<div className={`activeborderhover group relative w-10 ${isActive(`/user/${username}`) ? '  activeborder  rounded-lg' : ''}`}>
										<div
											onClick={() => {
												if (username?.length) {
													router.push(`/user/${username}`);
												} else {
													setLoginOpen(true);
												}
											}}
										>
											<Image
												src='/assets/head4.svg'
												alt='Head 4'
												width={40}
												height={40}
												className=' cursor-pointer'
											/>
											<div className='absolute bottom-0 left-[74px] mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
												Profile
												<div className='absolute left-[7px] top-[5px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
											</div>
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</div>
				<div
					className={`hide-scrollbar ${
						onchainIdentitySupportedNetwork.includes(network) || delegationSupportedNetworks.includes(network) || network === 'polkadot' ? '' : 'mt-7'
					} ${!sidebarCollapsed ? 'mt-2 overflow-y-auto pb-[240px] xl:pb-[104px]' : 'mt-2 overflow-y-auto pb-56'}`}
				>
					<Menu
						theme={theme as any}
						mode='inline'
						openKeys={openKeys}
						onOpenChange={onOpenChange}
						selectedKeys={[router.pathname]}
						items={sidebarItems.slice(1)}
						onClick={handleMenuClick}
						sidebarCollapsed={sidebarCollapsed}
						sidedrawer={sidedrawer}
						className={`${username ? 'auth-sider-menu' : ''} ${
							sidebarCollapsed ? 'ml-2 flex flex-grow flex-col items-center  pr-2' : 'mt-3  md:mt-0  '
						} overflow-x-hidden dark:bg-section-dark-overlay`}
					/>
				</div>
				{!sidebarCollapsed ? (
					<>
						<SidebarFoot1 />
					</>
				) : (
					<>
						<SidebarFoot2 />
					</>
				)}
			</div>
		</Sider>
	);
};

export default Sidebar;
