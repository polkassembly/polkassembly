// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUserDetailsContext } from '~src/context';
import DashboardTrackListing from './TracksListing';
import dynamic from 'next/dynamic';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { Skeleton } from 'antd';
import DelegationProfile from '~src/ui-components/DelegationProfile';
import { Wallet } from '~src/types';

interface Props {
	className?: string;
}

const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});
const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

const DelegationDashboardHome = ({ className }: Props) => {
	const userDetails = useUserDetailsContext();

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		if (!window) return;
		const wallet = localStorage.getItem('delegationWallet') || '';
		const address = localStorage.getItem('delegationDashboardAddress') || '';
		(!userDetails?.delegationDashboardAddress || !userDetails?.loginWallet) &&
			userDetails.setUserDetailsContextState((prev) => {
				return { ...prev, delegationDashboardAddress: address || userDetails?.delegationDashboardAddress, loginWallet: wallet as Wallet };
			});
		if (window.innerWidth < 768) {
			setIsMobile(true);
		}
		isMobile ? userDetails.isLoggedOut() && setOpenLoginModal(false) : userDetails.isLoggedOut() && setOpenLoginModal(true);
		!userDetails.isLoggedOut() && setOpenLoginModal(false);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMobile, userDetails]);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsMobile(true);
		}
		if (!userDetails.delegationDashboardAddress) {
			isMobile ? setOpenModal(false) : setOpenModal(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.username, userDetails?.delegationDashboardAddress, isMobile]);

	return (
		<div className={`${className} delegation-dashboard`}>
			<div className='wallet-info-board gap mt-[-25px] flex h-[90px] rounded-b-[20px] max-lg:absolute max-lg:left-0 max-lg:top-[80px] max-lg:w-[99.3vw]'>
				<ProfileBalances />
			</div>
			<h2 className=' mb-6 mt-5 text-[24px] font-semibold text-[#243A57] max-lg:pt-[60px] md:mb-5'>Delegation dashboard</h2>
			<DelegationProfile
				address={userDetails?.delegationDashboardAddress}
				username={userDetails?.username || ''}
				className='px-[34px] py-[24px]'
			/>
			<div>
				{userDetails?.delegationDashboardAddress.length > 0 ? (
					<DashboardTrackListing
						className='shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] mt-8 rounded-[14px] bg-white'
						address={String(userDetails.delegationDashboardAddress)}
					/>
				) : (
					<Skeleton />
				)}
			</div>
			{!openLoginModal && !openSignupModal && !userDetails.loginWallet && (
				<AddressConnectModal
					localStorageWalletKeyName='delegationWallet'
					localStorageAddressKeyName='delegationDashboardAddress'
					open={openModal}
					setOpen={setOpenModal}
					walletAlertTitle='Delegation dashboard'
				/>
			)}
			<LoginPopup
				closable={false}
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
`;
