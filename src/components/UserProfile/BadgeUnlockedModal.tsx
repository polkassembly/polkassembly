// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Divider, Modal } from 'antd';
import { poppins } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Link from 'next/link';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { Badge } from '~src/auth/types';
import { badgeDetails } from '~src/global/achievementbadges';
import ImageIcon from '~src/ui-components/ImageIcon';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	badge: any;
	badges?: Badge[];
}

const BadgeUnlockedModal = ({ className, open, setOpen, badge, badges }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { username } = currentUser;

	if (!badge) return <></>;

	const matchingBadge = badgeDetails.find((detail) => detail.name === badge.name);

	const isUnlocked = badges?.some((unlockedBadge) => unlockedBadge.name === badge.name);

	const badgeImage = matchingBadge?.img || '/assets/badges/active_voter_locked.svg';

	return (
		<Modal
			open={open}
			className={`${poppins.variable} ${poppins.className} delegate mt-[5vh] w-[604px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				setOpen(false);
			}}
			footer={
				<>
					<button
						onClick={() => setOpen(false)}
						className='w-full rounded-lg border-none bg-[#F7F8F9] p-5 py-3 text-left  text-[#485F7D]'
					>
						<span className='flex items-center gap-1'>
							<ImageIcon
								src='/assets/badges/hourglass_move_dark.svg'
								alt='hourglass'
								className='text-[#485F7D]'
							/>
							<span>{`Unlocked on ${badge.unlockedAt.split('T')[0]}`}</span>
						</span>
					</button>
				</>
			}
			closable
		>
			<div className='-mt-[100px] flex flex-col items-center justify-center'>
				<Image
					src={badgeImage}
					alt={badge.name}
					className={isUnlocked ? '' : 'grayscale'}
					width={218}
					height={136}
				/>
				<h1 className='mt-2 text-[20px] font-semibold tracking-[0.0015em] dark:text-white'>Achievement Unlocked</h1>
				<h2 className='mt-2 text-[20px] tracking-[0.0015em] dark:text-white'>
					You Earned <span className='font-semibold text-pink_primary'>{badge.name}</span> Badge
				</h2>
				<p className='mt-2 text-center text-[16px] font-light dark:text-white'>{matchingBadge?.description}</p>
			</div>
		</Modal>
	);
};
export default BadgeUnlockedModal;
