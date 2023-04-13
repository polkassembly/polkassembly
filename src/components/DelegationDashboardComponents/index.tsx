// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Address from '~src/ui-components/Address';
import copyToClipboard from 'src/util/copyToClipboard';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';

import CopyIcon from '~assets/icons/content-copy.svg';
import { useUserDetailsContext } from '~src/context';
import MessengerIcon from '~assets/icons/messenger.svg';
import DashboardProfile from '~assets/icons/dashboard-profile.svg';
import { Button } from 'antd';
import { EditIcon } from '~src/ui-components/CustomIcons';
import Balance from '../Balance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProfileDetailsResponse } from '~src/auth/types';
import SocialLink from '~src/ui-components/SocialLinks';
import { socialLinks } from '../UserProfile/Details';
import DashboardTrackListing from './tracksListing';

interface Props {
  className?: string;
}

const DelegationDashboardHome = ({ className } : Props) => {

	const { username, addresses } = useUserDetailsContext();
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
	const { image, social_links } = profileDetails;

	const copyLink = (address:string) => {
		copyToClipboard(address);
		queueNotification({
			header: 'Copied!',
			message: 'Address copied to clipboard.',
			status: NotificationStatus.INFO
		});
	};
	const getData = async() => {
		const { data, error } = await nextApiClientFetch('api/v1/auth/data/userProfileWithUsername',
			{ username:username?.toString() });
		if(data){ setProfileDetails({ ...profileDetails, ...data });}
		else{ console.log(error); }
		console.log(data,error);

	};

	useEffect(() => {
		username && username?.length > 0 && getData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username]);

	return <div className= { `${ className } ` }>
		<div className='h-[90px] wallet-info-board rounded-b-[20px] flex gap mt-[-25px]'><Balance address={addresses ? addresses[0]:''}/></div>
		<h2 className='dashboard-heading mb-4 md:mb-5 mt-5'>Dashboard</h2>
		<div className='flex justify-between py-[24px] px-[34px] shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] bg-white rounded-[14px]'>
			<div className='flex justify-center gap-[34px] '>
				{image?.length !== 0 ? <div></div>: <div ><DashboardProfile/></div>}
				<div className=''>
					<span className='text-sidebarBlue font-semibold mb-4 tracking-wide text-lg'>{username}</span>
					{addresses && addresses?.length > 0 &&
        <div className='flex gap-2  items-center'><Address address={addresses[0]} /><span className='flex items-center cursor-pointer' onClick={() => copyLink(addresses[0])}><CopyIcon/></span></div>}
					<h2 className='text-sm font-normal text-navBlue mt-2'>Click here to add bio</h2>
					<div
						className='flex items-center text-xl text-navBlue gap-x-5 md:gap-x-3 mt-[10px]'
					>
						{
							socialLinks?.map((social, index) => {
								const link = (social_links && Array.isArray(social_links))? social_links?.find((s) => s.type === social)?.link || '': '';
								return (
									<SocialLink
										className='flex items-center justify-center text-2xl md:text-base text-[#96A4B6] hover:text-[#576D8B] p-[10px] bg-[#edeff3] rounded-[20px] h-[39px] w-[40px]'
										key={index}
										link={link}
										disable={!link}
										type={social}
									/>
								);
							})
						}
					</div>
				</div>
			</div>
			<div className='flex gap-2.5 text-pink_primary'><MessengerIcon/><span><Button title='Edit' className='h-[40px] bg-transparent text-pink_primary border-pink_primary' icon={<EditIcon/>}>Edit</Button></span></div></div>
		<div ><DashboardTrackListing className='mt-8 bg-white shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] rounded-[14px]'/></div>
	</div>;
};

export default styled(DelegationDashboardHome)`
.wallet-info-board {
  margin-top:0px;
  background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122C 0%, #A6075C 32.81%, #952863 77.08%, #E5007A 100%);
}
` ;
