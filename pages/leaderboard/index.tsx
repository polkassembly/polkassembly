// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import TrophyIcon from '~assets/TrophyCup.svg';
import { useNetworkSelector } from '~src/redux/selectors';
import LeaderboardData from './LeaderboardData';
import { useTheme } from 'next-themes';
import { Input } from 'antd';
import Image from 'next/image';
import StarIcon from '~assets/icons/StarIcon.svg';
import InfoIcon from '~assets/info.svg';
import ImageIcon from '~src/ui-components/ImageIcon';

const Leaderboard = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [searchedUsername, setSearchedUsername] = useState<string | undefined>();

	return (
		<section>
			<div
				className='h-[122px] w-full rounded-[20px] py-6'
				style={{
					background: 'var(--Blue-Linear, linear-gradient(358deg, #262323 31.71%, #1D2182 136.54%))'
				}}
			>
				<div>
					<TrophyIcon className='absolute right-[764px] top-[56px] z-10' />
					<h1 className='m-0 flex items-center justify-center p-0 text-[40px] font-semibold text-white'>Leaderboard</h1>
					<p className='m-0 flex items-center justify-center p-0 text-sm text-white '>Find your rank in {network} ecosystem</p>
				</div>
			</div>
			<div className='m-0 -ml-1 mt-6 flex w-full items-center justify-center p-0'>
				<div>
					<Image
						src='/assets/SecondPlace.svg'
						alt='secondPlace'
						width={396}
						height={197}
					/>
					<div>
						<div className='absolute right-[1050px] top-[282px] w-[94px]'>
							<p className='m-0 flex justify-center p-0 text-base font-semibold text-bodyBlue'>Rank 02</p>
							<div
								className='flex h-7 w-[93px] items-center justify-center rounded-lg bg-[#FFD669]'
								style={{ border: '0.9px solid #9EA1A7' }}
							>
								<StarIcon />
								<p className='m-0 p-0 text-sm text-[#534930]'>1000</p>
								<InfoIcon style={{ transform: 'scale(0.8)' }} />
							</div>
						</div>
						<div className='absolute right-[932px] top-[366px] flex h-[18px] w-[336px] items-center'>
							<p className='m-0 p-0'>Vaibhav Gr8</p>
							<div className='ml-auto flex'>
								{theme === 'dark' ? (
									<div className='flex items-center justify-start'>
										<ImageIcon
											src='/assets/icons/auctionIcons/delegateDarkIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/monetizationDarkIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/BookmarkDark.svg'
											alt='delegation-icon'
											className='icon-container'
										/>
									</div>
								) : (
									<div className='flex items-center justify-start'>
										<ImageIcon
											src='/assets/icons/auctionIcons/delegateLightIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/monetizationLightIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/BookmarkLight.svg'
											alt='delegation-icon'
											className='icon-container'
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className='h-[218px] w-[458px]'>
					<Image
						src='/assets/FirstPlace.svg'
						alt='firstPlace'
						width={456}
						height={217}
					/>
					<div className='h-[218px] w-[458px]'>
						<div className='absolute right-[628px] top-[274px] w-[94px]'>
							<p className='m-0 flex justify-center p-0 text-base font-semibold text-bodyBlue'>Rank 01</p>
							<div
								className='flex h-7 w-[93px] items-center justify-center rounded-lg bg-[#FFD669]'
								style={{ border: '0.9px solid #9EA1A7' }}
							>
								<StarIcon />
								<p className='m-0 p-0 text-sm text-[#534930]'>1000</p>
								<InfoIcon style={{ transform: 'scale(0.8)' }} />
							</div>
						</div>
						<div className='absolute right-[478px] top-[356px] flex h-[18px] w-[392px] items-center'>
							<p className='m-0 p-0'>Vaibhav Gr8</p>
							<div className='ml-auto flex'>
								{theme === 'dark' ? (
									<div className='flex items-center justify-start'>
										<ImageIcon
											src='/assets/icons/auctionIcons/delegateDarkIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/monetizationDarkIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/BookmarkDark.svg'
											alt='delegation-icon'
											className='icon-container'
										/>
									</div>
								) : (
									<div className='flex items-center justify-start'>
										<ImageIcon
											src='/assets/icons/auctionIcons/delegateLightIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/monetizationLightIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/BookmarkLight.svg'
											alt='delegation-icon'
											className='icon-container'
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				<div>
					<Image
						src='/assets/ThirdPlace.svg'
						alt='thirdPlace'
						width={396}
						height={197}
					/>
					<div>
						<div className='absolute right-[200px] top-[282px] w-[94px]'>
							<p className='m-0 flex justify-center p-0 text-base font-semibold text-bodyBlue'>Rank 03</p>
							<div
								className='flex h-7 w-[93px] items-center justify-center rounded-lg bg-[#FFD669]'
								style={{ border: '0.9px solid #9EA1A7' }}
							>
								<StarIcon />
								<p className='m-0 p-0 text-sm text-[#534930]'>1000</p>
								<InfoIcon style={{ transform: 'scale(0.8)' }} />
							</div>
						</div>
						<div className='absolute right-[78px] top-[366px] flex h-[18px] w-[336px] items-center'>
							<p className='m-0 p-0'>Vaibhav Gr8</p>
							<div className='ml-auto flex'>
								{theme === 'dark' ? (
									<div className='flex items-center justify-start'>
										<ImageIcon
											src='/assets/icons/auctionIcons/delegateDarkIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/monetizationDarkIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/BookmarkDark.svg'
											alt='delegation-icon'
											className='icon-container'
										/>
									</div>
								) : (
									<div className='flex items-center justify-start'>
										<ImageIcon
											src='/assets/icons/auctionIcons/delegateLightIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/monetizationLightIcon.svg'
											alt='delegation-icon'
											className='icon-container mr-4'
										/>
										<ImageIcon
											src='/assets/icons/auctionIcons/BookmarkLight.svg'
											alt='delegation-icon'
											className='icon-container'
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='mt-8 rounded-xxl bg-white px-6 py-9 shadow-md dark:bg-section-dark-overlay'>
				<div className='flex items-center'>
					<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>Top 50 Ranks</p>
					<div className='ml-auto flex'>
						<Input.Search
							placeholder='enter address to search'
							className='m-0 h-[48px] w-[285px] rounded-[4px] p-0 px-3.5 py-2.5 text-[#7788a0] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							onSearch={(value) => {
								setSearchedUsername(value);
							}}
							onChange={(e) => {
								setSearchedUsername(e.target.value);
							}}
						/>
					</div>
				</div>
				<LeaderboardData
					className='mt-6'
					theme={theme}
					searchedUsername={searchedUsername}
				/>
			</div>
		</section>
	);
};

export default Leaderboard;
