// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { ColumnsType } from 'antd/es/table';
import Address from '~src/ui-components/Address';
import { IDataType } from './TracksListing';
import { IData } from './DashboardTrack';
import { Button } from 'antd';
import UndelegatedProfileIcon from '~assets/icons/undelegate-profile.svg';
import RootIcon from '~assets/delegation-tracks/root.svg';
import FellowshipAdminIcon from '~assets/delegation-tracks/fellowship-admin.svg';
import GeneralAdminIcon from '~assets/delegation-tracks/genral-admin.svg' ;
import LeaseAdminIcon from '~assets/delegation-tracks/lease-admin.svg';
import SmallTipperIcon from '~assets/delegation-tracks/small-tipper.svg';
import WhitelistedCallerIcon from '~assets/delegation-tracks/whitelisted-caller.svg';
import MediumSpenderIcon from '~assets/delegation-tracks/medium-spender.svg';
import StakingAdminIcon from '~assets/delegation-tracks/staking-admin.svg';
import TreasurerIcon from '~assets/delegation-tracks/treasurer.svg';
import AuctionAdminIcon from '~assets/delegation-tracks/auction-admin.svg';
import ReferendumCancellerIcon from '~assets/delegation-tracks/referendum-cancellor.svg';
import ReferendumKillerIcon from '~assets/delegation-tracks/referendum-killer.svg';
import BigSpenderIcon from '~assets/delegation-tracks/big-spender.svg';
import BigTipperIcon from '~assets/delegation-tracks/big-tipper.svg';
import SmallSpenderIcon from '~assets/delegation-tracks/small-spender.svg';

export enum EStatus {
  All = 'all',
	Delegated = 'delegated',
	Received_Delegation = 'received_delegation',
	Undelegated = 'undelegated',
}

