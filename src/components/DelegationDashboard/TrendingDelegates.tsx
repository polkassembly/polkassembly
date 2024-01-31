// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { IDelegate } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegateCard from './DelegateCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Pagination } from '~src/ui-components/Pagination';
import Loader from '~src/ui-components/Loader';
import { useTheme } from 'next-themes';

const TrendingDelegates = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegate[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [showMore, setShowMore] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();

	const getData = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IDelegate[]>('api/v1/delegations/delegates');
		if (data) {
			setDelegatesData(data);
		} else {
			console.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const itemsPerPage = showMore ? 10 : 6;
	const totalPages = Math.ceil(delegatesData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const onChange = (page: number) => {
		setCurrentPage(page);
	};

	const prevPage = () => {
		setCurrentPage((oldPage) => {
			let prevPage = oldPage - 1;
			if (prevPage < 1) {
				prevPage = totalPages;
			}
			return prevPage;
		});
	};

	const nextPage = () => {
		setCurrentPage((oldPage) => {
			let nextPage = oldPage + 1;
			if (nextPage > totalPages) {
				nextPage = 1;
			}
			return nextPage;
		});
	};

	useEffect(() => {
		if (showMore && currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [showMore, currentPage, delegatesData.length, itemsPerPage, totalPages]);

	return (
		<div className='mt-[32px] rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-3'>
					<ImageIcon
						src='/assets/delegation-tracks/trending-icon.svg'
						alt='trending icon'
						imgClassName='h-6 w-6 mt-[2.5px]'
					/>
					<span className='text-xl font-semibold'>Trending Delegates</span>
					<div className='flex space-x-[6px]'>
						<div
							onClick={prevPage}
							style={{ transform: 'rotateY(180deg)' }}
						>
							<ImageIcon
								src='/assets/delegation-tracks/chevron-right.svg'
								alt='chevron left icon'
								className='cursor-pointer'
							/>
						</div>
						<div onClick={nextPage}>
							<ImageIcon
								src='/assets/delegation-tracks/chevron-right.svg'
								alt='chevron right icon'
								className='cursor-pointer'
							/>
						</div>
					</div>
				</div>
				<span
					onClick={() => setShowMore(!showMore)}
					className='cursor-pointer text-xs font-medium text-pink_primary'
				>
					{showMore ? 'Show Less' : 'Show More'}
				</span>
			</div>
			{loading ? (
				<Loader
					size='large'
					className='mt-4'
				/>
			) : (
				<>
					<div className='mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1'>
						{[
							...delegatesData.filter((item) => item?.address === 'F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ'),
							...delegatesData
								.filter((item) => item?.address !== 'F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ')
								.sort((a, b) => b.active_delegation_count - a.active_delegation_count)
						]
							.slice(startIndex, endIndex)
							.map((delegate, index) => (
								<DelegateCard
									key={index}
									delegate={delegate}
								/>
							))}
					</div>
					<div className='mt-6 flex justify-end'>
						<Pagination
							theme={theme}
							size='large'
							defaultCurrent={1}
							current={currentPage}
							onChange={onChange}
							total={delegatesData.length || 0}
							showSizeChanger={false}
							pageSize={itemsPerPage}
							responsive={true}
							hideOnSinglePage={true}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default TrendingDelegates;
