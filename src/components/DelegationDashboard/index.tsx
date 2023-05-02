// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Address from '~src/ui-components/Address';
import copyToClipboard from 'src/util/copyToClipboard';
import EditProfile from '~src/components/UserProfile/EditProfile';

import CopyIcon from '~assets/icons/content-copy.svg';
import { useUserDetailsContext } from '~src/context';
import MessengerIcon from '~assets/icons/messenger.svg';
import DashboardProfile from '~assets/icons/dashboard-profile.svg';
import { Button, Skeleton, Tooltip, message } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProfileDetailsResponse } from '~src/auth/types';
import SocialLink from '~src/ui-components/SocialLinks';
import { socialLinks } from '../UserProfile/Details';
import DashboardTrackListing from './TracksListing';
import dynamic from 'next/dynamic';
import { EditIcon } from '~src/ui-components/CustomIcons';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { Wallet } from '~src/types';

interface Props {
  className?: string;
}

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});
const WalletConnectModal = dynamic(() => import('./DelegationWalletConnectModal'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});
const ProfileBalances = dynamic(() => import('./ProfileBalance'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

const DelegationDashboardHome = ({ className } : Props) => {

	const userDetails   = useUserDetailsContext();
	const [profileDetails, setProfileDetails] = useState<ProfileDetailsResponse>({
		addresses: [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: 0,
		username: ''
	});

	const { image, social_links, bio , username } = profileDetails;

	const [messageApi, contextHolder] = message.useMessage();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [openSignupModal, setOpenSignupModal] = useState<boolean>(false);

	useEffect(() => {
		if(!window) return;

		const wallet = localStorage.getItem('delegationWallet') || '';
		const address = localStorage.getItem('delegationDashboardAddress') || '';
		userDetails.setUserDetailsContextState((prev) =>
		{
			return { ...prev,
				delegationDashboardAddress: address ,
				loginWallet: wallet as Wallet
			};
		} );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {

		userDetails.isLoggedOut() && setOpenLoginModal(true);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.isLoggedOut]);

	const [openEditModal, setOpenEditModal] = useState<boolean>(false);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address:string) => {
		copyToClipboard(address);
	};

	const getData = async() => {
		const { data, error } = await nextApiClientFetch('api/v1/auth/data/userProfileWithUsername',
			{ username:userDetails.username?.toString() });

		if(data){ setProfileDetails({ ...profileDetails, ...data });}
		else{
			console.log(error);
		}

	};

	useEffect(() => {
		console.log(userDetails.delegationDashboardAddress, userDetails.loginWallet);
		if(!userDetails.delegationDashboardAddress){
			setOpenModal(true);
		}
		userDetails?.username && userDetails?.username?.length > 0 && getData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails?.username, userDetails?.delegationDashboardAddress]);

	return <div className= { `${ className }` }>
		<div className='h-[90px] wallet-info-board rounded-b-[20px] flex gap mt-[-25px] max-lg:w-[99.3vw] max-lg:absolute max-lg:left-0 max-lg:top-[80px]'>
			<ProfileBalances address={userDetails.delegationDashboardAddress}/>
		</div>
		<h2 className=' text-[#243A57] mb-6 md:mb-5 mt-5 text-[24px] font-semibold max-lg:pt-[60px]'>Dashboard</h2>
		<div className='flex justify-between py-[24px] px-[34px] shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] bg-white rounded-[14px]'>
			<div className='flex justify-center gap-[34px] '>
				{image && image?.length !== 0
					? <ImageComponent
						src={image}
						alt='User Picture'
						className='bg-transparent flex items-center justify-center w-[95px] h-[95px] '
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full border-4 border-solid rounded-full'
					/>: <div ><DashboardProfile/></div>}
				<div className='text-[#243A57]'>
					<span className='text-[#243A57] font-semibold mb-4 tracking-wide text-lg'>{userDetails?.username}</span >
					{userDetails.delegationDashboardAddress && userDetails?.delegationDashboardAddress.length > 0 ? <div className='flex gap-2  items-center'>
						<Address address={userDetails?.delegationDashboardAddress} displayInline className='text-[14px] text-[#243A57]' identiconSize={34} />
						<span className='flex items-center cursor-pointer' onClick={() => {userDetails?.delegationDashboardAddress && copyLink(userDetails?.delegationDashboardAddress) ;success();}}>
							{contextHolder}
							<CopyIcon/>
						</span>
					</div> : <Skeleton className='mt-4'/>}

					{bio?.length === 0
						? <h2 className={`text-sm font-normal text-[#576D8BCC] mt-2  ${username === userDetails.username && 'cursor-pointer'}`} onClick={() => setOpenEditModal(true)}>
							{username === userDetails.username ? 'Click here to add bio' : 'No Bio' }
						</h2>
						: <h2  onClick={() => setOpenEditModal(true)} className='text-sm mt-2 text-[#243A57] tracking-[0.01em] cursor-pointer font-normal'>{bio}</h2>
					}

					<div
						className='flex items-center text-xl text-navBlue gap-x-5 md:gap-x-3 mt-[10px]'
					>
						{
							socialLinks?.map((social, index) => {
								const link = (social_links && Array.isArray(social_links))? social_links?.find((s) => s.type === social)?.link || '': '';
								return (
									<SocialLink
										className='flex items-center justify-center text-2xl  text-[#96A4B6] hover:text-[#576D8B] p-[10px] bg-[#edeff3] rounded-[20px] h-[39px] w-[40px] mt-4'
										key={index}
										link={link}
										disable={!link}
										type={social}
										iconClassName={`text-[20px] ${link ? 'text-[#576D8B]' : 'text-[#96A4B6]'}`}

									/>
								);
							})
						}
					</div>
				</div>
			</div>

			<div className='flex gap-2.5 text-pink_primary'>
				<Tooltip
					title='Coming Soon' key={1} color='linear-gradient(0deg, #5A46FF, #5A46FF), linear-gradient(0deg, #AD00FF, #AD00FF), linear-gradient(0deg, #407BFF, #407BFF), #FFFFFF'>
					<MessengerIcon/>
				</Tooltip>
				<span>
					{username === userDetails.username && <Button onClick={() => setOpenEditModal(true)} className='text-[#E5007A] border-[1px] border-solid border-[#E5007A] h-[40px] w-[87px] max-lg:w-auto font-medium'>
						<EditIcon className='text-[#E5007A] text-[14px] tracking-wide ' />
						<span className='max-md:hidden'>
					Edit
						</span>
					</Button>
					}
				</span>
			</div>

		</div>
		<div >
			{userDetails?.delegationDashboardAddress.length> 0 ? <DashboardTrackListing className='mt-8 bg-white shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] rounded-[14px]' address={String(userDetails.delegationDashboardAddress)}/> : <Skeleton/>}
		</div>
		{!openLoginModal && !openSignupModal && !userDetails.loginWallet && <WalletConnectModal open={openModal} setOpen={setOpenModal} />}
		<LoginPopup closable={false} setSignupOpen={setOpenSignupModal} modalOpen={openLoginModal} setModalOpen={setOpenLoginModal} isModal={true} isDelegation={true}/>
		<SignupPopup closable={false} setLoginOpen={setOpenLoginModal} modalOpen={openSignupModal} setModalOpen={setOpenSignupModal} isModal={true} isDelegation={true} />

		{openEditModal  && username === userDetails.username &&
				<EditProfile openModal={openEditModal} setOpenModal={setOpenEditModal} data={profileDetails} setProfileDetails={setProfileDetails}/>
		}
	</div>;
};

export default styled(DelegationDashboardHome)`
.wallet-info-board {
  margin-top:0px;
  background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122C 0%, #A6075C 32.81%, #952863 77.08%, #E5007A 100%);
}
` ;
