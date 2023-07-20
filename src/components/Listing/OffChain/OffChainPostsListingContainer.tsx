// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination } from 'antd';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { handlePaginationChange } from 'src/util/handlePaginationChange';

import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType } from '~src/global/proposalType';

import OffChainPostsListing from './OffChainPostsListing';

const LIMIT = 10;

interface IOffChainPostsListingContainerProps {
  posts: any[];
  className?: string;
  sortBy: string;
  count: number | null | undefined;
  proposalType: OffChainProposalType;
}

const OffChainPostsListingContainer: FC<
  IOffChainPostsListingContainerProps
> = ({ posts, className, count, proposalType }) => {
	const router = useRouter();
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
			<div className={className}>
				<OffChainPostsListing proposalType={proposalType} posts={posts} />
			</div>
			<div className="flex justify-end mt-6 pb-5">
				{!!count && count > 0 && count > LIMIT && (
					<Pagination
						defaultCurrent={1}
						pageSize={LIMIT}
						total={count}
						showSizeChanger={false}
						hideOnSinglePage={true}
						onChange={onPaginationChange}
						responsive={true}
					/>
				)}
			</div>
		</>
	);
};

export default OffChainPostsListingContainer;
