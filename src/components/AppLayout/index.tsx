// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @next/next/no-img-element */
/* eslint-disable sort-keys */
import { Layout, Modal } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useApiContext } from 'src/context';
import styled from 'styled-components';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import Footer from './Footer';
import NavHeader from './NavHeader';
import dynamic from 'next/dynamic';
import { poppins } from 'pages/_app';

import { CloseIcon } from '~src/ui-components/CustomIcons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import TopNudges from '~src/ui-components/TopNudges';
import ImageIcon from '~src/ui-components/ImageIcon';
import { onchainIdentitySupportedNetwork } from '../Post/Tabs/PostStats/util/constants';
import { IAppLayout } from './types';
import Sidebar from './Sidebar';

const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

const AppLayout = ({ className, Component, pageProps }: IAppLayout) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { loginAddress, id: userId } = useUserDetailsSelector();
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

	// const [notificationVisible, setNotificationVisible] = useState(true);
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
				setIsIdentitySet(!!info.identity.display);
				setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginAddress]);

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

			{userId && (
				<TopNudges
					handleSetIdentityClick={handleIdentityButtonClick}
					isIdentitySet={isIdentitySet}
					isIdentityUnverified={isIdentityUnverified}
				/>
			)}
			<Sidebar
				Component={Component}
				displayName={mainDisplay}
				isVerified={isGood || !isIdentityUnverified}
				isIdentityExists={isIdentitySet || false}
				pageProps={pageProps}
				setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				setOpenIdentityModal={setOpen}
			/>
			{onchainIdentitySupportedNetwork.includes(network) && (
				<>
					<OnChainIdentity
						open={open}
						setOpen={setOpen}
						openAddressLinkedModal={openAddressLinkedModal}
						setOpenAddressLinkedModal={setOpenAddressLinkedModal}
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
