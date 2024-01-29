// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DashboardTrackListing from './TracksListing';
import dynamic from 'next/dynamic';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { network as AllNetworks } from '~src/global/networkConstants';
import { Button, Skeleton, Tabs, TabsProps } from 'antd';
import DelegationProfile from '~src/ui-components/DelegationProfile';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import BecomeDelegate from './BecomeDelegate';
import TrendingDelegates from './TrendingDelegates';
import TotalDelegationData from './TotalDelegationData';

interface Props {
	className?: string;
}

export const delegationSupportedNetworks = [AllNetworks.KUSAMA, AllNetworks.POLKADOT];

const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

const DelegationDashboardHome = ({ className }: Props) => {
	const userDetails = useUserDetailsSelector();
	const isLoggedOut = !userDetails.id;
	const { resolvedTheme: theme } = useTheme();
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		if (!window) return;
		setIsMobile(window.innerWidth < 768);
		// setOpenLoginModal(!(isMobile && isLoggedOut));
		if (!isLoggedOut) {
			setOpenLoginModal(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile, userDetails]);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsMobile(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.username, userDetails?.delegationDashboardAddress, isMobile]);

	const tabItems: TabsProps['items'] = [
		{
			children: (
				<>
					{isLoggedOut && <h2 className='mb-6 mt-5 text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high max-lg:pt-[60px] md:mb-5'>Delegation </h2>}
					<BecomeDelegate />
					<TotalDelegationData />
					<TrendingDelegates />
				</>
			),
			key: '1',
			label: 'Dashboard'
		},
		{
			children: (
				<>
					<BecomeDelegate />
					<DelegationProfile
						address={userDetails?.delegationDashboardAddress}
						username={userDetails?.username || ''}
						className='mt-8 rounded-xxl bg-white px-6 py-5 drop-shadow-md dark:bg-section-dark-overlay'
					/>
					<div className='mt-8 rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay'>
						{!!userDetails?.delegationDashboardAddress && userDetails?.delegationDashboardAddress?.length > 0 ? (
							<DashboardTrackListing
								theme={theme}
								address={String(userDetails.delegationDashboardAddress)}
							/>
						) : (
							<Skeleton />
						)}
					</div>
				</>
			),
			key: '2',
			label: 'My Delegation'
		}
	];

	return (
		<div className={`${className} delegation-dashboard`}>
			{isLoggedOut ? (
				<div className='wallet-info-board mt-[-25px] flex h-[60px] w-full items-center space-x-3 rounded-b-3xl pl-[70px] max-lg:absolute max-lg:left-0 max-lg:top-20'>
					<span className='text-sm font-medium text-white'>To get started with delegation on polkadot</span>
					<Button
						onClick={() => {
							setOpenLoginModal(true);
						}}
						className='border-2 border-[#3C5DCE] bg-[#407bff] text-sm font-medium text-white'
					>
						Connect wallet
					</Button>
				</div>
			) : (
				<div className='wallet-info-board gap mt-[-25px] flex h-[90px] rounded-b-3xl max-lg:absolute max-lg:left-0 max-lg:top-20 max-lg:w-[99.3vw]'>
					<ProfileBalances />
				</div>
			)}
			{isLoggedOut && <h2 className='mb-6 mt-5 text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high max-lg:pt-[60px] md:mb-5'>Delegation </h2>}

			{isLoggedOut && (
				<>
					<BecomeDelegate />
					<TotalDelegationData />
					<TrendingDelegates />
				</>
			)}

			{!isLoggedOut && userDetails.loginAddress && (
				<Tabs
					defaultActiveKey='2'
					items={tabItems}
					size='large'
					// type='card'
					className='mt-6 font-medium text-sidebarBlue dark:text-blue-dark-high'
				/>
			)}

			<LoginPopup
				closable={true}
				setSignupOpen={setOpenSignupModal}
				modalOpen={openLoginModal}
				setModalOpen={setOpenLoginModal}
				isModal={true}
				isDelegation={true}
			/>
			<SignupPopup
				closable={false}
				setLoginOpen={setOpenLoginModal}
				modalOpen={openSignupModal}
				setModalOpen={setOpenSignupModal}
				isModal={true}
				isDelegation={true}
			/>
		</div>
	);
};

export default styled(DelegationDashboardHome)`
	.wallet-info-board {
		margin-top: 0px;
		background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122c 0%, #a6075c 32.81%, #952863 77.08%, #e5007a 100%);
	}
	.delegate-button {
		background: linear-gradient(0deg, #e5007a, #e5007a), linear-gradient(0deg, rgba(229, 0, 122, 0.6), rgba(229, 0, 122, 0.6));
	}
	/* .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: ${(props) => (props.theme == 'dark' ? '' : 'white')} !important;
		border-top: ${(props) => (props.theme == 'dark' ? 'none' : 'white')} !important;
		border-left: ${(props) => (props.theme == 'dark' ? 'none' : 'white')} !important;
		border-right: ${(props) => (props.theme == 'dark' ? 'none' : 'white')} !important;
		border-bottom-color: ${(props) => (props.theme == 'dark' ? '#4B4B4B' : '#e1e6eb')} !important;
	} */
	.ant-tabs-tab {
		border-bottom-color: ${(props) => (props.theme == 'dark' ? 'white' : '')} !important;
		margin-left: 2px !important;
		padding-left: 8px !important;
		padding-right: 8px !important;
		background-color: ${(props) => (props.theme == 'dark' ? '#000' : '')} !important;
	}
	.ant-tabs-nav::before {
		border-bottom: ${(props) => (props.theme == 'dark' ? 'white' : '')} !important;
	}

	.ant-tabs-nav-list::after {
		content: '';
		width: 100%;
		border-bottom: ${(props) => (props.theme == 'dark' ? '1px #4B4B4B solid' : '1px solid #e1e6eb')} !important;
	}

	.ant-tabs-tab-active {
		/* background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important; */
		/* border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '')} !important; */
		/* border-bottom: ${(props) => (props.theme == 'dark' ? 'none' : '')} !important; */
		/* color: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important; */
	}
	.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
		color: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;
	}
	.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active,
	.ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab-active {
		color: ${(props) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;
	}

	/* .ant-tabs-tab-bg-white .ant-tabs-nav:before {
		border-bottom: 1px solid #e1e6eb;
	} */
	/* .ant-tabs-nav-operations > button {
		color: ${(props) => (props.theme == 'dark' ? '#fff' : '#e5007a')} !important;
	} */

	.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
		/* For tabs border */
		border-color: none;
	}

	.ant-tabs-top > .ant-tabs-nav::before {
		/* For the line to the right and close to the tabs */
		border-color: none;
	}

	.ant-tabs > .ant-tabs-nav {
		/* So that there is no gap between the content and tabs */
		/* margin-bottom: 0; */
	}
`;
