// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useRef, useState } from 'react';
import BountiesHeader from './BountiesHeader';
import ImageIcon from '~src/ui-components/ImageIcon';
import Image from 'next/image';
import BountyActivities from './BountyActivities';
import { Carousel } from 'antd';
import { spaceGrotesk } from 'pages/_app';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import HotBountyCard from './HotBountyCard';
import BountiesProposalsCard from './BountiesProposalsCard';
import { chunkArray } from './utils/ChunksArr';
import BountyProposalActionButton from './bountyProposal';
import Link from 'next/link';
import CuratorDashboardButton from '../CuratorDashboard/CuratorDashboardButton';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';

interface IBountiesContainer {
	extendedData?: IPostsListingResponse;
	activeBountyData?: IPostsListingResponse;
}

const LISTING_LIMIT = 6;

const BountiesContainer: FC<IBountiesContainer> = ({ extendedData, activeBountyData }) => {
	const { resolvedTheme: theme } = useTheme();
	const carouselRef2 = useRef<any>(null);
	const [currentSlide2, setCurrentSlide2] = useState<number>(0);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;

	const handleBeforeChange2 = (next: number) => {
		setCurrentSlide2(next);
	};

	const activeDataChunks = activeBountyData ? chunkArray(activeBountyData.posts, isMobile ? 1 : 3) : [];

	const [currentPage, setCurrentPage] = useState(1);
	const count = extendedData?.count || 0;

	const startIndex = Math.max(0, (currentPage - 1) * LISTING_LIMIT);
	const endIndex = Math.min(startIndex + LISTING_LIMIT, extendedData?.count || 0);
	const paginatedData = extendedData?.posts?.slice(startIndex, endIndex) || [];

	return (
		<main className='mx-3'>
			<div className='flex items-center justify-between'>
				<span className='font-pixelify text-3xl font-bold text-bodyBlue dark:text-blue-dark-high'>Dashboard</span>
				<div className='flex gap-2'>
					<BountyProposalActionButton className='hidden md:block' />
					<CuratorDashboardButton />
				</div>
			</div>
			<BountiesHeader />

			{/* Hot Bounties */}
			{!!extendedData && extendedData.posts.length > 0 && (
				<>
					<div className='mt-8 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<ImageIcon
								src='/assets/bounty-icons/fire-icon.svg'
								alt='bounty icon'
								imgClassName='-mt-[18px]'
							/>
							<h2 className='font-pixelify text-2xl font-bold text-bodyBlue dark:text-blue-dark-high md:text-3xl'>Hot Bounties</h2>
							{extendedData.count && (
								<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -mt-2 text-blue-light-medium dark:text-blue-dark-medium md:-mt-[14px] md:text-[24px]`}>
									({extendedData.count})
								</span>
							)}
						</div>
						<Link
							href={'/bounties-listing'}
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer rounded-[20px] border-none bg-transparent text-base font-bold text-pink_primary md:text-[24px]`}
						>
							View All
						</Link>
					</div>

					{/* Bounty Cards Grid */}
					<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
						{paginatedData.map((post, index) => (
							<HotBountyCard
								key={index}
								extendedData={post}
							/>
						))}
					</div>

					{/* Pagination Controls */}
					<div className='mt-6 flex justify-end'>
						{!!count && count > 0 && count > LISTING_LIMIT && (
							<Pagination
								theme={theme}
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={count}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={(page: number) => {
									setCurrentPage(page);
								}}
								responsive={true}
							/>
						)}
					</div>
				</>
			)}

			{/* Bounty Proposals */}
			{activeBountyData && activeBountyData?.posts?.length > 0 && (
				<>
					<div className='mt-8 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<ImageIcon
								src='/assets/bounty-icons/bounty-proposals.svg'
								alt='bounty icon'
								imgClassName='-mt-[18px]'
							/>
							<h2 className='font-pixelify text-2xl font-bold text-bodyBlue dark:text-blue-dark-high md:text-3xl'>Bounty Proposals</h2>
						</div>
					</div>

					<div className='relative '>
						{currentSlide2 > 0 && (
							<span
								onClick={() => carouselRef2?.current?.prev()}
								className='rotate-180 cursor-pointer'
								style={{ left: -45, position: 'absolute', top: '40%', zIndex: 10, ...(isMobile ? { left: 10 } : {}) }}
							>
								<ImageIcon
									src='/assets/bounty-icons/carousel-icon.svg'
									alt='carousel icon'
									className='scale-75 md:scale-100'
								/>
							</span>
						)}
						<Carousel
							ref={carouselRef2}
							arrows
							className='overflow-hidden'
							infinite={false}
							dots={false}
							afterChange={handleBeforeChange2}
						>
							{activeDataChunks.map((chunk, index) => {
								const chunkClass = chunk.length % 3 === 0 ? 'mx-1.5 flex justify-between space-x-1.5' : 'mx-1.5 flex justify-start space-x-1.5';
								return (
									<div
										key={index}
										className={chunkClass}
									>
										{chunk?.map((post, proposalIndex) => (
											<BountiesProposalsCard
												key={proposalIndex}
												activeData={post}
											/>
										))}
									</div>
								);
							})}
						</Carousel>
						{currentSlide2 < activeDataChunks.length - 1 && (
							<span
								onClick={() => carouselRef2?.current?.next()}
								className='cursor-pointer'
								style={{
									position: 'absolute',
									right: -46,
									top: '40%',
									zIndex: 10,
									...(isMobile ? { right: 10 } : {})
								}}
							>
								<ImageIcon
									src='/assets/bounty-icons/carousel-icon.svg'
									alt='carousel icon'
									className='scale-75 md:scale-100'
								/>
							</span>
						)}
					</div>
				</>
			)}

			{/* Footer */}
			<div className=' mt-10 flex flex-col-reverse items-center gap-8 overflow-hidden md:flex-row'>
				<div className='relative md:w-[50%] xl:w-[60%]'>
					<Image
						src={'/assets/bounty-icons/bounty-poster1.svg'}
						fill
						alt='curator'
						className='relative h-full w-full '
					/>
					<Link
						href='/user-created-bounties'
						passHref
						className={`${spaceGrotesk.className} ${spaceGrotesk.variable} z-100 absolute right-0 top-0 flex h-10 w-[150px] items-center justify-center gap-x-1 rounded-[50px] px-6 text-base font-bold text-white xl:h-[48px] xl:w-[180px] xl:px-[36px] xl:text-xl`}
						style={{
							background: 'linear-gradient(266deg, #301DA7 15.23%, #57F 75.34%)'
						}}
					>
						{' '}
						<div className='flex items-center gap-[2px] '>
							View All
							<ImageIcon
								src='assets/bounty-icons/redirect-white-icon.svg'
								alt='arrow right'
								className=''
							/>
						</div>
					</Link>
				</div>

				<div className='md:w-[50%] xl:w-[40%]'>
					<BountyActivities />
				</div>
			</div>
			<div className='sticky bottom-0 z-20 -ml-4 mt-2 flex w-screen justify-center rounded-t-md bg-white p-2 pt-3 dark:bg-black md:hidden'>
				<BountyProposalActionButton className='w-full' />
			</div>
		</main>
	);
};

export default BountiesContainer;
