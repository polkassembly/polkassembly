// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC ,useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import StatusTag from 'src/ui-components/StatusTag';
import Pagination from 'antd/lib/pagination';
import styled from 'styled-components';
interface IBountyChildBountiesProps {
	childBounties: any[];
	childBountiesCount: number;
}

const BountyChildBounties: FC<IBountyChildBountiesProps> = (props) => {
	const { childBounties, childBountiesCount } = props;
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 10;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, childBounties.length);

	const paginatedData = childBounties.slice(startIndex, endIndex);
	const handlePageChange = (pageNumber:any) => {
		setCurrentPage(pageNumber);
	};

	return (
		childBounties.length > 0 ?
			<GovSidebarCard>
				<h4 className='dashboard-heading mb-6'>{childBountiesCount} Child Bounties</h4>

				{paginatedData.map(childBounty => (
					childBounty && <Link href={`/child_bounty/${childBounty.index}`} key={childBounty.index} className='mb-6'>
						<div className='my-4 border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-2 md:p-4'>
							<div className="flex justify-between gap-x-4">
								<div className='w-[70%] break-words p-1'>
									<h5 className='h-[60px] overflow-hidden p-0 text-sm m-auto'>{childBounty.description} || {`#${childBounty.index} Untitled`}</h5>
								</div>
								{childBounty.status && <StatusTag
									className='statusTag m-auto'
									status={childBounty.status}
								/>}
							</div>
						</div>
					</Link>
				))}
				<PaginationContainer className="flex mt-4 justify-center items-center">
					<Pagination
						size="small"
						className="pagination-container"
						current={currentPage}
						total={childBountiesCount}
						pageSize={itemsPerPage}
						showSizeChanger={false}
						responsive={true}
						hideOnSinglePage={true}
						onChange={handlePageChange}
						showPrevNextJumpers={false}
					/>
				</PaginationContainer>
			</GovSidebarCard>
			: <></>
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
