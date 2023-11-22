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
import { ETrackDelegationStatus } from '~src/types';
import dayjs from 'dayjs';
import {
	AuctionAdminTrackIcon,
	BigSpenderTrackIcon,
	BigTipperTrackIcon,
	FellowshipAdminTrackIcon,
	GeneralAdminTrackIcon,
	LeaseAdminTrackIcon,
	MediumSpenderTrackIcon,
	ReferendumCancellerTrackIcon,
	ReferendumKillerTrackIcon,
	RootTrackIcon,
	SmallSpenderTrackIcon,
	SmallTipperTrackIcon,
	StakingAdminTrackTrackIcon,
	TreasurerTrackIcon,
	WhitelistedCallerTrackIcon
} from '~src/ui-components/CustomIcons';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';

export const handleTracksIcon = (index: string, size: number) => {
	switch (index) {
		case 'Root':
			return (
				<RootTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Treasurer':
			return (
				<TreasurerTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Whitelisted Caller':
			return (
				<WhitelistedCallerTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Lease Admin':
			return (
				<LeaseAdminTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'General Admin':
			return (
				<GeneralAdminTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Staking Admin':
			return (
				<StakingAdminTrackTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Fellowship Admin':
			return (
				<FellowshipAdminTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Small Tipper':
			return (
				<SmallTipperTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Medium Spender':
			return (
				<MediumSpenderTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Small Spender':
			return (
				<SmallSpenderTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Auction Admin':
			return (
				<AuctionAdminTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Big Spender':
			return (
				<BigSpenderTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Big Tipper':
			return (
				<BigTipperTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Referendum Killer':
			return (
				<ReferendumKillerTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		case 'Referendum Canceller':
			return (
				<ReferendumCancellerTrackIcon
					className='text-lightBlue dark:text-icon-dark-inactive'
					style={{ fontSize: `${size}px` }}
				/>
			);
		default:
			return null;
	}
};

const GetColumns = (status: ETrackDelegationStatus) => {
	const AllColumns: ColumnsType<ITrackDataType> = [
		{
			dataIndex: 'index',
			key: 1,
			render: (index) => {
				return <div className='flex items-center justify-center text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{index}</div>;
			},
			title: '#',
			width: '7%'
		},

		{
			dataIndex: 'track',
			key: 2,
			render: (track) => {
				return (
					<div className='flex shrink-0 items-center justify-start gap-1 text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
						{handleTracksIcon(track, 24)}
						<span className=' flex items-center'>{track}</span>
					</div>
				);
			},
			title: 'Tracks',
			width: '25%'
		},

		{
			dataIndex: 'description',
			key: 3,
			render: (des) => {
				return <div className='flex items-center justify-start text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{des}</div>;
			},
			title: 'Description',
			width: '40%'
		},

		{
			dataIndex: 'active_proposals',
			key: 4,
			render: (activeProposals) => {
				return <div className='flex items-center justify-start text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{activeProposals}</div>;
			},
			title: 'Active proposals',
			width: '10%'
		},

		{
			dataIndex: 'status',
			key: 5,
			render: (status) => {
				return (
					<div className='flex items-center justify-start gap-2 font-medium tracking-wider text-bodyBlue dark:text-white max-md:flex-col'>
						{status.map((item: ETrackDelegationStatus, index: number) => (
							<h2
								key={index}
								className={`text-xs ${item === ETrackDelegationStatus.Received_Delegation && 'bg-[#E7DCFF] dark:bg-[#6C2CF8]'} ${
									item === ETrackDelegationStatus.Delegated && 'bg-[#FFFBD8] dark:bg-[#69600B]'
								} ${item === ETrackDelegationStatus.Undelegated && 'bg-[#FFDAD8] dark:bg-[#EF6158]'} rounded-[26px] px-[12px] py-[6px] text-center ${
									item === ETrackDelegationStatus.Received_Delegation && status.length > 1 && 'w-[95px] truncate'
								} `}
							>
								{item?.split('_').join(' ').charAt(0).toUpperCase() + item?.split('_').join(' ').slice(1)}
							</h2>
						))}
					</div>
				);
			},
			title: 'Status',
			width: '20%'
		}
	];

	const DelegatedColumns: ColumnsType<ITrackDataType> = [
		{
			dataIndex: 'index',
			key: 1,
			render: (index) => {
				return <div className='flex items-center justify-center text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{index}</div>;
			},
			title: '#',
			width: '7%'
		},

		{
			dataIndex: 'track',
			key: 2,
			render: (track) => {
				return (
					<div className='flex items-center justify-start gap-1 text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
						{handleTracksIcon(track, 24)}
						<span className=' flex items-center border-[1px]'>{track}</span>
					</div>
				);
			},
			title: 'Tracks',
			width: '20%'
		},

		{
			dataIndex: 'description',
			key: 3,
			render: (des) => {
				return <div className='flex items-center justify-start text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{des}</div>;
			},
			title: 'Description',
			width: '38%'
		},

		{
			dataIndex: 'delegated_to',
			key: 4,
			render: (addresses) => {
				return (
					<div className='flex items-center justify-start text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>
						<Address
							address={addresses?.[0]?.to || ''}
							displayInline
							iconSize={24}
							isTruncateUsername={false}
						/>
					</div>
				);
			},
			title: 'Delegated to',
			width: '20%'
		},

		{
			dataIndex: 'active_proposals',
			key: 5,
			render: (activeProposals) => {
				return <div className='flex items-center justify-center text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{activeProposals}</div>;
			},
			title: 'Active proposals',
			width: '15%'
		}
	];

	const UndelegatedColumns: ColumnsType<ITrackDataType> = [
		{
			dataIndex: 'index',
			key: 1,
			render: (index) => {
				return <div className='flex items-center justify-center text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{index}</div>;
			},
			title: '#',
			width: '7%'
		},

		{
			dataIndex: 'track',
			key: 2,
			render: (track) => {
				return (
					<div className='flex items-center justify-start gap-1 text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
						{handleTracksIcon(track, 24)}
						<span className=' flex items-center border-[1px]'>{track}</span>
					</div>
				);
			},
			title: 'Tracks',
			width: '23%'
		},

		{
			dataIndex: 'description',
			key: 3,
			render: (des) => {
				return <div className='flex items-center justify-start text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{des}</div>;
			},
			title: 'Description',
			width: '50%'
		},

		{
			dataIndex: 'active_proposals',
			key: 4,
			render: (activeProposals) => {
				return <div className='flex items-center justify-center text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{activeProposals}</div>;
			},
			title: 'Active proposals',
			width: '15%'
		}
	];

	const ReceivedDelegationColumns: ColumnsType<ITrackDataType> = [
		{
			dataIndex: 'index',
			key: 1,
			render: (index) => {
				return <div className='flex items-center justify-center text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white'>{index}</div>;
			},
			title: '#',
			width: '7%'
		},

		{
			dataIndex: 'track',
			key: 2,
			render: (track) => {
				return (
					<div className='flex items-center justify-start gap-1 text-[14px] font-normal tracking-wide text-bodyBlue dark:text-white max-lg:flex-col max-lg:gap-[2px] max-lg:text-center'>
						{handleTracksIcon(track, 24)}
						<span className=' flex items-center border-[1px]'>{track}</span>
					</div>
				);
			},
			title: 'Tracks',
			width: '20%'
		},

		{
			dataIndex: 'description',
			key: 3,
			render: (des) => {
				return <h2 className='flex items-center justify-start text-sm font-normal tracking-wide text-bodyBlue dark:text-white'>{des}</h2>;
			},
			title: 'Description',
			width: '38%'
		},

		{
			dataIndex: 'delegated_by',
			key: 4,
			render: (addresses) => {
				return (
					<div className='flex items-center justify-start gap-1 text-sm font-normal tracking-wide text-bodyBlue dark:text-white max-lg:flex-col'>
						<Address
							address={addresses?.[0].from || ''}
							isTruncateUsername={false}
							displayInline
							iconSize={24}
						/>{' '}
						<span className='text-xs font-medium tracking-[0.0015em] text-bodyBlue dark:text-white'>{addresses.length - 1 !== 0 && `+ ${addresses.length - 1} more`} </span>
					</div>
				);
			},
			title: 'Delegated by',
			width: '20%'
		},

		{
			dataIndex: 'active_proposals',
			key: 4,
			render: (activeProposals) => {
				return <div className='flex items-center justify-center text-sm font-normal tracking-wide text-bodyBlue dark:text-white'>{activeProposals}</div>;
			},
			title: 'Active proposals',
			width: '15%'
		}
	];

	if (status === ETrackDelegationStatus.All) {
		return AllColumns;
	}
	if (status === ETrackDelegationStatus.Delegated) {
		return DelegatedColumns;
	}
	if (status === ETrackDelegationStatus.Undelegated) {
		return UndelegatedColumns;
	}
	if (status === ETrackDelegationStatus.Received_Delegation) {
		return ReceivedDelegationColumns;
	}
};
const GetTracksColumns = (status: ETrackDelegationStatus, setOpen: (pre: boolean) => void, network: string) => {
	if (!network) return;
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	if (status === ETrackDelegationStatus.Delegated) {
		const TrackColumn: ColumnsType<ITrackRowData> = [
			{ dataIndex: 'index', key: 1, render: (index) => <div className='text-start text-sm font-normal text-bodyBlue dark:text-white'>{index}</div>, title: '#', width: '10%' },
			{
				dataIndex: 'delegatedTo',
				key: 1,
				render: (address) => (
					<div className='flex items-center justify-start text-center text-sm font-normal text-bodyBlue dark:text-white'>
						<Address
							address={address || ''}
							isTruncateUsername={false}
							displayInline
							iconSize={24}
						/>
					</div>
				),
				title: 'Delegated to',
				width: '20%'
			},
			{
				dataIndex: 'balance',
				key: 1,
				render: (balance) => <div className='text-start text-sm font-normal text-bodyBlue dark:text-white'>{formatBalance(balance.toString(), { forceUnit: unit })}</div>,
				title: 'Balance',
				width: '15%'
			},
			{
				dataIndex: 'lockPeriod',
				key: 1,
				render: (conviction) => <div className='text-start text-sm font-normal text-bodyBlue dark:text-white'>{Number(conviction) ? conviction : 0.1}x</div>,
				title: 'Conviction',
				width: '15%'
			},
			{
				dataIndex: 'delegatedOn',
				key: 1,
				render: (date) => <div className='ml-1 text-start text-sm font-normal text-bodyBlue dark:text-white'>{dayjs(date).format('DD MMM YYYY')}</div>,
				title: 'Delegated on',
				width: '20%'
			},
			{
				dataIndex: 'action',
				key: 1,
				render: (action) => (
					<div className='flex items-start justify-center'>
						<Button
							onClick={() => setOpen(true)}
							className='flex h-[40px] items-center justify-center gap-2 border-[1px] border-solid border-pink_primary px-2 text-sm font-normal text-bodyBlue dark:bg-[#33071E] dark:text-white max-md:h-auto max-md:flex-col max-md:gap-0 max-md:border-none max-md:p-2 max-md:shadow-none'
						>
							<UndelegatedProfileIcon />
							<span className='text-sm font-medium tracking-wide text-pink_primary '>{action}</span>
						</Button>
					</div>
				),
				title: 'Action',
				width: '10%'
			}
		];
		return TrackColumn;
	} else if (status === ETrackDelegationStatus.Received_Delegation) {
		const TrackColumn: ColumnsType<ITrackRowData> = [
			{ dataIndex: 'index', key: 1, render: (index) => <div className='text-start text-sm font-normal text-bodyBlue dark:text-white'>{index}</div>, title: '#', width: '10%' },
			{
				dataIndex: 'delegatedFrom',
				key: 1,
				render: (address) => (
					<div className='flex items-center justify-start text-center text-sm font-normal text-bodyBlue dark:text-white'>
						<Address
							address={address || ''}
							isTruncateUsername={false}
							displayInline
							iconSize={24}
						/>
					</div>
				),
				title: 'Delegated by',
				width: '20%'
			},
			{
				dataIndex: 'balance',
				key: 1,
				render: (balance) => <div className='text-start text-sm font-normal text-bodyBlue dark:text-white'>{formatBalance(balance.toString(), { forceUnit: unit })}</div>,
				title: 'Balance',
				width: '15%'
			},
			{
				dataIndex: 'lockPeriod',
				key: 1,
				render: (conviction) => <div className='text-start text-sm font-normal text-bodyBlue dark:text-white'>{Number(conviction) ? conviction : 0.1}x</div>,
				title: 'Conviction',
				width: '15%'
			},
			{
				dataIndex: 'delegatedOn',
				key: 1,
				render: (date) => <div className='ml-1 text-start text-sm font-normal text-bodyBlue dark:text-white'>{dayjs(date).format('DD MMM YYYY')}</div>,
				title: 'Delegated on',
				width: '20%'
			}
		];
		return TrackColumn;
	}
};

export { GetColumns, GetTracksColumns };
