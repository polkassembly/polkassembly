// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @next/next/no-img-element */
/* eslint-disable sort-keys */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Layout, Menu as AntdMenu, Modal } from 'antd';
import { NextComponentType, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useApiContext, usePeopleChainApiContext } from 'src/context';
import styled from 'styled-components';
import { IActiveProposalCount } from '~src/types';
import Footer from './Footer';
import NavHeader from './NavHeader';
import { network as AllNetworks } from '~src/global/networkConstants';
import OpenGovHeaderBanner from './OpenGovHeaderBanner';
import dynamic from 'next/dynamic';
import { dmSans } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useGlobalSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { userDetailsActions } from '~src/redux/userDetails';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import Sidebar from './Sidebar';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { GlobalActions } from '~src/redux/global';

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

const { Content } = Layout;

export const onchainIdentitySupportedNetwork: Array<string> = [AllNetworks.POLKADOT, AllNetworks.KUSAMA, AllNetworks.POLKADEX];

interface Props {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}

const AppLayout = ({ className, Component, pageProps }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { is_sidebar_collapsed } = useGlobalSelector();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { loginAddress, addresses } = useUserDetailsSelector();
	const [sidedrawer, setSidedrawer] = useState<boolean>(false);
	// const [is_sidebar_collapsed, setIsSidebarCollapsed] = useState<boolean>(false);

	const router = useRouter();
	const [previousRoute, setPreviousRoute] = useState(router.asPath);
	const [open, setOpen] = useState<boolean>(false);
	const [identityMobileModal, setIdentityMobileModal] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(true);
	const [isIdentitySet, setIsIdentitySet] = useState<boolean>(false);
	const [isGood, setIsGood] = useState<boolean>(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const dispatch = useDispatch();
	const [totalActiveProposalsCount, setTotalActiveProposalsCount] = useState<IActiveProposalCount>();
	// const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' && window?.screen.width < 1024);
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const hideFooter = router?.pathname?.includes('/batch-voting') && isMobile;

	const headerRef = useRef<HTMLDivElement>(null); // Ref for header

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
		const handleResize = () => {
			const isMobile = window.innerWidth < 1024;
			setIsMobile(isMobile);

			if (!isMobile) {
				setSidedrawer(true);
				dispatch(GlobalActions.setIsSidebarCollapsed(false));
			} else {
				setSidedrawer(false);
				dispatch(GlobalActions.setIsSidebarCollapsed(true));
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		document.body.classList.remove('light-theme', 'dark-theme');
		document.body.classList.add(`${theme}-theme`);
	}, [theme]);

	useEffect(() => {
		if (isMobile) {
			const handleRouteChange = (url: string) => {
				setSidedrawer(false);
				if (url.split('/')[1] !== 'discussions' && url.split('/')[1] !== 'post') {
					setPreviousRoute(url);
				}
			};

			const handleBeforeUnload = () => setSidedrawer(false);

			router.events.on('routeChangeStart', handleRouteChange);
			window.addEventListener('beforeunload', handleBeforeUnload);

			return () => {
				router.events.off('routeChangeStart', handleRouteChange);
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
	}, [router, isMobile]);

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

	const handleVerifiedUserProposal = async () => {
		const promiseArr: any[] = [];
		if (!addresses?.length) return;

		addresses?.map((address) => {
			promiseArr?.push(getIdentityInformation({ address, api: peopleChainApi ?? api, network }));
		});

		try {
			const resolve = await Promise.all(promiseArr);
			const isVerified = !!resolve.find((info: any) => {
				return info?.isVerified;
			});
			dispatch(userDetailsActions.setIsUserOnchainVerified(isVerified));
			const displayNameInfo = resolve?.find((info: any) => {
				return !!(info?.displayParent || info?.display || info?.nickname || '')?.length;
			});
			setMainDisplay(displayNameInfo?.displayParent || displayNameInfo?.display || displayNameInfo?.nickname || '');
			setIsGood(isVerified);
			setIsIdentitySet(
				!!resolve.find((info: any) => {
					return !!(info?.displayParent || info?.display || info?.nickname || '')?.length;
				})
			);
			setIsIdentityUnverified(!isVerified);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;

		handleVerifiedUserProposal();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, peopleChainApi, peopleChainApiReady, loginAddress, network]);

	return (
		<div>
			<Layout className={`${className} relative`}>
				<div ref={headerRef}>
					<NavHeader
						theme={theme as any}
						sidedrawer={sidedrawer}
						setSidedrawer={setSidedrawer}
						previousRoute={previousRoute}
						displayName={mainDisplay}
						isVerified={isGood && !isIdentityUnverified}
						isIdentityExists={isIdentitySet}
					/>
				</div>
				<Layout hasSider>
					<div
						ref={sidebarRef}
						className='relative flex w-full gap-2'
					>
						{isMobile && sidedrawer && (
							<Sidebar
								className={`absolute left-0 top-0 z-[150]  w-full  ${className}`}
								sidebarCollapsed={false}
								setSidedrawer={setSidedrawer}
								sidedrawer={sidedrawer}
								setOpenAddressLinkedModal={setOpenAddressLinkedModal}
								setIdentityMobileModal={setIdentityMobileModal}
								totalActiveProposalsCount={totalActiveProposalsCount || { count: 0 }}
								isGood={isGood}
								mainDisplay={mainDisplay}
								isIdentitySet={isIdentitySet}
								isIdentityUnverified={isIdentityUnverified}
								setLoginOpen={setLoginOpen}
								setIdentityOpen={setOpen}
							/>
						)}
						{!isMobile && (
							<>
								<Sidebar
									className={className}
									sidebarCollapsed={is_sidebar_collapsed}
									sidedrawer={sidedrawer}
									setSidedrawer={setSidedrawer}
									setOpenAddressLinkedModal={setOpenAddressLinkedModal}
									setIdentityMobileModal={setIdentityMobileModal}
									totalActiveProposalsCount={totalActiveProposalsCount || { count: 0 }}
									isGood={isGood}
									mainDisplay={mainDisplay}
									isIdentitySet={isIdentitySet}
									isIdentityUnverified={isIdentityUnverified}
									setLoginOpen={setLoginOpen}
									setIdentityOpen={setOpen}
								/>
								<div className={`fixed  ${is_sidebar_collapsed ? 'left-16' : 'left-52'} top-12 z-[102]`}>
									{is_sidebar_collapsed ? (
										<div
											onClick={() => {
												if (is_sidebar_collapsed) {
													dispatch(GlobalActions.setIsSidebarCollapsed(false));
													setSidedrawer(true);
												}
											}}
											className='sidebar-toggle-button border border-solid border-[#D2D8E0] dark:border-[#4B4B4B] dark:bg-black dark:text-white'
										>
											<ImageIcon
												src={`${theme === 'dark' ? '/assets/darkclosenav.svg' : '/assets/closenav.svg'}`}
												alt='close nav'
											/>
										</div>
									) : (
										<div
											onClick={() => {
												if (!is_sidebar_collapsed) {
													dispatch(GlobalActions.setIsSidebarCollapsed(true));
													setSidedrawer(false);
												}
											}}
											className='sidebar-toggle-button border border-solid border-[#D2D8E0] dark:border-[#4B4B4B] dark:bg-black dark:text-white'
										>
											<ImageIcon
												src={`${theme === 'dark' ? '/assets/darkopennav.svg' : '/assets/opennav.svg'}`}
												alt='open nav'
											/>
										</div>
									)}
								</div>
							</>
						)}

						<div className={`relative w-full ${sidedrawer && isMobile ? 'no-scroll' : 'overflow-auto'}`}>
							{[''].includes(network) && ['/', '/opengov', '/gov-2'].includes(router.asPath) ? (
								<Layout className='min-h-[calc(100vh - 10rem)] relative flex w-full flex-row bg-[#F5F6F8] dark:bg-section-dark-background'>
									<OpenGovHeaderBanner network={network} />
									<div className='relative w-full'>
										{!isMobile ? (
											<div>
												<div className='flex flex-row'>
													<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
													<Content
														className={`${
															!is_sidebar_collapsed && '3xl:pl-0 pl-28'
														} mx-auto my-6 min-h-[90vh] w-[94vw] max-w-7xl flex-initial lg:w-[85vw] lg:opacity-100 2xl:w-5/6`}
													>
														<Component {...pageProps} />
													</Content>
												</div>
												{!hideFooter && (
													<Footer
														className={` ${!is_sidebar_collapsed && 'pl-[210px] pr-20'} `}
														theme={theme as any}
													/>
												)}
											</div>
										) : (
											<div className='relative mx-auto  w-full'>
												<div>
													<div className='my-6 px-3'>
														<Content>
															<Component {...pageProps} />
														</Content>
													</div>
													{!hideFooter && <Footer theme={theme as any} />}
												</div>
												{sidedrawer && (
													<div
														className='pointer-events-auto absolute inset-0 -top-5 z-[1999] bg-black bg-opacity-30'
														style={{
															marginLeft: '250px',
															right: 0,
															bottom: 0
														}}
													></div>
												)}
											</div>
										)}
									</div>
								</Layout>
							) : (
								<Layout className={`min-h-[calc(100vh - 10rem)] relative flex w-full flex-row bg-[#F5F6F8] dark:bg-section-dark-background ${hideFooter ? 'h-[100vh]' : ''}`}>
									<div className='relative w-full'>
										{!isMobile ? (
											<div className={`${!is_sidebar_collapsed && ''}`}>
												<div className='flex flex-row'>
													<div className='bottom-0 left-0 -z-50 hidden w-[80px] lg:block'></div>
													<Content
														className={`${
															!is_sidebar_collapsed && '3xl:pl-0 pl-28'
														} mx-auto my-6 min-h-[90vh] w-[94vw] max-w-7xl flex-initial lg:w-[85vw] lg:opacity-100 2xl:w-5/6`}
													>
														<Component {...pageProps} />
													</Content>
												</div>

												{!hideFooter && (
													<Footer
														className={` ${!is_sidebar_collapsed && 'pl-[210px] pr-20'} `}
														theme={theme as any}
													/>
												)}
											</div>
										) : (
											<div
												onClick={() => {
													setSidedrawer(false);
												}}
												className='relative mx-auto w-full'
											>
												<div>
													<div className='my-6 px-3'>
														<Content>
															<Component {...pageProps} />
														</Content>
													</div>
													{!hideFooter && <Footer theme={theme as any} />}
												</div>
												{sidedrawer && (
													<div
														className='pointer-events-auto absolute inset-0 -top-5 z-[1999] bg-black bg-opacity-30'
														style={{
															marginLeft: '250px',
															right: 0,
															bottom: 0
														}}
													></div>
												)}
											</div>
										)}
									</div>
								</Layout>
							)}
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
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>

			<Modal
				zIndex={100}
				open={identityMobileModal}
				footer={false}
				closeIcon={<CloseIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />}
				onCancel={() => setIdentityMobileModal(false)}
				className={`${dmSans.className} ${dmSans.variable} w-[600px] max-sm:w-full`}
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
		padding-left: 35px !important;
		margin-left: 20px !important;
	}

	li .ant-menu-item {
		margin-left: 20px !important;
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
	.sidebar .ant-menu-item-selected span {
		color: var(--pink_primary) !important;
		font-weight: 600 !important;
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

	.ant-menu-inline-collapsed-noicon {
		color: ${(props: any) => (props.theme == 'dark' ? '#909090' : '#485F7D')};
	}
	.no-scroll {
		overflow: hidden; /* This will disable scrolling */
		height: 90vh; /* Ensure it takes the full viewport height to avoid background scroll */
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
	.ant-menu-item {
		overflow: visible !important;
	}
	.sidebar-toggle-button {
		cursor: pointer;
		border-radius: 0.375rem;
		background-color: #ffffff;
		padding: 5px 6px;
		font-size: 16px;
		color: #485f7d;
	}
	.sidebar-toggle-button-header {
		border: 1px solid #d2d8e0;
		cursor: pointer;
		border-radius: 0.375rem;
		background-color: #ffffff;
		font-size: 16px;
		color: #485f7d;
	}

	.activeborder {
		border: 2px solid #e5007a;
		border-radius: 10px;
	}
	.activeborderhover {
		border: 1px solid transparent;
		border-radius: 10px;
	}
	.activeborderhover:hover {
		border: 1px solid #e5007a;
	}
	.hide-scrollbar::-webkit-scrollbar {
		width: 0px;
		height: 0px;
	}

	.hide-scrollbar {
		-ms-overflow-style: none; /* For Internet Explorer and Edge */
		scrollbar-width: none; /* For Firefox */
		overflow: hidden; /* Ensures no scrollbars for other browsers */
	}

	.width-content {
		@media (max-width: 1532px) and (min-width: 1700px) {
			margin-left: 0px;
		}
	}
`;
