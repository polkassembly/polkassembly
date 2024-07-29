// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import React, { useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import styled from 'styled-components';
import { EProfileBadges } from '~src/types';
import { Tooltip } from 'antd';
import ImageIcon from '~src/ui-components/ImageIcon';
import BadgeUnlockedModal from './BadgeUnlockedModal';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
}

const badgeData = () => {
	return [
		{
			active: true,
			badge: EProfileBadges.DECENTRALISED_VOICE,
			icon: '/assets/badges/DV.svg',
			unlockTime: 'May 17, 2024'
		},
		{
			active: false,
			badge: EProfileBadges.ACTIVE_VOTER,
			icon: '/assets/badges/active-voter.svg',
			unlockTime: ''
		},
		{
			active: true,
			badge: EProfileBadges.COUNCIL,
			icon: '/assets/badges/council.svg',
			unlockTime: 'June 17, 2024'
		},
		{
			active: true,
			badge: EProfileBadges.FELLOW,
			icon: '/assets/badges/fellow.svg',
			unlockTime: 'July 17, 2024'
		},
		{
			active: true,
			badge: EProfileBadges.WHALE,
			icon: '/assets/badges/whale-badge.svg',
			unlockTime: 'September 17, 2023'
		}
	];
};

const ProfileBadges = ({ className, theme }: Props) => {
	const [showMore, setShowMore] = useState<boolean>(false);

	return (
		<div
			className={classNames(
				theme,
				className,
				'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<div className='flex items-start justify-between'>
				<div className='flex flex-col'>
					<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
						<Image
							src='/assets/icons/medal.svg'
							alt=''
							width={24}
							height={24}
						/>
						Badges
					</span>
					<p className='m-0 mt-2 font-light'>Unlock, receive and earn badges as you engage in polkassembly</p>
				</div>
				<p
					className='m-0 mt-2 w-[90px] cursor-pointer text-xs font-medium text-pink_primary'
					onClick={() => setShowMore(!showMore)}
				>
					{showMore ? 'Show Less' : 'Show More'}
				</p>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				{badgeData()
					.slice(0, showMore ? 5 : 4)
					.map((item) => (
						<div
							key={item.badge}
							className='col-span-1 flex flex-col items-center rounded-lg bg-[#F6F7F9] py-8 dark:bg-[#161616]'
						>
							<Tooltip
								color='#363636'
								title={
									item.active ? (
										<span className='flex items-center gap-1 break-all text-xs'>
											<ImageIcon
												src='/assets/icons/hourglass_light.svg'
												alt='hourglass'
											/>{' '}
											Unlocked on {item.unlockTime}
										</span>
									) : (
										'Not yet unlocked'
									)
								}
							>
								<Image
									src={item.icon}
									alt=''
									className={!item.active ? 'grayscale' : ''}
									width={132}
									height={82}
								/>
							</Tooltip>
							<span className='mt-2 text-base font-semibold dark:text-blue-dark-high'>{item.badge}</span>
						</div>
					))}
			</div>
			<BadgeUnlockedModal
				open={false}
				setOpen={() => null}
				badge={EProfileBadges.WHALE}
				icon='/assets/badges/whale-badge.svg'
			/>
		</div>
	);
};
export default styled(ProfileBadges)`
	.dark .darkmode-icons {
		filter: brightness(100%) saturate(0%) contrast(4) invert(100%) !important;
	}
`;
