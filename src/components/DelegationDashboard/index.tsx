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
import { Wallet } from '~src/types';
import { Skeleton } from 'antd';
import DelegationProfile from '~src/ui-components/DelegationProfile';

interface Props {
  className?: string;
}

const WalletConnectModal = dynamic(() => import('./DelegationWalletConnectModal'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});
const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

const DelegationDashboardHome = ({ className } : Props) => {

	const userDetails = useUserDetailsContext();

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);
	const[isMobile, setIsMobile] = useState<boolean>(false);
	useEffect(() => {
		if(!window ) return;
		const wallet = localStorage.getItem('delegationWallet') || '';
		const address = localStorage.getItem('delegationDashboardAddress') || '';
		(!userDetails?.delegationDashboardAddress || !userDetails?.loginWallet) && userDetails.setUserDetailsContextState((prev) =>
		{
			return { ...prev,
				delegationDashboardAddress: address || userDetails?.delegationDashboardAddress  ,
				loginWallet: wallet as Wallet
			};
		} );
		if(window.innerWidth < 768){
			setIsMobile(true);
		}
		isMobile ? userDetails.isLoggedOut() && setOpenLoginModal(false) : userDetails.isLoggedOut() && setOpenLoginModal(true);
		!userDetails.isLoggedOut() && setOpenLoginModal(false);

	}, [userDetails,isMobile]);

	useEffect(() => {
		if(!userDetails.delegationDashboardAddress && window.innerWidth > 768){
			setOpenModal(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.username, userDetails?.delegationDashboardAddress]);

	return <div className= { `${ className }` }>
		<div className='h-[90px] wallet-info-board rounded-b-[20px] flex gap mt-[-25px] max-lg:w-[99.3vw] max-lg:absolute max-lg:left-0 max-lg:top-[80px]'>
			<ProfileBalances address={userDetails.delegationDashboardAddress}/>
		</div>
		<h2 className=' text-[#243A57] mb-6 md:mb-5 mt-5 text-[24px] font-semibold max-lg:pt-[60px]'>Delegation dashboard</h2>
		<DelegationProfile address={userDetails?.delegationDashboardAddress} username={userDetails?.username || ''} className='py-[24px] px-[34px]'/>
		<div >
			{userDetails?.delegationDashboardAddress.length> 0 ? <DashboardTrackListing className='mt-8 bg-white shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] rounded-[14px]' address={String(userDetails.delegationDashboardAddress)}/> : <Skeleton/>}
		</div>
		{!openLoginModal && !openSignupModal && !userDetails.loginWallet && <WalletConnectModal open={openModal} setOpen={setOpenModal} />}
		<LoginPopup closable={false} setSignupOpen={setOpenSignupModal} modalOpen={openLoginModal} setModalOpen={setOpenLoginModal} isModal={true} isDelegation={true}/>
		<SignupPopup closable={false} setLoginOpen={setOpenLoginModal} modalOpen={openSignupModal} setModalOpen={setOpenSignupModal} isModal={true} isDelegation={true} />
	</div>;
};

export default styled(DelegationDashboardHome)`
.wallet-info-board {
  margin-top:0px;
  background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122C 0%, #A6075C 32.81%, #952863 77.08%, #E5007A 100%);
}
` ;
