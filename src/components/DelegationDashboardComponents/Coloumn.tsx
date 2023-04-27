// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { ColumnsType } from 'antd/es/table';
import Address from '~src/ui-components/Address';
import { ITrackDataType } from './TracksListing';
import { ITrackRowData } from './DashboardTrack';
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
import { ETrackDelegationStatus } from '~src/types';
import formatBnBalance from '~src/util/formatBnBalance';
import { useNetworkContext } from '~src/context';
import dayjs from 'dayjs';

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
const GetColumns = (status :ETrackDelegationStatus) => {

	const AllColumns: ColumnsType<ITrackDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <div className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-lg:flex-col max-lg:gap-[2px] max-lg:text-center shrink-0'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</div>;}, title: 'Tracks',width: '25%'
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
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '10%' },

		{ dataIndex: 'status', key: 5, render: (status) =>
		{ return <div className='text-[#243A57] tracking-wider flex items-center justify-start font-medium gap-2 max-md:flex-col'>

			{status.map((item: ETrackDelegationStatus, index:number)  => <h2 key={index}
      className={`text-[12px] ${item === ETrackDelegationStatus.Received_Delegation && 'bg-[#E7DCFF]'} ${item === ETrackDelegationStatus.Delegated && 'bg-[#FFFBD8]'} ${item === ETrackDelegationStatus.Undelegated && 'bg-[#FFDAD8]'} rounded-[26px] py-[6px] px-[12px] text-center ${item === ETrackDelegationStatus.Received_Delegation && status.length > 1 && 'truncate w-[95px]'} `}>
				{item?.split('_').join(' ').charAt(0).toUpperCase() + item?.split('_').join(' ').slice(1)}
			</h2>)}

		</div >;
		}, title: 'Status',width: '20%' }];

	const DelegatedColumns: ColumnsType<ITrackDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <div className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</div>;}, title: 'Tracks',width: '23%'
		},

		{ dataIndex: 'description', key: 3,
			render: (des) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{des}</h2>;
			},
			title: 'Description',width: '30%' },

		{ dataIndex: 'delegated_to', key: 4,
			render: (addresses) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'><Address address={addresses[0]?.to || ''} /></h2>;
			},
			title: 'Delegated to',width: '25%' },

		{ dataIndex: 'active_proposals', key: 5,
			render: (activeProposals) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '15%' }];

	const UndelegatedColumns: ColumnsType<ITrackDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <div className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</div>;}, title: 'Tracks',width: '23%'
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
			title: 'Active proposals',width: '15%' }];

	const ReceivedDelegationColumns: ColumnsType<ITrackDataType> = [
		{ dataIndex: 'index', key: 1,
			render: (index) =>
			{
				return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;
			}, title: '#',width: '7%' },

		{ dataIndex: 'track', key: 2,
			render: (track) => {
				return <div className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal gap-1 max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
					{ handleTracksIcon(track)}<span>{track}</span>
				</div>;}, title: 'Tracks',width: '23%'
		},

		{ dataIndex: 'description', key: 3,
			render: (des) =>
			{
				return <h2 className='text-sm text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{des}</h2>;
			},
			title: 'Description',width: '30%' },

		{ dataIndex: 'delegated_by', key: 4,
			render: (addresses) =>
			{
				return <div className='text-sm text-[#243A57] tracking-wide flex items-center justify-start font-normal max-lg:flex-col gap-1'><Address address={addresses[0].from || ''} displayInline /> <span className='text-xs text-[#243A57] tracking-[0.0015em] font-medium'>{ addresses.length-1 !== 0 && `+ ${addresses.length-1} more`} </span></div>;
			},
			title: 'Delegated by',width: '25%' },

		{ dataIndex: 'active_proposals', key: 4,
			render: (activeProposals) =>
			{
				return <h2 className='text-sm text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{activeProposals}</h2>;
			},
			title: 'Active proposals',width: '15%' }];

	if(status === ETrackDelegationStatus.All)
	{
		return AllColumns;
	}
	if(status === ETrackDelegationStatus.Delegated)
	{
		return DelegatedColumns;
	}
	if(status === ETrackDelegationStatus.Undelegated)
	{
		return UndelegatedColumns;
	}
	if(status === ETrackDelegationStatus.Received_Delegation)
	{
		return ReceivedDelegationColumns;
	}
};
const GetTracksColumns = (status :ETrackDelegationStatus,setOpen: (pre: boolean) => void) => {

	const { network } = useNetworkContext();

	if(status === ETrackDelegationStatus.Delegated){
		const TrackColumn: ColumnsType<ITrackRowData> = [

			{ dataIndex:'index', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-start'>{index}</h4>, title: '#',width: '10%' } ,
			{ dataIndex:'delegatedTo', key:1, render: (address) => <div className='text-sm text-[#243A57] font-normal text-center flex justify-start items-center'><Address address= {address || ''} displayInline/></div>, title: 'Delegated to', width: '20%' },
			{ dataIndex:'balance', key:1, render: (balance) => <h4 className='text-sm text-[#243A57] font-normal text-start'>{formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network) }</h4>, title: 'Balance', width: '15%' },
			{ dataIndex:'lockPeriod', key:1, render: (conviction) => <h4 className='text-sm text-[#243A57] font-normal text-start'>{conviction}x</h4>, title: 'Conviction', width: '15%' },
			{ dataIndex:'delegatedOn', key:1, render: (date) => <h4 className='text-sm text-[#243A57] font-normal text-start ml-1'>{dayjs(date).format('DD MMM YYYY')}</h4>, title: 'Delegated on', width: '20%' },
			{ dataIndex:'action', key:1, render: (action) => <div className='flex justify-center items-start'>
				<Button onClick={() => setOpen(true)} className='text-sm text-[#243A57] font-normal border-[1px] border-solid border-pink_primary h-[40px] flex items-center justify-center px-2 gap-2 max-md:h-auto max-md:gap-0 max-md:flex-col max-md:border-none max-md:p-2 max-md:shadow-none'>
					<UndelegatedProfileIcon/>
					<span className='text-sm tracking-wide text-pink_primary font-medium'>
						{action}
					</span>
				</Button>
			</div>, title: 'Action', width: '10%' }

		];
		return TrackColumn;
	}
	else if(status === ETrackDelegationStatus.Received_Delegation){

		const TrackColumn: ColumnsType<ITrackRowData> = [
			{ dataIndex:'index', key:1, render: (index) => <h4 className='text-sm text-[#243A57] font-normal text-start'>{index}</h4>, title: '#',width: '10%' } ,
			{ dataIndex:'delegatedFrom', key:1, render: (address) => <div className='text-sm text-[#243A57] font-normal text-center flex justify-start items-center'>
				<Address address= {address || ''} displayInline />
			</div>, title: 'Delegated by', width: '20%' },
			{ dataIndex:'balance', key:1, render: (balance) => <h4 className='text-sm text-[#243A57] font-normal text-start'>{formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}</h4>, title: 'Balance', width: '15%' },
			{ dataIndex:'lockPeriod', key:1, render: (conviction) => <h4 className='text-sm text-[#243A57] font-normal text-start'>{conviction}x</h4>, title: 'Conviction', width: '15%' },
			{ dataIndex:'delegatedOn', key:1, render: (date) => <h4 className='text-sm text-[#243A57] font-normal text-start ml-1'>{dayjs(date).format('DD MMM YYYY')}</h4>, title: 'Delegated on', width: '20%' }
		];
		return TrackColumn;
	}
};

export  { GetColumns, GetTracksColumns };