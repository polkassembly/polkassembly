// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC, useState, useEffect } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import StatusTag from 'src/ui-components/StatusTag';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { PostEmptyState } from '~src/ui-components/UIStates';
import { useTheme } from 'next-themes';
import { Pagination } from '~src/ui-components/Pagination';
import { IChildBountiesResponse } from '~src/types';
import Image from 'next/image';
import CreateChildBountyButton from '~src/components/ChildBountyCreation/CreateChildBountyButton';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import { EBountiesStatuses } from '~src/components/Bounties/BountiesListing/types/types';
import { isBountiesDashboardSupportedNetwork } from '~src/components/Bounties/utils/isBountiesDashboardSupportedNetwork';

interface IBountyChildBountiesProps {
	bountyId?: number | string | null;
	curator?: string;
	bountyStatus: string;
}

const BountyChildBounties: FC<IBountyChildBountiesProps> = (props) => {
	const { bountyId, curator, bountyStatus } = props;
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [bountiesRes, setBountiesRes] = useState<IChildBountiesResponse>();
	const [loading, setLoading] = useState(true);
	const { resolvedTheme: theme } = useTheme();

	const canCreateChildBounty = () => {
		if (!network || !isBountiesDashboardSupportedNetwork(network)) return false;

		return (
			!!(
				[getEncodedAddress(loginAddress || '', network), loginAddress].includes(getEncodedAddress(curator, network) || curator || '') &&
				getBountiesCustomStatuses(EBountiesStatuses.ACTIVE).includes(bountyStatus)
			) || false
		);
	};

	const handlePageChange = (pageNumber: any) => {
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
			<Spin
				indicator={<LoadingOutlined />}
				spinning={loading}
			>
				<div className='flex gap-1.5 dark:text-white'>
					<Image
						src='/assets/icons/child-bounty-icon.svg'
						height={18}
						width={18}
						alt='child bounty icon'
						className={theme == 'dark' ? 'dark-icons' : ''}
					/>
					<span className='text-base font-medium'>Child Bounties({bountiesRes?.child_bounties_count || 0})</span>
				</div>
				{bountiesRes?.child_bounties_count
					? bountiesRes?.child_bounties?.map(
							(childBounty) =>
								childBounty && (
									<Link
										href={`/child_bounty/${childBounty.index}`}
										key={childBounty.index}
										className='mb-6'
									>
										<div className='my-4 rounded-md border-2 border-solid border-grey_light p-2 transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-separatorDark md:p-4'>
											<div className='flex justify-between gap-x-4'>
												<div className='w-[70%] break-words p-1'>
													<h5 className='m-auto max-h-16 overflow-hidden p-0 text-sm dark:text-white'>
														{`#${childBounty.index}`} {childBounty.title}
													</h5>
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
					  )
					: !loading && <PostEmptyState />}

				{canCreateChildBounty() && <CreateChildBountyButton className='mt-4' />}
				<PaginationContainer className='mt-4 flex items-center justify-end'>
					<Pagination
						theme={theme}
						size='small'
						className='pagination-container'
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
		border-color: #e5007a;
		color: #e5007a;
	}
	.pagination-container .ant-pagination-item-active a {
		color: #e5007a;
	}
`;

export default BountyChildBounties;
