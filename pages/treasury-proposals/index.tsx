// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect, useState } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { network as AllNetworks } from '~src/global/networkConstants';
import Listing from '~src/components/Listing';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import FilterByTags from '~src/ui-components/FilterByTags';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { isCreationOfTreasuryProposalSupported } from '~src/util/isCreationOfTreasuryProposalSupported';
import DiamondIcon from '~assets/icons/diamond-icon.svg';
import FilteredTags from '~src/ui-components/filteredTags';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Pagination } from '~src/ui-components/Pagination';
import FilterByStatus from '~src/ui-components/FilterByStatus';
import SortByDropdownComponent from '~src/ui-components/SortByDropdown';
import OpenGovTreasuryProposal from '~src/components/OpenGovTreasuryProposal';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

const TreasuryOverview = dynamic(() => import('src/components/Home/TreasuryOverview/index'), {
	ssr: false
});

const Gov1TreasuryProposal = dynamic(() => import('~src/components/Gov1TreasuryProposal'), {
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, filterBy, proposalStatus } = query;
	const proposalType = ProposalType.TREASURY_PROPOSALS;
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

interface ITreasuryProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
}

const Treasury: FC<ITreasuryProps> = (props) => {
	const { data, error } = props;
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);
	const [statusItem, setStatusItem] = useState([]);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

	const { network } = useNetworkSelector();

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
				title='Treasury Proposals'
				desc='Discover and review the latest proposals for managing and allocating our treasury funds, and have your voice heard in the decision-making process using Polkassembly.'
				network={network}
			/>

			<div className='mt-3 flex w-full flex-col sm:flex-row sm:items-center'>
				<h1 className='mx-2 mb-2 flex flex-1 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>
					<DiamondIcon className='mr-2 justify-self-center' />
					Treasury Proposals ({count})
				</h1>
				{isCreationOfTreasuryProposalSupported(network) && (
					<OpenGovTreasuryProposal
						isUsedInReferedumComponent
						className='flex h-10 cursor-pointer items-center rounded-md bg-pink_primary px-3'
					/>
				)}
				{!isOpenGovSupported(network) && ![AllNetworks.POLYMESH, AllNetworks.POLYMESHTEST, AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network) && (
					<Gov1TreasuryProposal isUsedInTreasuryPage />
				)}
			</div>

			{/* Intro and Create Post Button */}
			<div className='mt-8'>
				<p className='mb-4 w-full rounded-xxl bg-white p-4 text-sm font-medium text-bodyBlue shadow-md dark:bg-section-dark-overlay dark:text-blue-dark-high md:p-8'>
					This is the place to discuss on-chain treasury proposals. On-chain posts are automatically generated as soon as they are created on the chain. Only the proposer is able
					to edit them.
					{['moonbeam', 'moonriver', 'moonbase'].includes(network) ? (
						<div>
							<a
								className='text-pink_primary'
								href='https://github.com/moonbeam-foundation/treasury/blob/main/interim/interim_treasury_proposal.md'
								target='_blank'
								rel='noreferrer'
							>
								Guidelines of the Interim Treasury.
							</a>
						</div>
					) : null}
				</p>
			</div>

			{/* Treasury Overview Cards */}
			<TreasuryOverview
				theme={theme}
				className='my-6'
			/>

			<div className='rounded-xxl bg-white px-0 py-5 shadow-md dark:bg-section-dark-overlay'>
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
						proposalType={ProposalType.TREASURY_PROPOSALS}
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

export default Treasury;
