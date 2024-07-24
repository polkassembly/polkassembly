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
import { useApiContext, usePeopleKusamaApiContext } from 'src/context';
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
	LeaderboardOverviewIcon,
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
import ToggleButton from '~src/ui-components/ToggleButton';
import BigToggleButton from '~src/ui-components/ToggleButton/BigToggleButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { ApiPromise } from '@polkadot/api';

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
	const { peopleKusamaApi, peopleKusamaApiReady } = usePeopleKusamaApiContext();
	const [{ api, apiReady }, setApiDetails] = useState<{ api: ApiPromise | null; apiReady: boolean }>({ api: defaultApi || null, apiReady: defaultApiReady || false });
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
		if (network === 'kusama') {
			setApiDetails({ api: peopleKusamaApi || null, apiReady: peopleKusamaApiReady });
		} else {
			setApiDetails({ api: defaultApi || null, apiReady: defaultApiReady || false });
		}
	}, [network, peopleKusamaApi, peopleKusamaApiReady, defaultApi, defaultApiReady]);

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
			getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
			// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
			getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-3 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		],
		democracyItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						<div className='flex items-center gap-1.5'>
							Proposals
							<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
								{totalActiveProposalsCount?.democracyProposalsCount ? `[${totalActiveProposalsCount['democracyProposalsCount']}]` : ''}
							</span>
						</div>,
						'/proposals',
						<DemocracyProposalsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem(
						<div className='flex items-center gap-1.5'>
							Referenda
							<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
								{totalActiveProposalsCount?.referendumsCount ? `[${totalActiveProposalsCount['referendumsCount']}]` : ''}
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
						<div className='flex items-center gap-1.5'>
							Motions
							<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
								{totalActiveProposalsCount?.councilMotionsCount ? `[${totalActiveProposalsCount['councilMotionsCount']}]` : ''}
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
						<div className='flex items-center gap-1.5'>
							Proposals
							<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
								{totalActiveProposalsCount?.treasuryProposalsCount ? `[${totalActiveProposalsCount['treasuryProposalsCount']}]` : ''}
							</span>
						</div>,
						'/treasury-proposals',
						<TreasuryProposalsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					),
					getSiderMenuItem(
						<div className='flex items-center gap-1.5'>
							Tips
							<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>{totalActiveProposalsCount?.tips ? `[${totalActiveProposalsCount['tips']}]` : ''}</span>
						</div>,
						'/tips',
						<TipsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					)
			  ]
			: [],
		techCommItems: chainProperties[network]?.subsquidUrl
			? [
					getSiderMenuItem(
						<div className='flex items-center gap-1.5'>
							Proposals
							<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
								{totalActiveProposalsCount?.techCommetteeProposalsCount ? `[${totalActiveProposalsCount['techCommetteeProposalsCount']}]` : ''}
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
					getSiderMenuItem('Motions', '/alliance/motions', <MotionsIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
					getSiderMenuItem('Members', '/alliance/members', <MembersIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
			  ]
			: [],
		PIPsItems:
			chainProperties[network]?.subsquidUrl && network === AllNetworks.POLYMESH
				? [
						getSiderMenuItem(
							<div className='flex items-center gap-1.5'>
								Technical Committee
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
									{totalActiveProposalsCount?.technicalPipsCount ? `[${totalActiveProposalsCount['technicalPipsCount']}]` : ''}
								</span>
							</div>,
							'/technical',
							<RootIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						),
						getSiderMenuItem(
							<div className='flex items-center gap-1.5'>
								Upgrade Committee
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
									{totalActiveProposalsCount?.upgradePipsCount ? `[${totalActiveProposalsCount['upgradePipsCount']}]` : ''}{' '}
								</span>
							</div>,
							'/upgrade',
							<UpgradeCommitteePIPsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
						),
						getSiderMenuItem(
							<div className='flex items-center gap-1.5'>
								Community
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
									{totalActiveProposalsCount?.communityPipsCount ? `[${totalActiveProposalsCount['communityPipsCount']}]` : ''}{' '}
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
							<div className='flex items-center gap-1.5'>
								Motions
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
									{totalActiveProposalsCount?.advisoryCommitteeMotionsCount ? `[${totalActiveProposalsCount['advisoryCommitteeMotionsCount']}]` : ''}
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
	if (['polkadot'].includes(network)) {
		gov1Items['overviewItems'].splice(
			3,
			0,
			getSiderMenuItem(
				<div className='flex w-fit gap-2'>
					<span>Leaderboard</span>
					<div className='rounded-[9px] bg-[#9747FF] px-[6px] text-[10px] font-semibold text-white md:-right-6 md:-top-2'>BETA</div>
				</div>,
				'/leaderboard',
				<div className={`relative ${!sidedrawer && 'mt-2'}`}>
					<LeaderboardOverviewIcon className='scale-125 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					<div
						className={'} absolute -right-2 -top-4 rounded-[9px] bg-[#9747FF] px-[6px] py-1 text-[10px] font-semibold text-white md:-right-6 md:-top-2'}
						style={{
							transition: 'opacity 0.3s ease-in-out',
							opacity: sidedrawer ? 0 : 1
						}}
					>
						BETA
					</div>
				</div>
			)
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
											<div className='flex items-center gap-1.5'>
												Bounties
												<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
													{totalActiveProposalsCount?.['bountiesCount'] ? `[${totalActiveProposalsCount?.['bountiesCount']}]` : ''}
												</span>
											</div>,
											'/bounties',
											<BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
										),
										getSiderMenuItem(
											<div className='flex items-center gap-1.5'>
												Child Bounties
												<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
													{totalActiveProposalsCount?.['childBountiesCount'] ? `[${totalActiveProposalsCount?.['childBountiesCount']}]` : ''}
												</span>
											</div>,
											'/child_bounties',
											<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />
										)
									]
							  ]
							: [
									...gov1Items.treasuryItems,
									getSiderMenuItem(
										<div className='flex items-center gap-1.5'>
											Bounties
											<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
												{totalActiveProposalsCount?.['bountiesCount'] ? `[${totalActiveProposalsCount?.['bountiesCount']}]` : ''}
											</span>
										</div>,
										'/bounties',
										<BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
									),
									getSiderMenuItem(
										<div className='flex items-center gap-1.5'>
											Child Bounties
											<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
												{totalActiveProposalsCount?.['childBountiesCount'] ? `[${totalActiveProposalsCount?.['childBountiesCount']}]` : ''}
											</span>
										</div>,
										'/child_bounties',
										<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />
									)
							  ]
						: [AllNetworks.POLIMEC, AllNetworks.ROLIMEC].includes(network)
						? [...gov1Items.treasuryItems.slice(0, 1)]
						: [
								...gov1Items.treasuryItems,
								getSiderMenuItem(
									<div className='flex items-center gap-1.5'>
										Bounties
										<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
											{totalActiveProposalsCount?.['bountiesCount'] ? `[${totalActiveProposalsCount?.['bountiesCount']}]` : ''}
										</span>
									</div>,
									'/bounties',
									<BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
								),
								getSiderMenuItem(
									<div className='flex items-center gap-1.5'>
										Child Bounties
										<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
											{totalActiveProposalsCount?.['childBountiesCount'] ? `[${totalActiveProposalsCount?.['childBountiesCount']}]` : ''}
										</span>
									</div>,
									'/child_bounties',
									<ChildBountiesIcon className='ml-0.5 scale-90 text-2xl font-medium  text-lightBlue dark:text-icon-dark-inactive' />
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
				<div className='flex items-center gap-1.5'>
					All
					<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>{totalActiveProposalsCount?.allCount ? `[${totalActiveProposalsCount?.allCount}]` : ''}</span>
				</div>,
				'/all-posts',
				<OverviewIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />
			)
		);
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			if (!networkTrackInfo[network][trackName] || !('group' in networkTrackInfo[network][trackName])) continue;

			const activeProposal = totalActiveProposalsCount?.[networkTrackInfo[network][trackName]?.trackId];

			const menuItem = getSiderMenuItem(
				<div className='flex gap-1.5'>
					{trackName.split(/(?=[A-Z])/).join(' ')}
					<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>{activeProposal ? `[${activeProposal}]` : ''}</span>
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
							<div className='flex gap-1.5'>
								{trackName.split(/(?=[A-Z])/).join(' ')}
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>{activeProposal ? `[${activeProposal}]` : ''}</span>
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
							<div className='flex gap-1.5'>
								{trackName.split(/(?=[A-Z])/).join(' ')}
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>{activeProposal ? `[${activeProposal}]` : ''}</span>
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
							<RootIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.ROOT ? (
							<RootIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.WISH_FOR_CHANGE ? (
							<WishForChangeIcon className='mt-[1px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : trackName === PostOrigin.AUCTION_ADMIN ? (
							<AuctionAdminIcon className='mt-[1px] scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						) : (
							<StakingAdminIcon className='scale-90 font-medium text-lightBlue dark:text-icon-dark-inactive' />
						);
					gov2TrackItems.mainItems.push(
						getSiderMenuItem(
							<div className='flex gap-1.5'>
								{trackName.split(/(?=[A-Z])/).join(' ')}
								<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>{activeProposal ? `[${activeProposal}]` : ''}</span>
							</div>,
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
		getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		// getSiderMenuItem('News', '/news', <NewsIcon className='text-lightBlue font-medium  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='mt-2.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
	];

	if (['kusama', 'polkadot'].includes(network)) {
		gov2OverviewItems.splice(
			3,
			0,
			getSiderMenuItem('Delegation', '/delegation', <DelegatedIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
		);
	}
	if (['polkadot'].includes(network)) {
		gov2OverviewItems.splice(
			3,
			0,
			getSiderMenuItem(
				<div className='flex w-fit gap-2'>
					<span>Leaderboard</span>
					<div className='rounded-[9px] bg-[#9747FF] px-[6px] text-[10px] font-semibold text-white md:-right-6 md:-top-2'>BETA</div>
				</div>,
				'/leaderboard',
				<div className={`relative ${!sidedrawer && 'mt-2'}`}>
					<LeaderboardOverviewIcon className='scale-125 text-2xl font-medium text-lightBlue  dark:text-icon-dark-inactive' />
					<div
						className={'} absolute -right-2 -top-4 rounded-[9px] bg-[#9747FF] px-[6px] py-1 text-[10px] font-semibold text-white md:-right-6 md:-top-2'}
						style={{
							transition: 'opacity 0.3s ease-in-out',
							opacity: sidedrawer ? 0 : 1
						}}
					>
						BETA
					</div>
				</div>
			)
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
					<div className='flex items-center gap-1.5'>
						{network == 'polkadot' ? 'On-chain Bounties' : 'Bounties'}
						<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
							{totalActiveProposalsCount?.['bountiesCount'] ? `[${totalActiveProposalsCount?.['bountiesCount']}]` : ''}
						</span>
					</div>,
					'/bounties',
					null
				),
				getSiderMenuItem(
					<div className='flex items-center gap-1.5'>
						Child Bounties
						<span className='text-[10px] text-[#96A4B6] dark:text-[#595959]'>
							{totalActiveProposalsCount?.['childBountiesCount'] ? `[${totalActiveProposalsCount?.['childBountiesCount']}]` : ''}
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
		<Layout className={className}>
			<NavHeader
				theme={theme as any}
				sidedrawer={sidedrawer}
				setSidedrawer={setSidedrawer}
				previousRoute={previousRoute}
				displayName={mainDisplay}
				isVerified={isGood && !isIdentityUnverified}
				isIdentityExists={isIdentitySet}
			/>

			{/* {userId && <TopNudges />} */}
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
			{onchainIdentitySupportedNetwork.includes(network) && (
				<>
					<OnchainIdentity
						open={open}
						setOpen={setOpen}
						openAddressModal={openAddressLinkedModal}
						setOpenAddressModal={setOpenAddressLinkedModal}
					/>
				</>
			)}

			<Footer theme={theme as any} />
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
					{/* <DelegationDashboardEmptyState /> */}
					<ImageIcon
						src='/assets/icons/delegation-empty-state.svg'
						alt='delegation empty state icon'
					/>
					<span className='dark:text-white'>Please use your desktop computer to verify on chain identity</span>
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
