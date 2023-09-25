// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination as AntdPagination } from 'antd';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { handlePaginationChange } from 'src/util/handlePaginationChange';

import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType } from '~src/global/proposalType';

import OffChainPostsListing from './OffChainPostsListing';

import styled from 'styled-components';
import { useTheme } from 'next-themes';

const LIMIT = 10;

interface IOffChainPostsListingContainerProps {
	posts: any[];
	className?: string;
	sortBy: string;
	count: number | null | undefined;
	proposalType: OffChainProposalType;
}

const Pagination = styled(AntdPagination)`
	a{
		color: ${props => props.theme === 'dark' ? '#fff' : '#212121'} !important;
	}
	.ant-pagination-item-active {
		background-color: ${props => props.theme === 'dark' ? 'black' : 'white'} !important;
	}
	.anticon-right {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
	.anticon-left {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
`;

const OffChainPostsListingContainer: FC<IOffChainPostsListingContainerProps> = ({ posts, className, count, proposalType }) => {
	const router = useRouter();
	const onPaginationChange = (page:number) => {
		router.push({
			query:{
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};
	const { resolvedTheme:theme } = useTheme();

	return (
		<>
			<div className={className}>
				<OffChainPostsListing proposalType={proposalType} posts={posts} />
			</div>
			<div className='flex justify-end mt-6 pb-5'>
				{
					!!count && count > 0 && count > LIMIT &&
						<Pagination
							theme={theme}
							defaultCurrent={1}
							pageSize={LIMIT}
							total={count}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={onPaginationChange}
							responsive={true}
						/>
				}
			</div>
		</>
	);
};

export default OffChainPostsListingContainer;