// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin } from 'antd';
import { Pagination } from '~src/ui-components/Pagination';
import { IChildBountiesResponse } from 'pages/api/v1/child_bounties';
import React, { FC, useEffect, useState } from 'react';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

interface IChildBountiesProps {
	bountyId?: number | string | null;
}

const ChildBounties: FC<IChildBountiesProps> = (props) => {
	const { bountyId } = props;
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { resolvedTheme: theme } = useTheme();
	const handlePageChange = (pageNumber: any) => {
		setCurrentPage(pageNumber);
	};

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IChildBountiesResponse>(`api/v1/child_bounties?page=${currentPage}&listingLimit=${VOTES_LISTING_LIMIT}&postId=${bountyId}`)
			.then((res) => {
				const data = res.data;
				setLoading(false);
				console.log(data);
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
	}, [currentPage, bountyId]);

	return (
		<GovSidebarCard className='min-h-[200px]'>
			<Spin
				indicator={<LoadingOutlined />}
				spinning={loading}
			></Spin>
			<h4 className='dashboard-heading mb-6 dark:text-white'>Bounty Amount</h4>
			<PaginationContainer className='mt-4 flex items-center justify-end'>
				<Pagination
					theme={theme}
					size='small'
					className='pagination-container'
					current={currentPage}
					// total={bountiesRes?.child_bounties_count}
					pageSize={VOTES_LISTING_LIMIT}
					showSizeChanger={false}
					responsive={true}
					hideOnSinglePage={true}
					onChange={handlePageChange}
					showPrevNextJumpers={false}
				/>
			</PaginationContainer>
		</GovSidebarCard>
	);
};

const PaginationContainer = styled.div`
	.pagination-container .ant-pagination-item {
		border-color: #e5007a;
		color: #e5007a;
	}
	.pagination-container .ant-pagination-item-active a {
		color: #e5007a;
	}
`;

export default ChildBounties;
