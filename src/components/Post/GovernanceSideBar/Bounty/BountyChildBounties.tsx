// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC ,useState,useEffect } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import StatusTag from 'src/ui-components/StatusTag';
import Pagination from 'antd/lib/pagination';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import child_bounties, { IChildBountiesResponse } from 'pages/api/v1/child_bounties';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { useRouter } from 'next/router';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface IBountyChildBountiesProps {
	childBounties: any[];
	child_bounties_count: number;
}

const BountyChildBounties: FC<IBountyChildBountiesProps> = () => {

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [bountiesRes, setBountiesRes] = useState<IChildBountiesResponse>();
	const[loading , setLoading] = useState(true);

	const handlePageChange = (pageNumber:any) => {
		setCurrentPage(pageNumber);
	};
	const router = useRouter();
	const { id } = router.query;
	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IChildBountiesResponse>(`api/v1/child_bounties?page=${currentPage}&listingLimit=${VOTES_LISTING_LIMIT}&postId=${id}`)
			.then((res) => {
				const data = res.data;
				// console.log('data' , data);
				setBountiesRes(data);
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [currentPage,id]);

	return (
		<Spin indicator={<LoadingOutlined />} spinning={loading}>
			{child_bounties.length > 0 && typeof bountiesRes?.child_bounties_count !== 'undefined' && bountiesRes.child_bounties_count > 0 ? (
				<GovSidebarCard>
					<h4 className='dashboard-heading mb-6'>{bountiesRes?.child_bounties_count} Child Bounties</h4>
					{bountiesRes?.child_bounties.map(childBounty => (
						childBounty && (
							<Link href={`/child_bounty/${childBounty.index}`} key={childBounty.index} className='mb-6'>
								<div className='my-4 border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-2 md:p-4'>
									<div className="flex justify-between gap-x-4">
										<div className='w-[70%] break-words p-1'>
											<h5 className='h-[60px] overflow-hidden p-0 text-sm m-auto'>{childBounty.description} || {`#${childBounty.index} Untitled`}</h5>
										</div>
										{childBounty.status && (
											<StatusTag
												className='statusTag m-auto'
												status={childBounty.status}
											/>
										)}
									</div>
								</div>
							</Link>
						)
					))}
					<PaginationContainer className="flex mt-4 justify-end items-center">
						<Pagination
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
				</GovSidebarCard>
			) : <></>}
		</Spin>

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
