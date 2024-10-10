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
import { setNetwork } from '~src/redux/network';
import { Tabs } from '~src/ui-components/Tabs';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import FilterByTags from '~src/ui-components/FilterByTags';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import { getAllBounties } from 'pages/api/v1/bounty/bountyDashboard/getAllBounties';
import { ErrorState } from '~src/ui-components/UIStates';
import { useRouter } from 'next/router';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { handlePaginationChange } from '~src/util/handlePaginationChange';

interface BountiesListingProps {
	data?: any;
	error?: string;
	network: string;
}
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const page = Number(query.page) || 1;
	const filterBy = query.filterBy ? JSON.parse(decodeURIComponent(String(query.filterBy))) : [];
	const status = query.status ? JSON.parse(decodeURIComponent(String(query.status))) : '';

	const { data } = await getAllBounties({
		categories: filterBy,
		network,
		page,
		status
	});

	return {
		props: {
			data,
			network
		}
	};
};

const BountiesListing: FC<BountiesListingProps> = (props) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const [activeTabKey, setActiveTabKey] = useState('all');
	const [currentPage, setCurrentPage] = useState<number>(1);

	const onPaginationChange = (page: number) => {
		router.push({
			query: {
				page
			}
		});
		handlePaginationChange({ limit: VOTES_LISTING_LIMIT, page });
	};

	const bounties = data?.bounties || [];
	const totalBountiesCount = data?.totalBountiesCount || 0;

	const tabItems = [
		{
			children: (
				<BountiesTable
					bounties={bounties.length > 0 && bounties}
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
					bounties={bounties.length > 0 && bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: EBountiesStatuses.PROPOSED,
			label: <p>Proposed</p>
		},
		{
			children: (
				<BountiesTable
					bounties={bounties.length > 0 && bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: EBountiesStatuses.ACTIVE,
			label: <p>Active</p>
		},
		{
			children: (
				<BountiesTable
					bounties={bounties.length > 0 && bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: EBountiesStatuses.CLAIMED,
			label: <p>Claimed</p>
		},
		{
			children: (
				<BountiesTable
					bounties={bounties.length > 0 && bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: EBountiesStatuses.CANCELLED,
			label: <p>Cancelled</p>
		},
		{
			children: (
				<BountiesTable
					bounties={bounties.length > 0 && bounties}
					onPaginationChange={onPaginationChange}
					totalBountiesCount={totalBountiesCount}
					currentPage={currentPage}
				/>
			),
			key: EBountiesStatuses.REJECTED,
			label: <p>Rejected</p>
		}
	];
	const onTabChange = (key: string) => {
		setActiveTabKey(key);
		setCurrentPage(1);
		const newQuery = {
			...router.query,
			page: '1',
			status: encodeURIComponent(JSON.stringify(key))
		};
		router.push(
			{
				pathname: router.pathname,
				query: newQuery
			},
			undefined,
			{ shallow: true }
		);
	};

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

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
