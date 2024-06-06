// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { Button } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import BecomeDelegate from './BecomeDelegate';
import TrendingDelegates from './TrendingDelegates';
import TotalDelegationData from './TotalDelegationData';
import DelegationTabs from './DelegationTabs';
import { useApiContext, usePeopleKusamaApiContext } from '~src/context';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';

interface Props {
	className?: string;
}

const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

const DelegationDashboardHome = ({ className }: Props) => {
	const userDetails = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleKusamaApi, peopleKusamaApiReady } = usePeopleKusamaApiContext();
	const { network } = useNetworkSelector();
	const isLoggedOut = !userDetails.id;
	const { resolvedTheme: theme } = useTheme();
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);

	useEffect(() => {
		if (!window) return;
		setIsMobile(window.innerWidth < 768);
		if (!isLoggedOut) {
			setOpenLoginModal(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile, userDetails]);

	const handleIdentityInfo = async () => {
		const apiPromise = network == 'kusama' ? peopleKusamaApi : api;
		const apiPromiseReady = network == 'kusama' ? peopleKusamaApiReady : apiReady;
		if (!apiPromise || !apiPromiseReady) return;

		const info = await getIdentityInformation({
			address: userDetails.delegationDashboardAddress || '',
			api: apiPromise,
			apiReady: apiPromiseReady,
			network: network
		});
		setIdentity(info);
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		handleIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, peopleKusamaApi, peopleKusamaApiReady]);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsMobile(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.username, userDetails?.delegationDashboardAddress, isMobile]);

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
			{(isLoggedOut || !userDetails.loginAddress) && (
				<h2 className='mb-6 mt-5 text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high max-lg:pt-[60px] md:mb-5'>Delegation </h2>
			)}

			{(isLoggedOut || !userDetails.loginAddress) && (
				<>
					<BecomeDelegate onchainUsername={identity?.display || identity?.legal || ''} />
					<TotalDelegationData />
					<TrendingDelegates />
				</>
			)}

			{!isLoggedOut && userDetails.loginAddress && (
				<DelegationTabs
					identity={identity}
					theme={theme}
					isLoggedOut={isLoggedOut}
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
`;
