// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import ImageComponent from '~src/components/ImageComponent';
import NameLabel from '~src/ui-components/NameLabel';
import DelegateModal from '~src/components/Listing/Tracks/DelegateModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Divider } from 'antd';
import Tipping from '~src/components/Tipping';
import { IRankCardProps } from './types';
import { dmSans } from 'pages/_app';
import dayjs from 'dayjs';
import ScoreTag from '~src/ui-components/ScoreTag';

const RankCard: React.FC<IRankCardProps> = ({ place, data, theme, type, className }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);

	const getUserProfile = async (username: string) => {
		const { data, error } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (!data || error) {
			console.log(error);
		}
		if (data) {
			setAddress(data?.addresses[0]);
		}
	};

	const placeImageMap: Record<number, string> =
		theme === 'dark'
			? {
					1: '/assets/FirstPlaceDark.svg',
					2: '/assets/SecondPlaceDark.svg',
					3: '/assets/ThirdPlaceDark.svg'
			  }
			: {
					1: '/assets/FirstPlace.svg',
					2: '/assets/SecondPlace.svg',
					3: '/assets/ThirdPlace.svg'
			  };

	const iconSources =
		theme === 'dark'
			? {
					bookmark: '/assets/icons/auctionIcons/BookmarkDark.svg',
					delegate: '/assets/icons/auctionIcons/delegateDarkIcon.svg',
					monetization: '/assets/icons/auctionIcons/monetizationDarkIcon.svg'
			  }
			: {
					bookmark: '/assets/icons/auctionIcons/BookmarkLight.svg',
					delegate: '/assets/icons/auctionIcons/delegateLightIcon.svg',
					monetization: '/assets/icons/auctionIcons/monetizationLightIcon.svg'
			  };

	return (
		<div
			style={{ backgroundImage: `url(${placeImageMap[place]})` }}
			className={`-ml-2 ${type === 'primary' ? 'h-[217px] w-[456px]' : 'h-[197px] w-[400px] md:h-[180px] md:w-[350px]'} relative bg-cover bg-center bg-no-repeat ${className}`}
		>
			<div className={`${dmSans.className} ${dmSans.variable} ${type === 'primary' ? 'ml-9 h-[217px] w-[390px]' : 'ml-2 h-[197px] w-[400px] px-8 md:h-[180px] md:w-[350px]'}`}>
				<p className='m-0 mt-1 flex justify-center p-0 text-base font-semibold text-bodyBlue'>Rank 0{place}</p>
				<ScoreTag
					score={data?.profile_score}
					className='mx-auto h-7 w-[93px] justify-center border-solid border-white px-1 pr-3'
					scale={1.1}
					iconWrapperClassName='ml-1.5 mt-[5.5px]'
				/>
				<div className={'mx-auto mt-6 flex items-center'}>
					<div className='-mt-1 flex items-center gap-x-2'>
						<ImageComponent
							src={data?.image || ''}
							alt='User Picture'
							className='flex h-[36px] w-[36px] items-center justify-center '
							iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
						/>

						<NameLabel
							usernameClassName='max-w-[9vw] 2xl:max-w-[12vw] text-base font-semibold text-bodyBlue dark:text-white'
							// defaultAddress={proposer}
							username={data?.username}
							usernameMaxLength={15}
							truncateUsername={false}
						/>
					</div>
					<div className='ml-auto flex'>
						<div
							onClick={() => {
								getUserProfile(data?.username);
								setOpen(true);
							}}
						>
							<ImageIcon
								src={iconSources.delegate}
								alt='delegation-icon'
								className='icon-container mr-4 cursor-pointer'
							/>
						</div>
						<div
							onClick={() => {
								getUserProfile(data?.username);
								setOpenTipping(true);
							}}
						>
							<ImageIcon
								src={iconSources.monetization}
								alt='monetization-icon'
								className='icon-container mr-4 cursor-pointer'
							/>
						</div>
						{/* <ImageIcon
							src={iconSources.bookmark}
							alt='bookmark-icon'
							className='icon-container cursor-not-allowed opacity-50'
						/> */}
					</div>
				</div>

				<div className={`mx-auto ${type === 'primary' ? '-mt-1' : '-mt-4'}`}>
					<Divider
						style={{ background: '#D2D8E0' }}
						className='dark:bg-separatorDark'
					/>
				</div>
				<div className={`${dmSans.className} ${dmSans.variable}mx-auto ${type === 'primary' ? '-mt-1' : '-mt-4'} flex  items-center`}>
					<p className='m-0 whitespace-nowrap p-0 text-sm text-lightBlue dark:text-[#909090]'>User Since: </p>
					<span className='flex items-center gap-x-1 whitespace-nowrap text-xs text-bodyBlue dark:text-white'>
						<ImageIcon
							src='/assets/icons/Calendar.svg'
							alt='calenderIcon'
							className='icon-container -mt-0.5 scale-75'
						/>
						{dayjs(data?.created_at).format("DD[th] MMM 'YY")}
					</span>
				</div>
			</div>
			{address && (
				<DelegateModal
					defaultTarget={address}
					open={open}
					setOpen={setOpen}
				/>
			)}
			{address && (
				<Tipping
					username={data?.username || ''}
					open={openTipping}
					setOpen={setOpenTipping}
					key={address}
					paUsername={data?.username as any}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
				/>
			)}
		</div>
	);
};

export default RankCard;
