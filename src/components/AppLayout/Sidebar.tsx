import { Layout, Menu as AntdMenu, MenuProps } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
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
	RootIcon,
	WishForChangeIcon,
	UpgradeCommitteePIPsIcon,
	CommunityPIPsIcon,
	ArchivedIcon,
	RoundedDollarIcon
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
import getUserDropDown, { getSiderMenuItem } from './menuUtils';
import { trackEvent } from 'analytics';

const { Sider } = Layout;

const Menu = styled(AntdMenu)`
	.ant-menu-item-selected {
		.ant-menu-title-content > span {
			color: var(--pink_primary) !important;
		}
		.ant-menu-item-icon {
			color: var(--pink_primary) !important;
		}
		background: ${(props) => (props.theme === 'dark' ? 'none' : '#fff')} !important;
	}
`;

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
				<div className='flex items-center justify-between py-1'>
					<span>All</span>
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
					<OverviewIcon className='scale-90 pt-2 font-medium text-lightBlue dark:text-icon-dark-inactive' />
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

		getSiderMenuItem('Overview', '/opengov', <OverviewIcon className='mt-1 h-5 w-5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='mt-1.5 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1 scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />)
	];

	if (isGrantsSupported(network)) {
		gov2OverviewItems.splice(3, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='scale-90 font-medium text-lightBlue  dark:text-icon-dark-inactive' />));
	}

	let gov2Items: MenuProps['items'] = [
		...gov2OverviewItems,
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
		if (['userMenu'].includes(menuItem.key)) return;
		router.push(menuItem.key);
	};

	const handleLogout = async (username: string) => {
		dispatch(logout());
		router.push('/');
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

	const menuItems = [
		userDropdown,
		getSiderMenuItem('Overview', '/', <OverviewIcon className='scale-90' />),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='scale-90' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='scale-90' />),
		getSiderMenuItem('Treasury', '/treasury', <TreasuryGroupIcon className='scale-90' />)
	];

	if (network === 'polkadot') {
		menuItems.push(
			getSiderMenuItem('Democracy', '/democracy', <DemocracyProposalsIcon className='scale-90' />),
			getSiderMenuItem('Bounties', '/bounties', <BountiesIcon className='scale-90' />),
			getSiderMenuItem('Motions', '/motions', <MotionsIcon className='scale-90' />)
		);
	} else if (network === 'kusama') {
		menuItems.push(
			getSiderMenuItem('Referenda', '/referenda', <ReferendaIcon className='scale-90' />),
			getSiderMenuItem('Tech. Comm.', '/tech-comm', <TechComProposalIcon className='scale-90' />)
		);
	}

	if (isOpenGovSupported(network)) {
		menuItems.push(
			getSiderMenuItem('Governance', '/governance', <GovernanceGroupIcon className='scale-90' />),
			getSiderMenuItem('Fellowship', '/fellowship', <FellowshipGroupIcon className='scale-90' />)
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

	let sidebarItems = !sidedrawer ? collapsedItems : items;

	if (isOpenGovSupported(network)) {
		sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	}

	if (isMobile) {
		sidebarItems = [username && isMobile ? userDropdown : null, ...sidebarItems];
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
			className={`sidebar fixed bottom-0 left-0 z-[101] h-screen ${sidebarCollapsed ? 'min-w-[80px]' : 'min-w-[230px]'} overflow-y-hidden bg-white dark:bg-section-dark-overlay`}
		>
			<div className='flex h-full flex-col'>
				<div className='flex flex-col'>
					<Menu
						theme={theme as any}
						mode='inline'
						selectedKeys={[router.pathname]}
						items={gov2Items.slice(0, 1)}
						className={`${username ? 'auth-sider-menu' : ''}  dark:bg-section-dark-overlay`}
					/>
					{!sidebarCollapsed ? (
						<>
							<div className=' flex justify-center gap-2'>
								<div className='group relative '>
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
										<div className='absolute bottom-10 left-12 mb-2 hidden w-[90px] -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											On-chain identity
											<div className='absolute left-4 top-7 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>

								<div className='group relative '>
									<Link href='/leaderboard'>
										<img
											src='/assets/head2.svg'
											alt='Head 2'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											Leaderboard
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative '>
									<Link href='/delegation'>
										<img
											src='/assets/head3.svg'
											alt='Head 3'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											Delegation
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative '>
									<Link href='/calendar'>
										<img
											src='/assets/head4.svg'
											alt='Head 4'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute -left-4 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											Calendar
											<div className='absolute left-16 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
							</div>
						</>
					) : (
						<>
							<div className=' ml-5 flex flex-col justify-center gap-2'>
								<div className='group relative '>
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
										<div className='absolute -bottom-16 left-5 z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
											On-chain identity
											<div className='absolute left-6 top-[-3px] -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative '>
									<Link href='/leaderboard'>
										<img
											src='/assets/head2.svg'
											alt='Head 2'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-5 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-[2px] py-[6px] text-[11px] font-semibold text-white group-hover:block'>
											Leaderboard
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative '>
									<Link href='/delegation'>
										<img
											src='/assets/head3.svg'
											alt='Head 3'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-5 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
											Delegation
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative '>
									<Link href='/calendar'>
										<img
											src='/assets/head4.svg'
											alt='Head 4'
											className='h-10 w-10 cursor-pointer'
										/>
										<div className='absolute bottom-full left-5 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
											Calendar
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
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
									<Link href='https://townhallgov.com/'>
										<img
											src='/assets/foot1.svg'
											alt='Foot1'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											Townhall
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://polkasafe.xyz/'>
										<img
											src='/assets/foot2.svg'
											alt='Foot2'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											Polkasafe
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://collectives.polkassembly.io/'>
										<img
											src='/assets/foot3.svg'
											alt='Foot3'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
											Fellowship
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://staking.polkadot.cloud/#/overview'>
										<img
											src='/assets/foot4.svg'
											alt='Foot4'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute -left-0 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-[13px] font-semibold text-white group-hover:block'>
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
						<div className='fixed bottom-0  left-0 w-full py-3'>
							<div className='mt-10 flex flex-col items-center justify-center gap-2'>
								<div className='group relative'>
									<Link href='https://townhallgov.com/'>
										<img
											src='/assets/foot1.svg'
											alt='Foot1'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
											Townhall
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://polkasafe.xyz/'>
										<img
											src='/assets/foot2.svg'
											alt='Foot2'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[11px] font-semibold text-white group-hover:block'>
											Polkasafe
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://collectives.polkassembly.io/'>
										<img
											src='/assets/foot3.svg'
											alt='Foot3'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[10px] font-semibold text-white group-hover:block'>
											Fellowship
											<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
										</div>
									</Link>
								</div>
								<div className='group relative'>
									<Link href='https://staking.polkadot.cloud/#/overview'>
										<img
											src='/assets/foot4.svg'
											alt='Foot4'
											className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2'
										/>
										<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-[10px] font-semibold text-white group-hover:block'>
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