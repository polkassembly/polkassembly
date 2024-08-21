// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ActiveProposalsIcon from '~assets/icons/active-proposals.svg';
import ExpandIcon from '~assets/icons/expand.svg';
import { IPostListing } from 'pages/api/v1/listing/on-chain-posts';
import dynamic from 'next/dynamic';
import { Empty } from 'antd';
import { ETrackDelegationStatus } from '~src/types';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { Pagination } from '~src/ui-components/Pagination';
import Skeleton from '~src/basic-components/Skeleton';

interface Props {
	className?: string;
	posts: IPostListing[];
	trackDetails: any;
	status: ETrackDelegationStatus[];
	delegatedTo: string | null;
	totalCount: number;
	theme: string;
}

const ActiveProposalCard = dynamic(() => import('./ActiveProposalCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const ActiveProposals = ({ className, posts, trackDetails, status, delegatedTo, totalCount }: Props) => {
	const [expandProposals, setExpandProposals] = useState<boolean>(totalCount > 0 ? true : false);
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [page, setPage] = useState<number>(1);

	return (
		<div className={`${className} mt-5 rounded-xl bg-white px-8 py-6 dark:bg-section-dark-overlay`}>
			<div
				onClick={() => setExpandProposals(!expandProposals)}
				className=' shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex cursor-pointer items-center justify-between'
			>
				<div className='jutify-center flex items-center gap-2'>
					<ActiveProposalsIcon className='mr-1' />
					<span className='text-2xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-white'>Active Proposals</span>
					<span className='flex h-8 items-center justify-center rounded-3xl bg-[#D2D8E04D] px-3 py-1.5 font-semibold text-bodyBlue dark:text-white'>{totalCount}</span>
				</div>
				<div className='cursor-pointer p-2'>
					<ExpandIcon className={`${expandProposals && 'rotate-180'}`} />
				</div>
			</div>
			{expandProposals ? (
				posts?.length > 0 ? (
					<div className='mt-5 flex flex-col gap-4'>
						<div className='flex max-h-[630px] flex-col gap-6 overflow-y-auto pr-2'>
							{posts?.map((proposal, index) => (
								<ActiveProposalCard
									proposal={proposal}
									key={index}
									trackDetails={trackDetails}
									status={status}
									delegatedTo={delegatedTo}
								/>
							))}
						</div>
						<div className='flex items-center justify-end'>
							<Pagination
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={totalCount}
								showSizeChanger={false}
								hideOnSinglePage={true}
								current={page}
								onChange={(page: any) => {
									router.replace({
										pathname: '',
										query: {
											...router.query,
											page
										}
									});
									setPage(page);
								}}
								theme={theme}
								responsive={true}
							/>
						</div>
					</div>
				) : (
					<Empty className='mb-4' />
				)
			) : null}
		</div>
	);
};
export default styled(ActiveProposals)`
	.ant-pagination .ant-pagination-item a {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--bodyBlue)')};
	}
	.ant-pagination .ant-pagination-prev button,
	.ant-pagination .ant-pagination-next button {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--bodyBlue)')};
	}
`;
