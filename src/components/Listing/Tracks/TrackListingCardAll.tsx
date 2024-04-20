// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { useRouter } from 'next/router';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { useEffect, useState } from 'react';
import { Radio } from 'antd';
import TrackListingAllTabContent from './TrackListingAllTabContent';
import TrackListingStatusTabContent from './TrackListingStatusTabContent';
import FilterByTags from '~src/ui-components/FilterByTags';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { Pagination } from '~src/ui-components/Pagination';
import SortByDropdownComponent from '~src/ui-components/SortByDropdown';
import { sortValues } from '~src/global/sortOptions';
import FilterByStatus from '~src/ui-components/FilterByStatus';
import { poppins } from 'pages/_app';

interface Props {
	className?: string;
	posts: IReferendumV2PostsByStatus;
	trackName: string;
}

export enum CustomStatus {
	Submitted = 'CustomStatusSubmitted',
	Voting = 'CustomStatusVoting',
	Closed = 'CustomStatusClosed',
	Active = 'CustomStatusActive'
}

const TrackListingCardAll = ({ className, posts, trackName }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const [selectedRadio, setSelectedRadio] = useState('All');
	const trackStatus = router.query['trackStatus'];
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);
	const [statusItem, setStatusItem] = useState([]);
	const [initialCountForAll, setInitialCountForAll] = useState<number | undefined>(undefined);
	const [initialCountForSubmitted, setInitialCountForSubmitted] = useState<number | undefined>(undefined);
	const [initialCountForVoting, setInitialCountForVoting] = useState<number | undefined>(undefined);
	const [initialCountForClosed, setInitialCountForClosed] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (initialCountForAll === undefined && posts?.all?.data?.count !== undefined) {
			setInitialCountForAll(posts?.all?.data?.count);
			setInitialCountForSubmitted(posts?.submitted?.data?.count);
			setInitialCountForVoting(posts?.voting?.data?.count);
			setInitialCountForClosed(posts?.closed?.data?.count);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const trackStatus = router.query['trackStatus'];
		if (trackStatus) {
			setSelectedRadio(trackStatus.toString().charAt(0).toUpperCase() + trackStatus.toString().slice(1));
		}
	}, [router.query]);

	const onRadioChange = (e: any) => {
		setSelectedRadio(e.target.value);

		router.push({
			pathname: router.pathname,
			query: { ...router.query, trackStatus: e.target.value.toLowerCase() }
		});
	};

	const getContent = () => {
		switch (selectedRadio) {
			case 'All':
				return (
					<TrackListingAllTabContent
						posts={posts?.all?.data?.posts || []}
						error={posts?.all?.error}
						count={posts?.all?.data?.count || 0}
						statusItem={statusItem}
					/>
				);
			case 'Submitted':
				return (
					<TrackListingStatusTabContent
						posts={posts?.submitted?.data?.posts || []}
						error={posts?.submitted?.error}
						trackName={trackName}
						count={posts?.submitted?.data?.count || 0}
						status={CustomStatus.Submitted}
						statusItem={statusItem}
					/>
				);
			case 'Voting':
				return (
					<TrackListingStatusTabContent
						posts={posts?.voting?.data?.posts || []}
						error={posts?.voting?.error}
						trackName={trackName}
						count={posts?.voting?.data?.count || 0}
						status={CustomStatus.Voting}
						statusItem={statusItem}
					/>
				);
			case 'Closed':
				return (
					<TrackListingStatusTabContent
						posts={posts?.closed?.data?.posts || []}
						error={posts?.closed?.error}
						trackName={trackName}
						count={posts?.closed?.data?.count || 0}
						status={CustomStatus.Closed}
						statusItem={statusItem}
					/>
				);
			default:
				return null;
		}
	};

	const onPaginationChange = (page: number) => {
		router.push({
			pathname: router.pathname,
			query: {
				...router.query,
				page,
				trackStatus: selectedRadio.toLowerCase()
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};
	return (
		<div className={`${className}`}>
			<div className='items-center justify-between px-1 pb-5 pt-2 sm:flex sm:flex-row-reverse'>
				<div className='mb-3 flex items-center justify-end gap-x-2 sm:mb-0'>
					{trackStatus !== 'submitted' && <FilterByStatus setStatusItem={setStatusItem} />}
					<FilterByTags />
					<SortByDropdownComponent
						sortBy={sortBy}
						setSortBy={setSortBy}
						isUsedInTrackListing={true}
					/>
				</div>
				<Radio.Group
					onChange={onRadioChange}
					value={selectedRadio}
					className={`my-auto flex gap-[1px] ${poppins.variable} ${poppins.className} sm:flex-wrap`}
					style={{ marginBottom: 16 }}
				>
					<Radio
						value='All'
						className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'
					>
						All ({initialCountForAll || 0}){' '}
					</Radio>
					<Radio
						value='Submitted'
						className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'
					>
						Submitted ({initialCountForSubmitted || 0})
					</Radio>
					<Radio
						value='Voting'
						className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'
					>
						Voting ({initialCountForVoting || 0})
					</Radio>
					<Radio
						value='Closed'
						className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'
					>
						Closed ({initialCountForClosed || 0})
					</Radio>
				</Radio.Group>
			</div>
			{/* <FilterByTags className='xs:mb-2 xs:mr-1 xs:mt-1 sm:hidden' /> */}
			{getContent()}
			{((posts?.all?.data?.count || 0) > 10 && selectedRadio === 'All') ||
			((posts?.submitted?.data?.count || 0) > 10 && selectedRadio === 'Submitted') ||
			((posts?.voting?.data?.count || 0) > 10 && selectedRadio === 'Voting') ||
			((posts?.closed?.data?.count || 0) > 10 && selectedRadio === 'Closed') ? (
				<Pagination
					theme={theme}
					className='mb-2 mt-4 flex justify-end px-4 sm:mt-6 sm:px-10'
					defaultCurrent={1}
					current={router.query.page ? parseInt(router.query.page as string, 10) : 1}
					onChange={onPaginationChange}
					pageSize={LISTING_LIMIT}
					showSizeChanger={false}
					total={posts?.[selectedRadio.toLowerCase() as keyof IReferendumV2PostsByStatus]?.data?.count || 0}
					responsive={true}
				/>
			) : null}
		</div>
	);
};

export default styled(TrackListingCardAll)`
	.ant-tabs-nav {
		margin-left: 15px;
	}
	.ant-tabs-nav-list {
		width: 100%;
		[data-node-key='Filter'] {
			position: absolute;
			right: 0;
			margin-top: -9.5px;
		}
	}
	@media only screen and (max-width: 640px) {
		.ant-tabs-nav {
			margin-left: 0px;
			margin-top: 0px;
		}
		.ant-tabs-nav-list {
			width: auto;
			[data-node-key='Filter'] {
				display: none;
			}
		}
	}
`;
