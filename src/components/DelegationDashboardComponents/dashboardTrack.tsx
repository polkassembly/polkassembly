// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ProfileBalances from './profileBalance';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import styled from 'styled-components';
import { RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';
import { EStatus, GetTracksColumns } from './coloumn';
import { Table } from 'antd';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';
import { DelegatedIcon } from '~src/ui-components/CustomIcons';
import ActiveProposals from './activeProposals';
import Delegate from './delegate';

interface Props{
  className?: string;
}
interface ITrackDetails{
  name: string;
  dashboardDescription: string;
}

export interface IData{
  index: number;
  delegatedTo: string;
  conviction: string;
  balance: string;
  delegatedOn: string;
  action:string;
}

const DashboardTrackListing = ( { className }: Props ) => {

	const { addresses } = useUserDetailsContext();
	const { query : { track } } = useRouter();
	const [status, setStatus] = useState(EStatus.Delegated);
	const router = useRouter();

	const handleReroute = ( route: string ) => {
		if(route.length === 0){
			return;
		}
		route = route.toLowerCase();
		if(route === 'dashboard'){
			router.push('/delegation-dashboard');
		}else{
			router.push(`/delegation-dashboard/${route}`);
		}

	};
	const handleTrack = ( track: string ) => {
		const firstPart = track.split('-')[0];
		const secondPart = track.split('-')[1] ? track.split('-')[1] : '';
		const trackName = `${firstPart.charAt(0).toUpperCase() + firstPart.slice(1)} ${secondPart.length > 0 ? secondPart.charAt(0).toUpperCase() + secondPart.slice(1) : ''}`;
		return trackName;
	};

	const rowData: IData[] = [
		{ action: 'Undelegated',balance: '400 KSM', conviction: '1x', delegatedOn: '17th Jun 2023', delegatedTo: '0x4b809cCF39fF19B0ef43172c3578a188Ffb6a1f3', index: 1 }
	];

	return <div className={`${className}`}>
		<div className='h-[90px] wallet-info-board rounded-b-[20px] flex gap mt-[-25px] ml-[-53px] mr-[-53px]'>
			<ProfileBalances address={addresses && addresses.length > 0 ? addresses[0] : ''}/>
		</div>
		<div className='flex gap-2 mb-4 md:mb-5 mt-5 dashboard-heading items-center'>
			<span className='text-sm cursor-pointer' onClick={() => handleReroute('dashboard')}>Dashboard</span>
			<span className='mt-[-2px]'>
				<RightOutlined className='text-xs' />
			</span>
			<span className='text-pink_primary text-sm cursor-pointer' onClick={() => handleReroute(track && !Array.isArray(track) ? track : '')}>
				{handleTrack(track && !Array.isArray(track) ? track : '')}
			</span>
		</div>
		<div className='border-solid border-[1px] border-[#D2D8E0] rounded-[14px] py-6 px-9 shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] bg-white'>
			<div className='text-[28px] font-semibold tracking-[0.0015em] text-[#243A57] flex gap-3 items-center'>{handleTrack(track && !Array.isArray(track) ? track : '')}
				<span className={`text-[12px] ${status === EStatus.Received_Delegation && 'bg-[#E7DCFF]'} ${status === EStatus.Delegated && 'bg-[#FFFBD8]'} ${status === EStatus.Undelegated && 'bg-[#FFDAD8]'} rounded-[26px] py-[6px] px-[12px] text-center`}>
					{status?.split('_').join(' ').charAt(0).toUpperCase()+status?.split('_').join(' ').slice(1)}
				</span>
			</div>
			<h4 className='mt-[19px] text-sm text-[#243A57] tracking-[0.01em]'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque enim erat, blandit ac fringilla et, ultricies eget nibh. Fusce bibendum, dui vehicula faucibus blandit, tellus nibh aliquet velit, at interdum eros nulla non enim. Integer iaculis et ex sit amet scelerisque. In felis diam, porta ac eleifend et, blandit ac est. Praesent eu efficitur purus. Cras sollicitudin et ipsum ut mattis. Morbi placerat imperdiet massa. Aenean sit amet sapien augue.
			</h4>
			{status === EStatus.Delegated || EStatus.Received_Delegation && <div className='bg-white mt-6 border-[1px] border-solid rounded-[6px] pl-[3px] pr-[3px] border-[#D2D8E0] bg-transparent'>
				<Table
					className= 'column'
					columns= { GetTracksColumns(status) }
					dataSource= { rowData }
					pagination={false}
				></Table>
			</div>}
			{status === EStatus.Undelegated && <div className='bg-white flex pt-[24px] items-center flex-col text-[169px] pb-[33px] rounded-b-[14px]'>
				<DelegatedIcon />
				<div className='text-[#243A57] mt-[18px] text-center'>
					<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
        Voting power for this track has not been delegated yet
						<div className='text-[#E5007A] font-normal tracking-wide text-sm ml-[11px] flex items-center justify-center  max-md:mt-[10px] cursor-pointer' >
							<DelegatedProfileIcon className='mr-[7px]'/>
							<span className='mt-[1px]'>
               Delegate Track
							</span>
						</div>
					</div>
				</div>
			</div>}
		</div>
		<div><ActiveProposals/></div>
		<div><Delegate/></div>
	</div>;
};

export default styled(DashboardTrackListing)`
.wallet-info-board {
  margin-top:0px;
  background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122C 0%, #A6075C 32.81%, #952863 77.08%, #E5007A 100%);
}
.column .ant-table-thead > tr > th{
  color:#485F7D !important;
  font-size: 14px;
  font-weight: 600px;
  line-height: 21px;
  text-align: center;
}
.column .ant-table-tbody{
border: 1px solid red !important;
}


`;