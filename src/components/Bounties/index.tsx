// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useRef, useState } from 'react';
import BountiesHeader from './BountiesHeader';
import ImageIcon from '~src/ui-components/ImageIcon';
import Image from 'next/image';
import BountyActivities from './BountyActivities';
import { Carousel } from 'antd';
import { useRouter } from 'next/router';
import { spaceGrotesk } from 'pages/_app';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import HotBountyCard from './HotBountyCard';
import BountiesProposalsCard from './BountiesProposalsCard';
import { chunkArray } from './utils/ChunksArr';

interface IBountiesContainer {
	extendedData?: IPostsListingResponse;
	activeData?: IPostsListingResponse;
}

const BountiesContainer: FC<IBountiesContainer> = ({ extendedData, activeData }) => {
	const carouselRef1 = useRef<any>(null);
	const carouselRef2 = useRef<any>(null);
	const [currentSlide1, setCurrentSlide1] = useState<number>(0);
	const [currentSlide2, setCurrentSlide2] = useState<number>(0);
	const router = useRouter();

	const handleBeforeChange1 = (next: number) => {
		setCurrentSlide1(next);
	};

	const handleBeforeChange2 = (next: number) => {
		setCurrentSlide2(next);
	};

	const extendedDataChunks = extendedData ? chunkArray(extendedData.posts, 3) : [];
	const activeDataChunks = activeData ? chunkArray(activeData.posts, 3) : [];

	return (
		<main>
			<div className='flex items-center justify-between'>
				<h2 className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Bounties</h2>
				<button className='bounty-button flex cursor-pointer items-center gap-[6px] rounded-[20px] border-none px-[22px] py-[11px] '>
					<ImageIcon
						src='/assets/bounty-icons/proposal-icon.svg'
						alt='bounty icon'
						imgClassName=''
					/>
					<span className='font-bold text-white'>Create Bounty Proposal</span>
				</button>
			</div>
			<BountiesHeader />

			{/* // Hot Bounties */}
			<div className='mt-7 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<ImageIcon
						src='/assets/bounty-icons/fire-icon.svg'
						alt='bounty icon'
						imgClassName='-mt-[18px]'
					/>
					<h2 className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Hot Bounties</h2>
				</div>
				<button
					onClick={() => {
						router.push('/bounties');
					}}
					className={`${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer rounded-[20px] border-none bg-transparent text-[26px] font-bold text-pink_primary`}
				>
					View All
				</button>
			</div>

			<div className='relative '>
				{currentSlide1 > 0 && (
					<span
						onClick={() => carouselRef1?.current?.prev()}
						className='rotate-180 cursor-pointer'
						style={{ left: -45, position: 'absolute', top: '35%', zIndex: 10 }}
					>
						<ImageIcon
							src='/assets/bounty-icons/carousel-icon.svg'
							alt='carousel icon'
						/>
					</span>
				)}
				<Carousel
					ref={carouselRef1}
					arrows
					infinite={false}
					dots={false}
					afterChange={handleBeforeChange1}
				>
					{extendedDataChunks.map((chunk, index) => (
						<div
							key={index}
							className='flex justify-between space-x-4'
						>
							{chunk.map((post, postIndex) => (
								<HotBountyCard
									key={postIndex}
									extendedData={post}
								/>
							))}
						</div>
					))}
				</Carousel>
				{currentSlide1 < extendedDataChunks.length - 1 && (
					<span
						onClick={() => carouselRef1?.current?.next()}
						className='cursor-pointer'
						style={{ position: 'absolute', right: -46, top: '35%', zIndex: 10 }}
					>
						<ImageIcon
							src='/assets/bounty-icons/carousel-icon.svg'
							alt='carousel icon'
						/>
					</span>
				)}
			</div>

			{/* Bounty Proposals */}
			<div className='mt-8 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<ImageIcon
						src='/assets/bounty-icons/bounty-proposals.svg'
						alt='bounty icon'
						imgClassName='-mt-[18px]'
					/>
					<h2 className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Bounty Proposals</h2>
				</div>
			</div>
			<div className='relative '>
				{currentSlide2 > 0 && (
					<span
						onClick={() => carouselRef2?.current?.prev()}
						className='rotate-180 cursor-pointer'
						style={{ left: -45, position: 'absolute', top: '40%', zIndex: 10 }}
					>
						<ImageIcon
							src='/assets/bounty-icons/carousel-icon.svg'
							alt='carousel icon'
						/>
					</span>
				)}
				<Carousel
					ref={carouselRef2}
					arrows
					infinite={false}
					dots={false}
					afterChange={handleBeforeChange2}
				>
					{activeDataChunks.map((chunk, index) => (
						<div
							key={index}
							className='flex justify-between space-x-4'
						>
							{chunk.map((post, postIndex) => (
								<BountiesProposalsCard
									key={postIndex}
									activeData={post}
								/>
							))}
						</div>
					))}
				</Carousel>
				{currentSlide2 < activeDataChunks.length - 1 && (
					<span
						onClick={() => carouselRef2?.current?.next()}
						className='cursor-pointer'
						style={{ position: 'absolute', right: -46, top: '40%', zIndex: 10 }}
					>
						<ImageIcon
							src='/assets/bounty-icons/carousel-icon.svg'
							alt='carousel icon'
						/>
					</span>
				)}
			</div>

			{/* Footer */}
			<div className='mt-10 flex items-center gap-8'>
				<Image
					src={'assets/bounty-icons/bounty-coming-soon.svg'}
					width={753}
					height={400}
					alt='curator'
				/>
				<BountyActivities />
			</div>
		</main>
	);
};

export default BountiesContainer;
