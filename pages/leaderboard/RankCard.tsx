// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import StarIcon from '~assets/icons/StarIcon.svg';
import InfoIcon from '~assets/info.svg';
import dayjs from 'dayjs';
import ImageComponent from '~src/components/ImageComponent';
import NameLabel from '~src/ui-components/NameLabel';

interface RankCardProps {
	place: number;
	data: any;
	theme: string | undefined;
	strokeWidth: string;
	type: string;
}

const RankCard: React.FC<RankCardProps> = ({ place, data, theme, strokeWidth, type }) => {
	const placeImageMap: Record<number, string> = {
		1: '/assets/FirstPlace.svg',
		2: '/assets/SecondPlace.svg',
		3: '/assets/ThirdPlace.svg'
	};

	function getDaySuffix(day: any) {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	function formatTimestamp(seconds: number) {
		const date = dayjs.unix(seconds);
		const day = date.date();
		const month = date.format('MMM');
		const year = date.format('YY');
		return `${day}${getDaySuffix(day)} ${month}' ${year}`;
	}

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
			className={`-ml-2 ${type === 'primary' ? 'h-[217px] w-[456px]' : 'h-[197px] w-[390px]'} relative bg-cover bg-center bg-no-repeat`}
		>
			<div className={`${type === 'primary' ? 'ml-10 h-[217px] w-[390px]' : 'ml-2 h-[197px] w-[390px]'}`}>
				<p className='m-0 mt-1 flex justify-center p-0 text-base font-semibold text-bodyBlue'>Rank 0{place}</p>
				<div
					className='mx-auto flex h-7 w-[93px] items-center justify-center rounded-lg bg-[#FFD669]'
					style={{ border: '0.9px solid #9EA1A7' }}
				>
					<StarIcon />
					<p className='m-0 p-0 text-sm text-[#534930]'>{data?.profile_score}</p>
					<InfoIcon style={{ transform: 'scale(0.8)' }} />
				</div>
				<div className={`mx-auto mt-6 flex w-[${strokeWidth}] items-center`}>
					<div className='flex items-center gap-x-2'>
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
						<ImageIcon
							src={iconSources.delegate}
							alt='delegation-icon'
							className='icon-container mr-4'
						/>
						<ImageIcon
							src={iconSources.monetization}
							alt='monetization-icon'
							className='icon-container mr-4'
						/>
						<ImageIcon
							src={iconSources.bookmark}
							alt='bookmark-icon'
							className='icon-container'
						/>
					</div>
				</div>
				<div className={`divider-container mx-auto mt-6 w-[${strokeWidth}]`} />
				<div className={`mx-auto ${type === 'primary' ? 'mt-3' : 'mt-1'} flex w-[${strokeWidth}] items-center`}>
					<p className='m-0 whitespace-nowrap p-0 text-sm text-lightBlue dark:text-white'>User Since: </p>
					<span className='flex items-center gap-x-1 whitespace-nowrap text-xs text-bodyBlue'>
						<ImageIcon
							src='/assets/icons/Calendar.svg'
							alt='calenderIcon'
							className='icon-container scale-90'
						/>
						{formatTimestamp(data?.created_at._seconds)}
					</span>
				</div>
			</div>
		</div>
	);
};

export default RankCard;
