// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination } from '~src/ui-components/Pagination';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { setNetwork } from '~src/redux/network';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { useTheme } from 'next-themes';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;
	const proposalType = ProposalType.UPGRADE_PIPS;
	const { data, error } = await getOnChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network } };
};

interface ITechCommProposalsProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
}

const UpgradePIPs: FC<ITechCommProposalsProps> = (props) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

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
				title='Tech Committee Proposals'
				network={network}
			/>
			<div className='mt-3 flex sm:items-center'>
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>On-chain Upgrade PIPs</h1>
			</div>
			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-xxl bg-white p-4 text-sm font-medium text-bodyBlue shadow-md dark:bg-section-dark-overlay dark:text-blue-dark-high md:p-8'>
					This is the place to discuss on-chain Upgrade PIPs. Upgrade Committee PIPs are proposed by the Upgrade Committee and approved by the Polymesh Governance Council. Only the
					Upgrade Committee can amend these PIPs
				</p>
			</div>

			<div className='mt-6 rounded-xxl bg-white px-0 py-5 shadow-md dark:bg-section-dark-overlay'>
				<div className='flex items-center justify-between'>
					<div className='mx-1 mt-3.5 sm:mx-12 sm:mt-3'>
						<FilteredTags />
					</div>
					<FilterByTags className='my-6 xs:mx-6 xs:my-2 sm:mr-14' />
				</div>
				<Listing
					posts={posts}
					proposalType={ProposalType.UPGRADE_PIPS}
				/>
				<div className='mt-6 flex justify-end'>
					{!!count && count > 0 && count > LISTING_LIMIT && (
						<Pagination
							defaultCurrent={1}
							pageSize={LISTING_LIMIT}
							total={count}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={onPaginationChange}
							responsive={true}
							theme={theme}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default UpgradePIPs;
