// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import React, { useState } from 'react';
import { Badge, BadgeName, ProfileDetailsResponse } from '~src/auth/types';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import ImageIcon from '~src/ui-components/ImageIcon';
import BadgeUnlockedModal from './BadgeUnlockedModal';
import getNetwork from '~src/util/getNetwork';
import { badgeDetails } from './utils/GetAchievementBadgesText';
import { network as AllNetworks } from '~src/global/networkConstants';

interface Props {
	className?: string;
	theme?: string;
	badges?: Badge[];
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
}

const defaultLockedBadges = [
	{ img: '/assets/badges/active_voter_locked.svg', name: BadgeName.ACTIVE_VOTER },
	{ img: '/assets/badges/council_locked.svg', name: BadgeName.COUNCIL },
	{ img: '/assets/badges/decentralised_voice_locked.svg', name: BadgeName.DECENTRALISED_VOICE },
	{ img: '/assets/badges/fellow_locked.svg', name: BadgeName.FELLOW },
	{ img: '/assets/badges/whalelocked.svg', name: BadgeName.WHALE }
];

const ProfileBadges = ({ className, theme, badges }: Props) => {
	const [showMore, setShowMore] = useState<boolean>(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
	const network = getNetwork();

	const getRequirementText = (requirement: string | ((network: string) => string), network: string) => {
		return typeof requirement === 'function' ? requirement(network) : requirement;
	};
	const filteredBadgeDetails = badgeDetails.filter((badge) => {
		if ((badge.name === BadgeName.DECENTRALISED_VOICE && network === AllNetworks.POLKADOT) || (badge.name === BadgeName.DECENTRALISED_VOICE && network === AllNetworks.KUSAMA)) {
			return true;
		}
		return badge.name !== BadgeName.DECENTRALISED_VOICE;
	});

	const badgesToShow = filteredBadgeDetails.map((badgeDetail) => {
		const unlockedBadge = badges?.find((unlocked) => unlocked.name === badgeDetail.name && unlocked.check);

		if (unlockedBadge) {
			return {
				...badgeDetail,
				isUnlocked: true,
				requirements: {
					locked: getRequirementText(badgeDetail.requirements.locked, network),
					unlocked: getRequirementText(badgeDetail.requirements.unlocked, network)
				},
				unlockedAt: unlockedBadge.unlockedAt
			};
		} else {
			const lockedBadge = defaultLockedBadges.find((locked) => locked.name === badgeDetail.name);
			return {
				...badgeDetail,
				img: lockedBadge ? lockedBadge.img : badgeDetail.img,
				isUnlocked: false,
				requirements: {
					locked: getRequirementText(badgeDetail.requirements.locked, network),
					unlocked: getRequirementText(badgeDetail.requirements.unlocked, network)
				}
			};
		}
	});

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
					className='m-0 mt-2 w-[90px] cursor-pointer whitespace-nowrap text-xs font-medium text-pink_primary'
					onClick={() => setShowMore(!showMore)}
				>
					{showMore ? 'Show Less' : 'Show More'}
				</p>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				{badgesToShow.slice(0, showMore ? 6 : 4).map((item) => (
					<Tooltip
						key={item.name}
						color='#363636'
						title={
							item.isUnlocked && 'unlockedAt' in item ? (
								<span className='flex items-center gap-1 break-all text-xs'>
									<ImageIcon
										src='/assets/icons/hourglass_light.svg'
										alt='hourglass'
									/>
									{`Unlocked on ${item.unlockedAt.split('T')[0]}`}
								</span>
							) : (
								<span className='flex items-center gap-1 break-all font-poppins text-xs'>
									<ImageIcon
										src='/assets/icons/lock.svg'
										alt='locked'
										className='text-white'
									/>
									Locked
								</span>
							)
						}
					>
						<div
							onClick={() => {
								if (item.isUnlocked) {
									setOpenModal(true);
									setSelectedBadge({
										check: true,
										name: item.name,
										unlockedAt: 'unlockedAt' in item ? item.unlockedAt : ''
									});
								} else {
									setOpenModal(true);
									setSelectedBadge({
										check: false,
										name: item.name,
										unlockedAt: ''
									});
								}
							}}
							className='col-span-1 flex cursor-pointer flex-col items-center rounded-lg bg-[#F6F7F9] py-8 dark:bg-[#161616]'
						>
							<Image
								src={item?.isUnlocked ? item?.img : item?.lockImg || '/assets/badges/active_voter_locked.svg'}
								alt={item.name}
								className={item.isUnlocked ? '' : 'grayscale'}
								width={132}
								height={82}
							/>
							<span className='mt-2 text-base font-semibold dark:text-blue-dark-high'>{item.name}</span>
						</div>
					</Tooltip>
				))}
			</div>

			<BadgeUnlockedModal
				open={openModal}
				setOpen={setOpenModal}
				badge={selectedBadge}
				badges={badges}
			/>
		</div>
	);
};

export default styled(ProfileBadges)`
	.dark .darkmode-icons {
		filter: brightness(100%) saturate(0%) contrast(4) invert(100%) !important;
	}
`;
