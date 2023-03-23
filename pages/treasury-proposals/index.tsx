// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useContext, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { useNetworkContext } from '~src/context';
import { NetworkContext } from '~src/context/NetworkContext';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { isCreationOfTreasuryProposalSupported } from '~src/util/isCreationOfTreasuryProposalSupported';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TreasuryProposalFormButton = dynamic(() => import('src/components/CreateTreasuryProposal/TreasuryProposalFormButton'), {
	ssr: false
});

const TreasuryOverview = dynamic(() => import('src/components/Home/TreasuryOverview'), {
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST } = query;
	const proposalType = ProposalType.TREASURY_PROPOSALS;
	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error } = await getOnChainPosts({
		listingLimit: LISTING_LIMIT,
		network,
		page,
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
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

	const { network } = useContext(NetworkContext);

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
			<SEOHead title='Treasury Proposals' />

			<div className='w-full flex flex-col sm:flex-row sm:items-center'>
				<h1 className='dashboard-heading flex-1 mb-4 sm:mb-0'>On Chain Treasury Proposals</h1>
				{isCreationOfTreasuryProposalSupported(network) && <TreasuryProposalFormButton  />}
			</div>

			{/* Intro and Create Post Button */}
			<div className="mt-8">
				<p className="text-sidebarBlue h-full text-sm md:text-base font-medium bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
					This is the place to discuss on-chain treasury proposals. On-chain posts are automatically generated as soon as they are created on the chain.
					Only the proposer is able to edit them.
					{
						['moonbeam', 'moonriver', 'moonbase'].includes(network)?
							<div>
								<a className='text-pink_primary' href='https://github.com/moonbeam-foundation/treasury/blob/main/interim/interim_treasury_proposal.md' target='_blank' rel="noreferrer" >Guidelines of the Interim Treasury.</a>
							</div>
							: null
					}
				</p>
			</div>

			{/* Treasury Overview Cards */}
			<TreasuryOverview inTreasuryProposals={true} className='my-8'/>

			<div className='mt-8 shadow-md bg-white p-3 md:p-8 rounded-md'>
				<div className='flex items-center justify-between'>
					<h1 className='dashboard-heading'>{ count } Treasury Proposals</h1>
				</div>

				<div>
					<Listing posts={posts}  proposalType={ProposalType.TREASURY_PROPOSALS} />
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

export default Treasury;