export const handleTracksIcon =  (index:string ) => {

	if(index === 'Root' ){
		return <RootIcon/>;
	}else if(index === 'Treasurer'){
		return <TreasurerIcon/>;
	}else if(index === 'Whitelisted Caller' ){
		return <WhitelistedCallerIcon/>;
	} else if(index === 'Lease Admin'){
		return <LeaseAdminIcon/>;
	}
	else if(index ===  'General Admin' ){
		return <GeneralAdminIcon/>;
	}
	else if(index === 'Staking Admin' ){
		return <StakingAdminIcon/>;
	}else if( index === 'Fellowship Admin' ){
		return <FellowshipAdminIcon/>;
	}
	else if( index === 'Small Tipper' ){
		return <SmallTipperIcon/>;
	}
	else if( index === 'Medium Spender' ){
		return <MediumSpenderIcon/>;
	}
	else if( index === 'Small Spender' ){
		return <SmallSpenderIcon/>;
	}
	else if( index === 'Auction Admin' ){
		return <AuctionAdminIcon/>;
	}
	else if( index === 'Big Spender' ){
		return <BigSpenderIcon/>;
	}
	else if( index === 'Big Tipper' ){
		return <BigTipperIcon/>;
	}
	else if( index === 'Referendum Killer' ){
		return <ReferendumKillerIcon/>;
	}
	else if( index === 'Referendum Canceller' ){
		return <ReferendumCancellerIcon/>;
	}

	return null;
};
const GetColumns = (status :EStatus) => {

	const AllColumns: ColumnsType<IDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-md:flex-col max-lg:gap-[2px] max-lg:text-center'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</h2>;}, title: 'Tracks',width: '23%'
		},

		{ dataIndex: 'description', key: 3,
			render: (des) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{des}</h2>;
			},
			title: 'Description',width: '40%' },

		{ dataIndex: 'active_proposals', key: 4,
			render: (activeProposals) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '10%' },

		{ dataIndex: 'status', key: 5, render: (status) =>
		{ return <div className='text-[#243A57] tracking-wider flex items-center justify-start font-medium'>
			<h2 className={`text-[12px] ${status === EStatus.Received_Delegation && 'bg-[#E7DCFF]'} ${status === EStatus.Delegated && 'bg-[#FFFBD8]'} ${status === EStatus.Undelegated && 'bg-[#FFDAD8]'} rounded-[26px] py-[6px] px-[12px] text-center`}>{status?.split('_').join(' ').charAt(0).toUpperCase()+status?.split('_').join(' ').slice(1)} </h2>
		</div >;
		}, title: 'Status',width: '20%' }];

	const DelegatedColumns: ColumnsType<IDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <h2 className='text-[14px] text-[#243A57] tracking-wide '>
					{ handleTracksIcon(track)}<span>{track}</span>
				</h2>;}, title: 'Tracks',width: '23%'
		},

		{ dataIndex: 'description', key: 3,
			render: (des) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{des}</h2>;
			},
			title: 'Description',width: '40%' },

		{ dataIndex: 'delegated_to', key: 4,
			render: (address) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'><Address address={address} /></h2>;
			},
			title: 'Delegated to',width: '20%' },

		{ dataIndex: 'active_proposals', key: 5,
			render: (activeProposals) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '10%' }];

	const UndelegatedColumns: ColumnsType<IDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-md:flex-col max-lg:gap-[2px]'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</h2>;}, title: 'Tracks',width: '23%'
		},

		{ dataIndex: 'description', key: 3,
			render: (des) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{des}</h2>;
			},
			title: 'Description',width: '50%' },

		{ dataIndex: 'active_proposals', key: 4,
			render: (activeProposals) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '10%' }];

	const ReceivedDelegationColumns: ColumnsType<IDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-md:flex-col max-lg:gap-[2px]'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</h2>;}, title: 'Tracks',width: '23%'
		},

		{ dataIndex: 'description', key: 3,
			render: (des) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{des}</h2>;
			},
			title: 'Description',width: '40%' },

		{ dataIndex: 'delegated_by', key: 4,
			render: (address) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'><Address address={address} /></h2>;
			},
			title: 'Delegated by',width: '20%' },

		{ dataIndex: 'active_proposals', key: 4,
			render: (activeProposals) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '10%' }];

	if(status === EStatus.All)
	{
		return AllColumns;
	}
	if(status === EStatus.Delegated)
	{
		return DelegatedColumns;
	}
	if(status === EStatus.Undelegated)
	{
		return UndelegatedColumns;
	}
	if(status === EStatus.Received_Delegation)
	{
		return ReceivedDelegationColumns;
	}
	return null;
};
const GetTracksColumns = (status :EStatus) => {
	if(status === EStatus.Delegated){
		const TrackColumn: ColumnsType<IData> = [

			{ dataIndex:'index', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: '#',width: '10%' } ,
			{ dataIndex:'delegatedTo', key:1, render: (address) => <div className='text-sm text-[#243A57] font-normal text-center flex justify-center items-center'><Address address= {address}/></div>, title: 'Delegated to', width: '20%' },
			{ dataIndex:'balance', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: 'Balance', width: '15%' },
			{ dataIndex:'conviction', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: 'Conviction', width: '15%' },
			{ dataIndex:'delegatedOn', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: 'Delegated on', width: '20%' },
			{ dataIndex:'action', key:1, render: (action) => <div className='flex justify-center items-center'>
				<Button className='text-sm text-[#243A57] font-normal border-[1px] border-solid border-pink_primary h-[40px] flex items-center justify-center px-2 gap-2 max-md:h-auto max-md:gap-0 max-md:flex-col max-md:border-none max-md:p-2 max-md:shadow-none'>
					<UndelegatedProfileIcon/>
					<span className='text-sm tracking-wide text-pink_primary font-medium'>
						{action}
					</span>
				</Button></div>, title: 'Action', width: '10%' }

		];
		return TrackColumn;
	}
	else if(status === EStatus.Received_Delegation){

		const TrackColumn: ColumnsType<IData> = [
			{ dataIndex:'index', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: '#',width: '10%' } ,
			{ dataIndex:'delegatedTo', key:1, render: (address) => <div className='text-sm text-[#243A57] font-normal text-center flex justify-center items-center'>
				<Address address= {address}  />
			</div>, title: 'Delegated to', width: '20%' },
			{ dataIndex:'balance', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: 'Balance', width: '15%' },
			{ dataIndex:'conviction', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: 'Conviction', width: '15%' },
			{ dataIndex:'delegatedOn', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-center'>{index}</h4>, title: 'Delegated on', width: '20%' }
		];
		return TrackColumn;
	}
};

export  { GetColumns, GetTracksColumns };