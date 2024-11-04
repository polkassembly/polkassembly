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
import { poppins } from 'pages/_app';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation('common');
	const [expandProposals, setExpandProposals] = useState<boolean>(totalCount > 0);
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [page, setPage] = useState<number>(1);

	return (
		<div className={`${className} mt-5 rounded-xl bg-white px-4 py-1 dark:bg-section-dark-overlay sm:px-8 sm:py-6`}>
			<div
				onClick={() => setExpandProposals(!expandProposals)}
				className=' shadow-[0px 4px 6px rgba(0, 0, 0, 0.08)] flex cursor-pointer items-center justify-between'
			>
				<div className={`${poppins.className} ${poppins.variable} flex items-center justify-center gap-2`}>
					<Image
						src={'/assets/icons/active-proposals.svg'}
						height={22}
						width={22}
						alt=''
						className={'sm:hidden'}
					/>
					<span className='hidden sm:block'>
						<ActiveProposalsIcon className='mr-1' />
					</span>
					<span className='text-base font-semibold tracking-[0.0015em] text-blue-light-high dark:text-white sm:text-2xl'>{t('active_proposals')}</span>
					<span className='flex items-center justify-center rounded-3xl bg-[#D2D8E04D] px-2 py-1 text-[10px] font-semibold text-bodyBlue dark:text-white sm:px-3 sm:py-1.5 sm:text-base'>
						{totalCount}
					</span>
				</div>
				<div className='cursor-pointer p-2'>
					<ExpandIcon className={`${expandProposals && 'rotate-180'}`} />
				</div>
			</div>
			{expandProposals ? (
				posts?.length > 0 ? (
					<div className='mt-1 flex flex-col gap-3 sm:mt-5 sm:gap-4'>
						<div className='flex max-h-[630px] flex-col gap-4 overflow-y-auto pr-2 sm:gap-6'>
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
					<Empty
						className='mb-4'
						description={t('no_active_proposals')}
					/>
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
