// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useRef, useState } from 'react';
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
import { ArrowRightOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { useUserDetailsSelector } from '~src/redux/selectors';

interface IBountiesContainer {
	extendedData?: IPostsListingResponse;
	activeBountyData?: IPostsListingResponse;
}

const BountiesContainer: FC<IBountiesContainer> = ({ extendedData, activeBountyData }) => {
	const carouselRef1 = useRef<any>(null);
	const carouselRef2 = useRef<any>(null);
	const [currentSlide1, setCurrentSlide1] = useState<number>(0);
	const [currentSlide2, setCurrentSlide2] = useState<number>(0);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;

	const handleBeforeChange1 = (next: number) => {
		setCurrentSlide1(next);
	};

	const handleBeforeChange2 = (next: number) => {
		setCurrentSlide2(next);
	};

	const extendedDataChunks = extendedData ? chunkArray(extendedData.posts, isMobile ? 1 : 3) : [];
	const activeDataChunks = activeBountyData ? chunkArray(activeBountyData.posts, isMobile ? 1 : 3) : [];
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [curatorData, setCuratorData] = React.useState<any>();

	const fetchCuratorBountiesData = async () => {
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			const { data } = await nextApiClientFetch<any>('api/v1/bounty/curator/getCuratorGeneralInfo', {
				userAddress: substrateAddress
			});
			if (data) {
				setCuratorData(data);
			}
		}
	};

	useEffect(() => {
		fetchCuratorBountiesData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);
	return (
		<main className='mx-3'>
			<div className='flex items-center justify-between'>
				<span className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Dashboard</span>
				<div className='flex gap-2'>
					<BountyProposalActionButton className='hidden md:block' />
					{/* {(curatorData?.allBounties?.count > 0 || curatorData?.childBounties?.count > 0) && ( */}
					<Link
						href='/curator-dashboard'
						className={`cursor-pointer rounded-xl text-[16px] font-bold text-white hover:text-white ${spaceGrotesk.className} ${spaceGrotesk.variable} px-6 py-3`}
						style={{
							background:
								'radial-gradient(395.27% 77.56% at 25.57% 34.38%, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(192.36% 96% at -3.98% 12.5%, #4B33FF 13.96%, #83F 64.39%, rgba(237, 66, 179, 0.00) 100%), radial-gradient(107.92% 155.46% at 50% 121.74%, #F512EE 0%, #62A0FD 80.98%)',
							boxShadow: '1px 1px 4px 0px rgba(255, 255, 255, 0.50) inset'
						}}
					>
						Curator Dashboard <ArrowRightOutlined className='-rotate-45 font-bold' />
					</Link>
					{/* )} */}
				</div>
			</div>
			<BountiesHeader />

			{/* Hot Bounties */}
			{extendedData && extendedData?.posts?.length > 0 && (
				<>
					<div className='mt-8 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<ImageIcon
								src='/assets/bounty-icons/fire-icon.svg'
								alt='bounty icon'
								imgClassName='-mt-[18px]'
							/>
							<h2 className='font-pixelify text-[24px] font-bold text-blue-light-high dark:text-blue-dark-high md:text-[32px]'>Hot Bounties</h2>
							{extendedData?.count && (
								<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -mt-2 text-blue-light-medium dark:text-blue-dark-medium md:-mt-[14px] md:text-[24px]`}>
									({extendedData?.count})
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

					<div className='relative '>
						{currentSlide1 > 0 && (
							<span
								onClick={() => carouselRef1?.current?.prev()}
								className='rotate-180 cursor-pointer'
								style={{ left: -45, position: 'absolute', top: '35%', zIndex: 10, ...(isMobile ? { left: 10 } : {}) }}
							>
								<ImageIcon
									src='/assets/bounty-icons/carousel-icon.svg'
									alt='carousel icon'
									className='scale-75 md:scale-100'
								/>
							</span>
						)}
						<Carousel
							ref={carouselRef1}
							arrows
							className='overflow-hidden'
							infinite={false}
							dots={false}
							afterChange={handleBeforeChange1}
						>
							{extendedDataChunks.map((chunk, index) => {
								const chunkClass = chunk.length % 3 === 0 ? 'flex justify-center md:justify-around' : 'flex justify-start';
								return (
									<div
										key={index}
										className={chunkClass}
									>
										{chunk.map((post, postIndex) => (
											<HotBountyCard
												key={postIndex}
												extendedData={post}
											/>
										))}
									</div>
								);
							})}
						</Carousel>
						{currentSlide1 < extendedDataChunks.length - 1 && (
							<span
								onClick={() => carouselRef1?.current?.next()}
								className='cursor-pointer'
								style={{
									position: 'absolute',
									right: -46,
									top: '35%',
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
							<h2 className='font-pixelify text-[24px] font-bold text-blue-light-high dark:text-blue-dark-high md:text-[32px]'>Bounty Proposals</h2>
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
								const chunkClass = chunk.length % 3 === 0 ? 'mx-3 flex justify-between space-x-4' : 'mx-3 flex justify-start space-x-4';
								return (
									<div
										key={index}
										className={chunkClass}
									>
										{chunk.map((post, proposalIndex) => (
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
			<div className='mt-10 flex flex-col-reverse items-center gap-8 overflow-hidden md:flex-row'>
				<Image
					src={'assets/bounty-icons/bounty-coming-soon.svg'}
					fill
					alt='curator'
					className='relative h-auto w-full md:w-[50%] xl:w-[60%]'
				/>
				<BountyActivities />
			</div>
			<div className='sticky bottom-0 z-20 -ml-4 mt-2 flex w-screen justify-center rounded-t-md bg-white p-2 pt-3 dark:bg-black md:hidden'>
				<BountyProposalActionButton className='w-full' />
			</div>
		</main>
	);
};

export default BountiesContainer;
