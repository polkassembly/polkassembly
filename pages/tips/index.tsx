// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;
	const proposalType = ProposalType.TIPS;
	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error } = await getOnChainPosts({
		filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network, page } };
};

interface ITipsProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	page: number;
}

const Tips: FC<ITipsProps> = (props) => {
	const { data, error, page, network } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { posts, count } = data;

	const onPaginationChange = (page:number) => {
		router.push({
			query:{
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead title='Tips' network={network}/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>On Chain Tips</h1>

			{/* Intro and Create Post Button */}
			<div className="flex flex-col md:flex-row">
				<p className="text-sidebarBlue text-sm md:text-base font-medium bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
					This is the place to discuss on-chain tips. Tip posts are automatically generated as soon as they are created on-chain.
					Only the proposer is able to edit them.
				</p>
			</div>

			<div className='shadow-md bg-white p-3 md:p-8 rounded-md'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='dashboard-heading'>{ count } Tips</h1>
						<FilteredTags/>
					</div>
					<FilterByTags className='mr-[2px]'/>
				</div>

				<div>
					<Listing tipStartedIndex={count - 1 - (LISTING_LIMIT * (page - 1))} posts={posts} proposalType={ProposalType.TIPS} isTip={true} />
					<div className='flex justify-end mt-6'>
						{
							!!count && count > 0 && count > LISTING_LIMIT &&
						<Pagination
							defaultCurrent={1}
							pageSize={LISTING_LIMIT}
							total={count}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={onPaginationChange}
							responsive={true}
						/>
						}
					</div>
				</div>
			</div>
		</>
	);
};

export default Tips;