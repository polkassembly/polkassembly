// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST } = query;
	const proposalType = ProposalType.ALLIANCE_MOTION;
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

interface IMotionsProps {
  data?: {posts: any[]; count: number};
  error?: string;
  network: string;
}
export const AllianceMotions: FC<IMotionsProps> = (props) => {
	const { data, error } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
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
			<SEOHead title="Alliance Motion" />
			<h1 className="dashboard-heading mb-4 md:mb-6">Alliance Motions</h1>
			<div className="flex flex-col md:flex-row">
				<p className="text-sidebarBlue text-sm md:text-base font-medium bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
          This is the place to discuss on-chain motions. On-chain posts are
          automatically generated as soon as they are created on the chain. Only
          the proposer is able to edit them.
				</p>
			</div>
			<div className="shadow-md bg-white p-3 md:p-8 rounded-md">
				<div className="flex items-center justify-between">
					<h1 className="dashboard-heading">{count} Motions</h1>
				</div>

				<div>
					<Listing posts={posts} proposalType={ProposalType.ALLIANCE_MOTION} />
					<div className="flex justify-end mt-6">
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

export default AllianceMotions;