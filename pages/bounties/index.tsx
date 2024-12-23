// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import SortByDropdownComponent from '~src/ui-components/SortByDropdown';
import FilterByStatus from '~src/ui-components/FilterByStatus';
import { RoundedDollarIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, filterBy, proposalStatus } = query;
	const proposalType = ProposalType.BOUNTIES;
	const { data, error } = await getOnChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalStatus: proposalStatus && Array.isArray(JSON.parse(decodeURIComponent(String(proposalStatus)))) ? JSON.parse(decodeURIComponent(String(proposalStatus))) : [],
		proposalType,
		sortBy
	});
	return { props: { data, error, network } };
};

interface IBountiesProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
}

const Bounties: FC<IBountiesProps> = (props) => {
	const { data, error, network } = props;
	const router = useRouter();
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);
	const [statusItem, setStatusItem] = useState([]);
	const { resolvedTheme: theme } = useTheme();

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { posts, count } = data;

	const onPaginationChange = (page: number) => {
		router.push({
			query: {
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead
				title='Bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<Link
				className='inline-flex items-center text-sidebarBlue hover:text-pink_primary dark:text-white'
				href={'/bounty-dashboard'}
			>
				<div className='flex items-center'>
					<LeftOutlined className='mr-2 text-xs' />
					<span className='text-sm font-medium'>Back to Bounties </span>
				</div>
			</Link>
			<div className='mt-3 flex sm:items-center'>
				<RoundedDollarIcon className='text-2xl text-lightBlue dark:text-white xs:mt-1 sm:-mt-3.5' />
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>On Chain Bounties ({count})</h1>
			</div>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='w-full rounded-xxl bg-white p-4 text-sm font-medium text-bodyBlue shadow-md dark:bg-section-dark-overlay dark:text-blue-dark-high md:mb-4 md:p-8'>
					This is the place to discuss on-chain bounties. Bounty posts are automatically generated as soon as they are created on-chain. Only the proposer is able to edit them.
				</p>
			</div>

			<div className='mt-6 rounded-xxl bg-white px-0 py-5 shadow-md dark:bg-section-dark-overlay'>
				<div className='flex items-center justify-between'>
					<div className='mx-1 mt-3.5 sm:mx-12 sm:mt-3'>
						<FilteredTags statusItem={statusItem} />
					</div>
					<div className='mb-5 flex items-center gap-x-2 '>
						<FilterByStatus setStatusItem={setStatusItem} />
						<FilterByTags />
						<SortByDropdownComponent
							sortBy={sortBy}
							setSortBy={setSortBy}
							isUsedInTrackListing={true}
						/>
					</div>
				</div>

				<div>
					<Listing
						posts={posts}
						proposalType={ProposalType.BOUNTIES}
					/>
					<div className='mt-6 flex justify-end'>
						{!!count && count > 0 && count > LISTING_LIMIT && (
							<Pagination
								theme={theme}
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={count}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={onPaginationChange}
								responsive={true}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Bounties;
