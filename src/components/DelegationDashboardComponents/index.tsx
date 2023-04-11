// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
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

interface Props {
  className?: string;
}

const DelegationDashboardHome = ({ className } : Props) => {

	const { username, picture, addresses } = useUserDetailsContext();

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
		console.log(data,error);
	};

	useEffect(() => {
		username && username?.length > 0 && getData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username]);

	return <div className= { `${ className } ` }>
		<div className='h-[90px] wallet-info-board rounded-b-[20px] flex gap mt-[-25px]'><Balance address={addresses ? addresses[0]:''}/></div>
		<h2 className='dashboard-heading mb-4 md:mb-5 mt-5'>Dashboard</h2>
		<div className='flex justify-between py-[24px] px-[34px] shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] bg-white h-[172px] rounded-[14px]'>
			<div className='flex justify-center gap-[34px] '>
				{picture !== null ? <div></div>: <div ><DashboardProfile/></div>}
				<div className=''>
					<span className='text-xl text-sidebarBlue font-semibold mb-4 tracking-wide'>{username}</span>
					{addresses && addresses?.length > 0 &&
        <div className='flex gap-2  items-center'> <Address address={addresses[0]} /><span className='flex items-center cursor-pointer' onClick={() => copyLink(addresses[0])}><CopyIcon/></span></div>}
					<h2 className='text-sm font-normal text-navBlue mt-2'>Click here to add bio</h2>
				</div>
			</div>
			<div className='flex gap-2.5 text-pink_primary'><MessengerIcon/><span><Button title='Edit' className='h-[40px] bg-transparent text-pink_primary border-pink_primary' icon={<EditIcon/>}>Edit</Button></span></div></div>
	</div>;
};

export default styled(DelegationDashboardHome)`
.wallet-info-board {
  margin-top:0px;
  background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122C 0%, #A6075C 32.81%, #952863 77.08%, #E5007A 100%);
}
` ;
