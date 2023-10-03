// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC ,useState,useEffect } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import StatusTag from 'src/ui-components/StatusTag';
import  { Pagination as AntdPagination } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IChildBountiesResponse } from 'pages/api/v1/child_bounties';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { PostEmptyState } from '~src/ui-components/UIStates';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
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

const BountyChildBounties: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId } = props;
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [bountiesRes, setBountiesRes] = useState<IChildBountiesResponse>();
	const [loading, setLoading] = useState(true);
	const { resolvedTheme:theme } = useTheme();

	const handlePageChange = (pageNumber:any) => {
		setCurrentPage(pageNumber);
	};
	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IChildBountiesResponse>(`api/v1/child_bounties?page=${currentPage}&listingLimit=${VOTES_LISTING_LIMIT}&postId=${bountyId}`)
			.then((res) => {
				const data = res.data;
				setBountiesRes(data);
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
			});
	}, [currentPage, bountyId]);

	return (
		<GovSidebarCard className='min-h-[200px]'>
			<Spin indicator={<LoadingOutlined />} spinning={loading}>
				<h4 className='dashboard-heading mb-6 dark:text-white dark:font-medium'>{bountiesRes?.child_bounties_count} Child Bounties</h4>
				{bountiesRes && bountiesRes.child_bounties_count > 0? bountiesRes?.child_bounties.map(childBounty => (
					childBounty && (
						<Link href={`/child_bounty/${childBounty.index}`} key={childBounty.index} className='mb-6'>
							<div className='my-4 border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-2 md:p-4 dark:border-separatorDark'>
								<div className="flex justify-between gap-x-4">
									<div className='w-[70%] break-words p-1'>
										<h5 className='h-[60px] overflow-hidden p-0 text-sm m-auto dark:text-white dark:font-normal'>{childBounty.description} || {`#${childBounty.index} Untitled`}</h5>
									</div>
									{childBounty.status && (
										<StatusTag
											theme={theme}
											className='statusTag m-auto'
											status={childBounty.status}
										/>
									)}
								</div>
							</div>
						</Link>
					)
				)): <PostEmptyState />}
				<PaginationContainer className="flex mt-4 justify-end items-center">
					<Pagination
						theme={theme}
						size="small"
						className="pagination-container"
						current={currentPage}
						total={bountiesRes?.child_bounties_count}
						pageSize={VOTES_LISTING_LIMIT}
						showSizeChanger={false}
						responsive={true}
						hideOnSinglePage={true}
						onChange={handlePageChange}
						showPrevNextJumpers={false}
					/>
				</PaginationContainer>
			</Spin>
		</GovSidebarCard>

	);
};

const PaginationContainer = styled.div`
.pagination-container .ant-pagination-item {
  border-color:  #E5007A;
	color: #E5007A;
}
.pagination-container .ant-pagination-item-active a {
	color :  #E5007A;
}
`;

export default BountyChildBounties;
