// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { Pagination } from 'antd';
import { useRouter } from 'next/router';
import { getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import React, { useEffect } from 'react';
import Listing from '~src/components/Listing';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST } = query;
	const proposalType = ProposalType.ANNOUNCEMENT;
	const { data, error } = await getOnChainPosts({
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network } };
};

interface IAnnouncementProps {
	data?: { posts: any[]; count: number };
	error?: string;
	network: string;
}

const Announcements = (props: IAnnouncementProps) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();

	const router = useRouter();

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
				title={'Alliance Announcements'}
				network={network}
			/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>Alliance</h1>

			{/* Intro and Create Post Button */}
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay md:p-8 md:text-base'>
					The Alliance Pallet provides a collective that curates a list of accounts and URLs, deemed by the voting members to be unscrupulous actors. The Alliance provides a set of
					ethics against bad behavior, and provides recognition and influence for those teams that contribute something back to the ecosystem.
				</p>
			</div>
			<div className='rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8'>
				<div className='flex items-center justify-between'>
					<h1 className='dashboard-heading'>{count} Announcement</h1>
				</div>

				<div>
					<Listing
						posts={posts}
						proposalType={ProposalType.ANNOUNCEMENT}
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
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Announcements;
