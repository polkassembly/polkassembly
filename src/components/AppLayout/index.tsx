// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @next/next/no-img-element */
/* eslint-disable sort-keys */
import { DownOutlined, LogoutOutlined, SettingOutlined, VerticalRightOutlined, VerticalLeftOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Avatar, Drawer, Layout, Menu as AntdMenu, MenuProps, Modal } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { NextComponentType, NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, ReactNode, useEffect, useState } from 'react';
import { useApiContext, usePeopleChainApiContext } from 'src/context';
import {
	AuctionAdminIcon,
	BountiesIcon,
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
	WishForChangeIcon,
	UpgradeCommitteePIPsIcon,
	CommunityPIPsIcon,
	ApplayoutIdentityIcon,
	ArchivedIcon,
	ClearIdentityOutlinedIcon,
	RoundedDollarIcon
} from 'src/ui-components/CustomIcons';
import styled from 'styled-components';
import { isFellowshipSupported } from '~src/global/fellowshipNetworks';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { IActiveProposalCount, PostOrigin } from '~src/types';

import Footer from './Footer';
import NavHeader from './NavHeader';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import OpenGovHeaderBanner from './OpenGovHeaderBanner';
import dynamic from 'next/dynamic';
import { poppins } from 'pages/_app';

import IdentityCaution from '~assets/icons/identity-caution.svg';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import PaLogo from './PaLogo';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { logout, userDetailsActions } from '~src/redux/userDetails';
import { useTheme } from 'next-themes';
import { Dropdown } from '~src/ui-components/Dropdown';
import ImageIcon from '~src/ui-components/ImageIcon';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { ApiPromise } from '@polkadot/api';
import isPeopleChainSupportedNetwork from '../OnchainIdentity/utils/getPeopleChainSupportedNetwork';
import { getSpanStyle } from '~src/ui-components/TopicTag';

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});
interface IUserDropdown {
	handleSetIdentityClick: any;
	isIdentityUnverified: boolean;
	isGood: boolean;
	handleLogout: any;
	network: string;
	handleRemoveIdentity: (pre?: any) => void;
	img?: string | null;
	username?: string;
	identityUsername?: string;
	className?: string;
	isIdentityExists: boolean;
}

