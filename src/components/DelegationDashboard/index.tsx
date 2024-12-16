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
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { userDetailsActions } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';
import BecomeDelegateSmall from './smallScreenComponents/BecomeDelegateSmall';
import TotalDelegationDataSmall from './smallScreenComponents/TotalDelegationDataSmall';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
}

const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

const DelegationDashboardHome = ({ className }: Props) => {
	const { t } = useTranslation('common');
	const userDetails = useUserDetailsSelector();
	const dispatch = useDispatch();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
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
		if (!api && !peopleChainApi) return;

		const info = await getIdentityInformation({
			address: userDetails.delegationDashboardAddress || '',
			api: peopleChainApi ?? api,
			network: network
		});
		setIdentity(info);
	};

	useEffect(() => {
		handleIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, peopleChainApi, peopleChainApiReady]);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsMobile(true);
		}
		if (!userDetails.delegationDashboardAddress && !!userDetails.loginAddress) {
			dispatch(userDetailsActions.updateDelegationDashboardAddress(userDetails.loginAddress));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.username, userDetails?.delegationDashboardAddress]);

	return (
		<div className={`${className} delegation-dashboard`}>
			{isLoggedOut || !userDetails.loginAddress ? (
				<div className='wallet-info-board min-sm:absolute min-sm:left-0 min-sm:top-20 mt-[-25px] hidden h-[60px] w-full items-center space-x-3 rounded-b-3xl pl-6 sm:flex'>
					<span className='text-sm font-medium text-white'>{t('get_started_with_delegation')}</span>
					<Button
						onClick={() => {
							setOpenLoginModal(true);
						}}
						className='border-2 border-[#3C5DCE] bg-[#407bff] text-sm font-medium font-semibold text-white'
					>
						{t('connect_wallet')}
					</Button>
				</div>
			) : (
				<div className='wallet-info-board h-[50px] rounded-b-3xl max-lg:absolute max-lg:left-0 max-lg:-mt-28 max-lg:w-[99.3vw] max-sm:mt-[-65px] sm:h-[90px] lg:left-0 lg:-mt-10 '>
					<ProfileBalances />
				</div>
			)}
			{(isLoggedOut || !userDetails.loginAddress) && <BecomeDelegateSmall />}

			{(isLoggedOut || !userDetails.loginAddress) && (
				<div className='hidden sm:block'>
					<h2 className='mb-6 mt-5 text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high md:mb-5'>{t('delegation')}</h2>
				</div>
			)}

			{(isLoggedOut || !userDetails.loginAddress) && (
				<>
					<BecomeDelegate onchainUsername={identity?.display || identity?.legal || ''} />
					<TotalDelegationData className='hidden sm:block' />
					<TotalDelegationDataSmall
						setOpenLoginModal={setOpenLoginModal}
						className='sm:hidden'
					/>
					<TrendingDelegates theme={theme} />
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
