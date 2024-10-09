// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { spaceGrotesk } from 'pages/_app';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { LeftOutlined } from '@ant-design/icons';
import BountiesTable from '~src/components/Bounties/BountiesListing/BountiesTable';
import BountyProposalActionButton from '~src/components/Bounties/bountyProposal';
import SEOHead from '~src/global/SEOHead';
import { bountyStatus } from '~src/global/statuses';
import { setNetwork } from '~src/redux/network';
import { Tabs } from '~src/ui-components/Tabs';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import FilterByTags from '~src/ui-components/FilterByTags';
import { getAllBounties } from 'pages/api/v1/bounty/bountyDashboard/getAllBounties';

interface OnchainBountiesProps {
	network: string;
}
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const page = Number(query.page) || 1;
	const filterBy = query.filterBy ? JSON.parse(decodeURIComponent(String(query.filterBy))) : [];
	const proposalStatus = query.proposalStatus ? JSON.parse(decodeURIComponent(String(query.proposalStatus))) : [];

	const { data, error } = await getAllBounties({
		categories: filterBy,
		network,
		page,
		status: proposalStatus
	});

	return {
		props: {
			data,
			error,
			network
		}
	};
};

const BountiesListing: FC<OnchainBountiesProps> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(true);
	const [totalBountiesCount, setTotalBountiesCount] = useState<number>(0);
	const [activeTabKey, setActiveTabKey] = useState('all');
	const [currentPage, setCurrentPage] = useState<number>(1);

	const [bounties, setBounties] = useState<any[]>([]);
	const [filteredBounties, setFilteredBounties] = useState<any[]>([]);

	const onPaginationChange = (page: number) => {
		setCurrentPage(page);
	};

	const tabItems = [
		{
			children: (
				<BountiesTable
					loading={loading}
					bounties={filteredBounties.length ? filteredBounties : bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: 'all',
			label: <p>All</p>
		},
		{
			children: (
				<BountiesTable
					loading={loading}
					bounties={filteredBounties.length ? filteredBounties : bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: 'proposed',
			label: <p>Proposed</p>
		},
		{
			children: (
				<BountiesTable
					loading={loading}
					bounties={filteredBounties.length ? filteredBounties : bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: 'active',
			label: <p>Active</p>
		},
		{
			children: (
				<BountiesTable
					loading={loading}
					bounties={filteredBounties.length ? filteredBounties : bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: 'claimed',
			label: <p>Claimed</p>
		},
		{
			children: (
				<BountiesTable
					loading={loading}
					bounties={filteredBounties.length ? filteredBounties : bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: 'cancelled',
			label: <p>Cancelled</p>
		},
		{
			children: (
				<BountiesTable
					loading={loading}
					bounties={filteredBounties.length ? filteredBounties : bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: 'rejected',
			label: <p>Rejected</p>
		}
	];

	const statusMapping: { [key: string]: string[] } = {
		active: [bountyStatus.ACTIVE, bountyStatus.EXTENDED],
		all: [],
		cancelled: [bountyStatus.CANCELLED],
		claimed: [bountyStatus.CLAIMED, bountyStatus.AWARDED],
		proposed: [bountyStatus.PROPOSED],
		rejected: [bountyStatus.REJECTED]
	};

	const fetchBounties = async (page = 1) => {
		try {
			setLoading(true);
			const statuses = statusMapping[activeTabKey] || [];
			const { data, error } = await nextApiClientFetch<any>('/api/v1/bounty/bountyDashboard/getAllBounties', {
				page,
				statuses
			});

			if (error) {
				console.error('Error fetching bounties:', error);
				setLoading(false);
				return;
			}

			setBounties(data?.bounties || []);
			setFilteredBounties([]);
			setTotalBountiesCount(data?.totalBountiesCount || 0);
			setLoading(false);
		} catch (err) {
			console.error('An unexpected error occurred:', err);
			setLoading(false);
		}
	};

	const onTabChange = (key: string) => {
		setActiveTabKey(key);
		setCurrentPage(1);
	};

	useEffect(() => {
		fetchBounties(currentPage);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTabKey, currentPage]);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div>
			{' '}
			<SEOHead
				title='On-chain bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
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
					<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} dark:text-blue-dark-high' text-[32px] font-bold text-blue-light-high dark:text-lightWhite`}>
						On-chain Bounties
					</span>
					<div className='flex items-center gap-2'>
						<BountyProposalActionButton className='hidden md:block' />
					</div>
				</div>

				<div className='relative mt-5 md:mt-0'>
					<div className='absolute -top-2 right-5 z-50 md:top-8'>
						<FilterByTags />
					</div>

					<div>
						<Tabs
							defaultActiveKey='2'
							theme={theme}
							type='card'
							onChange={onTabChange}
							activeKey={activeTabKey}
							className='ant-tabs-tab-bg-white pt-5 font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high'
							items={tabItems}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BountiesListing;