const { Content, Sider } = Layout;

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
		.ant-menu-item-icon > span {
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

function getSiderMenuItem2(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
	label = <span className='text-xs font-medium text-lightBlue  dark:text-icon-dark-inactive'>{label}</span>;
	return {
		children,
		icon,
		key,
		label,
		type: ['tracksHeading', 'pipsHeading'].includes(key as string) ? 'group' : ''
	} as MenuItem;
}

export const onchainIdentitySupportedNetwork: Array<string> = [AllNetworks.POLKADOT, AllNetworks.KUSAMA, AllNetworks.POLKADEX];

const getUserDropDown = ({
	handleLogout,
	handleRemoveIdentity,
	handleSetIdentityClick,
	isGood,
	isIdentityExists,
	isIdentityUnverified,
	network,
	className,
	identityUsername,
	img,
	username
}: IUserDropdown): MenuItem => {
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
		const options = [
			{
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
						<span className='ml-0.5 text-lg'>
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
			}
		];

		if (isIdentityExists) {
			options.push({
				key: 'remove identity',
				label: (
					<Link
						className={`-ml-1 flex items-center gap-x-2 font-medium text-lightBlue  hover:text-pink_primary dark:text-icon-dark-inactive ${className}`}
						href={''}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							handleRemoveIdentity?.();
						}}
					>
						<span className='ml-0.5 text-[22px]'>
							<ClearIdentityOutlinedIcon />
						</span>
						<span>Remove Identity</span>
					</Link>
				)
			});
		}
		dropdownMenuItems.splice(1, 0, ...options);
	}

	const AuthDropdown = ({ children }: { children: ReactNode }) => {
		const { resolvedTheme: theme } = useTheme();
		return (
			<Dropdown
				theme={theme as any}
				menu={{ items: dropdownMenuItems }}
				trigger={['click']}
				className='profile-dropdown'
				overlayClassName='z-[101]'
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
	const { api: defaultApi, apiReady: defaultApiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [{ api, apiReady }, setApiDetails] = useState<{ api: ApiPromise | null; apiReady: boolean }>({ api: defaultApi || null, apiReady: defaultApiReady || false });
	const { username, picture, loginAddress } = useUserDetailsSelector();
	const [sidedrawer, setSidedrawer] = useState<boolean>(true);
	const router = useRouter();
	const [previousRoute, setPreviousRoute] = useState(router.asPath);
	const [open, setOpen] = useState<boolean>(false);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false); // New state for sidebar collapsed
	const [identityMobileModal, setIdentityMobileModal] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(true);
	const [isIdentitySet, setIsIdentitySet] = useState<boolean>(false);
	const [isGood, setIsGood] = useState<boolean>(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const dispatch = useDispatch();
	// const [notificationVisible, setNotificationVisible] = useState(true);
	const [totalActiveProposalsCount, setTotalActiveProposalsCount] = useState<IActiveProposalCount>();

	const getTotalActiveProposalsCount = async () => {
		if (!network) return;

		const { data, error } = await nextApiClientFetch<IActiveProposalCount>('/api/v1/posts/active-proposals-count');
		if (data) {
			setTotalActiveProposalsCount(data);
		} else if (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (isPeopleChainSupportedNetwork(network)) {
			setApiDetails({ api: peopleChainApi || null, apiReady: peopleChainApiReady });
		} else {
			setApiDetails({ api: defaultApi || null, apiReady: defaultApiReady || false });
		}
	}, [network, peopleChainApi, peopleChainApiReady, defaultApi, defaultApiReady]);

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

	// useEffect(() => {
	// if (!global?.window) return;
	// const authToken = getLocalStorageToken();
	// if (authToken && isExpired(authToken)) {
	// dispatch(userDetailsActions.setLogout());
	// }
	// // eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [router.asPath]);

	useEffect(() => {
		if (!window || !(window as any)?.ethereum || !(window as any)?.ethereum?.on) return;
		(window as any).ethereum.on('accountsChanged', () => {
			window.location.reload();
		});
	}, []);

	useEffect(() => {
		getTotalActiveProposalsCount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const { display, displayParent, isGood, isIdentitySet, isVerified, nickname } = await getIdentityInformation({
				address: loginAddress,
				api: api,
				apiReady: apiReady,
				network: network
			});
			dispatch(userDetailsActions.setIsUserOnchainVerified(isVerified || false));
			setMainDisplay(displayParent || display || nickname);
			setIsGood(isGood);
			setIsIdentitySet(isIdentitySet);
			setIsIdentityUnverified(!isVerified);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginAddress, network]);

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
			getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
		],
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
						<DemocracyProposalsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
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
						<ReferendaIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
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
						<MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem('Members', '/council', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
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
						<TreasuryProposalsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem(
						<div className='flex items-center justify-between'>
							Tips
							<span className={`text-[10px] ${totalActiveProposalsCount?.tips ? getSpanStyle('Tips', totalActiveProposalsCount['tips']) : ''} rounded-lg px-2 py-1`}>
								{totalActiveProposalsCount?.tips ? `${totalActiveProposalsCount['tips']}` : ''}
							</span>
						</div>,
						'/tips',
						<TipsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
			  ]
			: [],
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
						<TechComProposalIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
			  ]
			: [],
		allianceItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem('Announcements', '/alliance/announcements', <NewsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
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
						<MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/alliance/members', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
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
							<RootIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
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
							<UpgradeCommitteePIPsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
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
							<CommunityPIPsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						)
				  ]
				: [],
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
						getSiderMenuItem('Members', '/advisory-committee/members', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
				  ]
				: []
	};
	if (isGrantsSupported(network)) {
		gov1Items['overviewItems'].splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
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

	if (isFellowshipSupported(network)) {
		gov2TrackItems?.fellowshipItems?.splice(0, 1, getSiderMenuItem('Members', '/fellowship'), getSiderMenuItem('Member Referenda', '/member-referenda'));
	}

	if (network && networkTrackInfo[network]) {
		gov2TrackItems.mainItems.push(
			getSiderMenuItem(
				<div className='flex justify-between'>
					All
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
				<div className={`relative`}>
					<OverviewIcon className='scale-90 pt-3 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					<div
						className={'absolute -right-2 -top-2 z-50 mt-7 rounded-[9px] px-[3px] py-1 text-[10px] font-semibold text-white md:-right-3 md:-top-6'}
						style={{
							transition: 'opacity 0.3s ease-in-out',
							opacity: sidebarCollapsed ? 1 : 0
						}}
					>
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.allCount ? getSpanStyle('All', totalActiveProposalsCount.allCount) : ''
							} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
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
							<RootIcon className='scale-90 pt-2 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.ROOT ? (
							<RootIcon className='scale-90 pt-2 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.WISH_FOR_CHANGE ? (
							<WishForChangeIcon className='mt-[1px] scale-90 pt-2 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<AuctionAdminIcon className='mt-[1px] scale-90 pt-2 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : (
							<StakingAdminIcon className='scale-90 pt-2 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						);

					gov2TrackItems.mainItems.push(
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
								.toLowerCase()}`,
							<div className={`relative`}>
								{icon}
								<div
									className={'absolute -right-2 -top-2 z-50 mt-7 rounded-[9px] px-[3px] py-1 text-[10px] font-semibold text-white md:-right-3 md:-top-6'}
									style={{
										transition: 'opacity 0.3s ease-in-out',
										opacity: sidedrawer ? 0 : 1
									}}
								>
									<span
										className={`text-[10px] ${
											activeProposal && activeProposal >= 1 ? getSpanStyle(trackName, activeProposal) : ''
										} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
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
				<div className='ml-[2px] flex items-center gap-1.5'>
					Bounties
					<div className={`${poppins.className} ${poppins.variable} rounded-[9px] bg-[#407bfe] px-[6px] text-[10px] font-semibold text-white md:-right-6 md:-top-2`}>NEW</div>
				</div>,
				'/bounty',
				<div className={`relative ${!sidedrawer && 'mt-2'}`}>
					<RoundedDollarIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
					<div
						className={' absolute -right-2 rounded-[9px] bg-[#407bfe] px-[6px] py-1 text-[10px] font-semibold text-white md:-right-6 md:-top-2'}
						style={{
							transition: 'opacity 0.3s ease-in-out',
							opacity: sidedrawer ? 0 : 1
						}}
					>
						NEW
					</div>
				</div>
			)
		);
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
		// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
	];

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
		gov2Items.splice(
			gov2Items.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO].includes(network)) {
		let items = [...gov2TrackItems.treasuryItems];
		if (isOpenGovSupported(network)) {
			items = items.concat(
				getSiderMenuItem(
					<div className='flex items-center justify-between'>
						{network === 'polkadot' ? 'On-chain Bounties' : 'Bounties'}
						<span
							className={`text-[10px] ${
								totalActiveProposalsCount?.['bountiesCount'] && totalActiveProposalsCount['bountiesCount'] >= 1
									? getSpanStyle('bounties', totalActiveProposalsCount['bountiesCount'])
									: ''
							} rounded-lg px-2 py-1 text-[#96A4B6] dark:text-[#595959]`}
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
			getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
		);
	}

	if (isFellowshipSupported(network)) {
		gov2CollapsedItems.splice(
			gov2CollapsedItems.length - 1,
			1,
			getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.fellowshipItems
			])
		);
	}

	if (![AllNetworks.MOONBASE, AllNetworks.MOONBEAM, AllNetworks.MOONRIVER, AllNetworks.PICASSO].includes(network)) {
		gov2CollapsedItems.splice(
			-1,
			0,
			getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
				...gov2TrackItems.treasuryItems
			])
		);
	}

	const handleMenuClick = (menuItem: any) => {
		if (['userMenu', 'tracksHeading', 'pipsHeading'].includes(menuItem.key)) return;
		router.push(menuItem.key);
		{
			isMobile && setSidedrawer(false);
		}
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
	if ([AllNetworks.MOONBEAM, AllNetworks.PICASSO].includes(network)) {
		gov2Items = gov2Items.concat(
			getSiderMenuItem('Treasury', 'gov1_treasury_group', <TreasuryGroupIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		);
		gov2CollapsedItems = [
			...gov2CollapsedItems,
			getSiderMenuItem('Treasury', 'treasury_group', <TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, gov1Items.treasuryItems)
		];
	}

	if (![AllNetworks.POLYMESH].includes(network)) {
		if (AllNetworks.WESTEND.includes(network)) {
			gov2Items = [
				...gov2Items,
				getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-3 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
				getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [
					getSiderMenuItem(
						'Treasury',
						'treasury_group',
						<TreasuryGroupIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />,
						gov1Items.treasuryItems.slice(0, 1)
					)
				])
			];
		} else {
			gov2Items = [
				...gov2Items,
				getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-3 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
				getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />, [...items])
			];
		}
		gov2CollapsedItems = [...gov2CollapsedItems, getSiderMenuItem('Archived', 'archived', <ArchivedIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />)];
	}

	const handleRemoveIdentity = () => {
		if (loginAddress) {
			dispatch(setOpenRemoveIdentityModal(true));
		} else {
			dispatch(setOpenRemoveIdentitySelectAddressModal(true));
		}
	};

	const userDropdown = getUserDropDown({
		handleLogout: handleLogout,
		handleRemoveIdentity: handleRemoveIdentity,
		handleSetIdentityClick: handleIdentityButtonClick,
		isGood: isGood,
		isIdentityExists: isIdentitySet,
		isIdentityUnverified: isIdentityUnverified,
		network: network,
		className: `${className} ${poppins.className} ${poppins.variable}`,
		identityUsername: mainDisplay,
		img: picture,
		username: username || ''
	});

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isOpenGovSupported(network)) {
		// if (loginAddress) gov2Items = [gov2Items.shift(), getReferendaDropdown(), ...gov2Items];
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (isMobile) {
		sidebarItems = [username && isMobile ? userDropdown : null, ...sidebarItems];
	}

	return (
		<div>
			<Layout className={`${className} overflow-x-hidden overflow-y-hidden`}>
				<NavHeader
					theme={theme as any}
					sidedrawer={sidedrawer}
					className={` ${sidebarCollapsed ? '' : 'pl-[160px]'} `}
					setSidedrawer={setSidedrawer}
					previousRoute={previousRoute}
					displayName={mainDisplay}
					isVerified={isGood && !isIdentityUnverified}
					isIdentityExists={isIdentitySet}
				/>
				<Layout hasSider>
					<div className='flex w-full gap-2'>
						<Sider
							trigger={null}
							collapsible
							collapsed={sidebarCollapsed}
							onCollapse={(collapsed) => {
								setSidebarCollapsed(collapsed);
							}}
							style={{ transform: 'translateX(0px)', transitionDuration: '0.3s' }}
							className={`sidebar fixed bottom-0 left-0 z-[101] h-screen ${
								sidebarCollapsed ? 'min-w-[80px]' : 'min-w-[230px]'
							} overflow-y-hidden bg-white dark:bg-section-dark-overlay`}
						>
							<div className='flex h-full flex-col'>
								<div className='flex flex-col'>
									<Menu
										theme={theme as any}
										mode='inline'
										selectedKeys={[router.pathname]}
										items={gov2Items.slice(0, 1)}
										className={`${username ? 'auth-sider-menu' : ''} dark:bg-section-dark-overlay`}
									/>
									{!sidebarCollapsed ? (
										<>
											<div className=' flex justify-center gap-2'>
												<div className='group relative '>
													<img
														src='/assets/head1.svg'
														alt='Head 1'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute bottom-10 left-12 mb-2 hidden w-[90px] -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														On-chain identity
														<div className='absolute left-4 top-7 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative '>
													<img
														src='/assets/head2.svg'
														alt='Head 2'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Leaderboard
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative '>
													<img
														src='/assets/head3.svg'
														alt='Head 3'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Delegation
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative '>
													<img
														src='/assets/head4.svg'
														alt='Head 4'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute -left-4 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Calendar
														<div className='absolute left-16 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
											</div>
										</>
									) : (
										<>
											<div className=' ml-5 flex flex-col justify-center gap-2'>
												<div className='group relative '>
													<img
														src='/assets/head1.svg'
														alt='Head 1'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute -bottom-16 left-5 z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
														On-chain identity
														<div className='absolute left-6 top-[-3px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative '>
													<img
														src='/assets/head2.svg'
														alt='Head 2'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute bottom-full left-5 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
														Leaderboard
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative '>
													<img
														src='/assets/head3.svg'
														alt='Head 3'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute bottom-full left-5 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
														Delegation
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative '>
													<img
														src='/assets/head4.svg'
														alt='Head 4'
														className='h-10 w-10 cursor-pointer'
													/>
													<div className='absolute bottom-full left-5 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
														Calendar
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
											</div>
										</>
									)}
								</div>
								<div className={`hide-scrollbar ${!sidebarCollapsed ? 'h-[650px] overflow-y-auto pb-2' : 'mt-4 h-[345px]  overflow-y-auto pb-2'} `}>
									<Menu
										theme={theme as any}
										mode='inline'
										selectedKeys={[router.pathname]}
										items={sidebarItems.slice(1)}
										onClick={handleMenuClick}
										className={`${username ? 'auth-sider-menu' : ''} dark:bg-section-dark-overlay`}
									/>
								</div>
								{!sidebarCollapsed ? (
									<>
										<div className='fixed bottom-0 left-0 w-full py-3'>
											<div className='mt-10 flex items-center justify-center gap-2'>
												<div className='group relative'>
													<img
														src='/assets/foot1.svg'
														alt='Foot1'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Townhall
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative'>
													<img
														src='/assets/foot2.svg'
														alt='Foot2'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Polkasafe
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative'>
													<img
														src='/assets/foot3.svg'
														alt='Foot3'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Fellowship
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative'>
													<img
														src='/assets/foot4.svg'
														alt='Foot4'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute -left-0 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
														Staking
														<div className='absolute left-14  top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
											</div>
										</div>
									</>
								) : (
									<>
										<div className='fixed bottom-0  left-0 w-full py-3'>
											<div className='mt-10 flex flex-col items-center justify-center gap-2'>
												<div className='group relative'>
													<img
														src='/assets/foot1.svg'
														alt='Foot1'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
														Townhall
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative'>
													<img
														src='/assets/foot2.svg'
														alt='Foot2'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
														Polkasafe
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative'>
													<img
														src='/assets/foot3.svg'
														alt='Foot3'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[10px] font-semibold text-white group-hover:block'>
														Fellowship
														<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
												<div className='group relative'>
													<img
														src='/assets/foot4.svg'
														alt='Foot4'
														className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
													/>
													<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[10px] font-semibold text-white group-hover:block'>
														Staking
														<div className='absolute left-1/2  top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
													</div>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						</Sider>
						<div className={`fixed ${sidebarCollapsed ? 'left-16' : 'left-52'} top-12 z-[102]`}>
							{sidebarCollapsed ? (
								<div
									style={{ border: '1px solid #D2D8E0', borderRadius: '0.375rem', backgroundColor: '#FFFFFF', padding: '0.3rem', fontSize: '16px', color: '#485F7D' }}
									className='dark:bg-black dark:text-white'
								>
									<VerticalLeftOutlined
										onClick={() => {
											setSidebarCollapsed(false);
											setSidedrawer(true);
										}}
									/>
								</div>
							) : (
								<div
									style={{ border: '1px solid #D2D8E0', borderRadius: '0.375rem', backgroundColor: '#FFFFFF', padding: '0.3rem', fontSize: '16px', color: '#485F7D' }}
									className='dark:bg-black dark:text-white'
								>
									<VerticalRightOutlined
										onClick={() => {
											setSidebarCollapsed(true);
											setSidedrawer(false);
										}}
									/>
								</div>
							)}
						</div>
						<div className='w-full'>
							{[''].includes(network) && ['/', '/opengov', '/gov-2'].includes(router.asPath) ? (
								<Layout className={`min-h-[calc(100vh - 10rem)] flex w-full flex-row overflow-x-hidden overflow-y-hidden bg-[#F5F6F8] dark:bg-section-dark-background`}>
									<OpenGovHeaderBanner network={network} />
									<Content className={`mx-auto my-6  w-full  ${sidebarCollapsed ? 'pl-[100px] pr-[40px]' : 'pl-[240px] pr-[60px]'}`}>
										<Component {...pageProps} />
									</Content>
								</Layout>
							) : (
								<Layout className={`min-h-[calc(100vh - 10rem)] flex w-full flex-row overflow-x-hidden overflow-y-hidden bg-[#F5F6F8] dark:bg-section-dark-background`}>
									<Content className={`mx-auto my-6  w-full  ${sidebarCollapsed ? 'pl-[100px] pr-[40px]' : 'pl-[250px] pr-[35px]'}`}>
										<Component {...pageProps} />
									</Content>
								</Layout>
							)}
							<Footer
								className={` ${sidebarCollapsed ? '' : 'pl-[210px] pr-20'} `}
								theme={theme as any}
							/>
						</div>
					</div>
				</Layout>
				{onchainIdentitySupportedNetwork.includes(network) && (
					<OnchainIdentity
						open={open}
						setOpen={setOpen}
						openAddressModal={openAddressLinkedModal}
						setOpenAddressModal={setOpenAddressLinkedModal}
					/>
				)}
			</Layout>
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
					<ImageIcon
						src='/assets/icons/delegation-empty-state.svg'
						alt='delegation empty state icon'
					/>
					<span className='dark:text-white'>Please use your desktop computer to verify on chain identity</span>
				</div>
			</Modal>
		</div>
	);
};

export default styled(AppLayout)`
	.ant-layout {
		position: relative;
	}

	.ant-layout-sider {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
	}

	@media (max-width: 768px) {
		.ant-layout-header,
		.ant-layout-content {
			margin-left: 0;
		}
	}

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
		max-width: 236px !important;
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
		font-size: 12px !important;
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
		font-size: 12px;
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
		color: ${(props: any) => (props.theme == 'dark' ? '#909090' : '#485F7D')};
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
	.ant-menu-inline .ant-menu-item {
		height: 36px !important;
	}
	.ant-menu-vertical > .ant-menu-item {
		height: 36px !important;
	}
	.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title {
		height: 36px !important;
	}
	.ant-menu-submenu-title {
		height: 36px !important;
	}
	.ant-menu-vertical > .ant-menu-item > li:first-child {
		height: 40px !important;
	}
	.ant-menu-root > li:first-child {
		height: 60px !important;
	}
`;
