// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Link from 'next/link';
import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import BountyProposalActionButton from '~src/components/Bounties/bountyProposal';
import { spaceGrotesk } from 'pages/_app';
import { Tabs } from '~src/ui-components/Tabs';
import { useTheme } from 'next-themes';
import All from './Components/All';
import ImageIcon from '~src/ui-components/ImageIcon';
import FilterByTags from './Components/FilterByTags';

function OnchainBounties() {
	const { resolvedTheme: theme } = useTheme();
	const tabItems = [
		{
			children: <All />,
			key: 'all',
			label: <p>All</p>
		},
		{
			children: <p>Proposed</p>,
			key: 'proposed',
			label: <p>Proposed</p>
		},
		{
			children: <p>Active</p>,
			key: 'active',
			label: <p>Active</p>
		},
		{
			children: <p>Payout Pending</p>,
			key: 'payout-pending',
			label: <p>Payout Pending</p>
		},
		{
			children: <p>Claimed</p>,
			key: 'claimed',
			label: <p>Claimed</p>
		},
		{
			children: <p>Cancelled</p>,
			key: 'cancelled',
			label: <p>Cancelled</p>
		},
		{
			children: <p>Rejected</p>,
			key: 'rejected',
			label: <p>Rejected</p>
		}
	];
	return (
		<div>
			<Link
				className='inline-flex items-center text-sidebarBlue hover:text-pink_primary dark:text-white'
				href={'/bounty'}
			>
				<div className='flex items-center'>
					<LeftOutlined className='mr-2 text-xs' />
					<span className='text-sm font-medium'>Back to Bounty Dashboard</span>
				</div>
			</Link>
			<div className='flex items-center justify-between pt-4'>
				<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} dark:text-blue-dark-high' text-[32px] font-bold text-blue-light-high`}>On-chain Bounties</span>
				<div className='flex items-center gap-2'>
					<BountyProposalActionButton className='hidden md:block' />
					<div
						className='flex items-center gap-2'
						style={{
							background:
								'radial-gradient(395.27% 77.56% at 25.57% 34.38%, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(192.36% 96% at -3.98% 12.5%, #4B33FF 13.96%, #83F 64.39%, rgba(237, 66, 179, 0.00) 100%), radial-gradient(107.92% 155.46% at 50% 121.74%, #F512EE 0%, #62A0FD 80.98%)',
							boxShadow: '1px 1px 4px 0px rgba(255, 255, 255, 0.50) inset',
							color: '#fff',
							padding: '14px 20px',
							// eslint-disable-next-line sort-keys
							borderRadius: '8px',
							display: 'inline-block',
							// eslint-disable-next-line sort-keys
							cursor: 'pointer'
						}}
					>
						Curator Dashboard{' '}
						<ImageIcon
							src='/assets/icons/outlinearrow.svg'
							alt='arrow right'
						/>
					</div>
				</div>
			</div>
			<div className='relative'>
				<div className='absolute right-5 top-8 z-50'>
					<FilterByTags />
				</div>

				<div>
					<Tabs
						defaultActiveKey='2'
						theme={theme}
						type='card'
						className='ant-tabs-tab-bg-white pt-5 font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high'
						items={tabItems}
					/>
				</div>
			</div>
		</div>
	);
}

export default OnchainBounties;
