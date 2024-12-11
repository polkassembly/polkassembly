// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import { CloseIcon } from './CustomIcons';
import { useEffect, useState } from 'react';
import { getStatusesFromCustomStatus, ProposalType } from '~src/global/proposalType';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import ConfusedModalShareProposalDetails from './ConfusedModalShareProposalDetails';
import { useGlobalSelector } from '~src/redux/selectors';
import { useTranslation } from 'next-i18next';

interface Props {
	status: string;
	postIndex: number;
	postType: ProposalType;
	title: string;
	setOpenNudge: (pre: boolean) => void;
}

const ConfusedNudge = ({ postIndex, postType, status, title, setOpenNudge }: Props) => {
	const { is_sidebar_collapsed } = useGlobalSelector();
	const { t } = useTranslation('common');

	const [isNudgeVisible, setNudgeVisible] = useState(false);
	const [isModalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		if (!getStatusesFromCustomStatus(CustomStatus.Active).includes(status)) return;
		const nudgeTimeout = setTimeout(() => {
			setOpenNudge(true);
			setNudgeVisible(true);
		}, 180000);

		return () => {
			if (nudgeTimeout) {
				clearTimeout(nudgeTimeout);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	return isNudgeVisible ? (
		<>
			<div
				className={`absolute left-0 top-0 flex w-full justify-between bg-gradient-to-r from-[#D80676] to-[#FF778F] pr-10 font-medium transition-opacity duration-100 ${
					is_sidebar_collapsed ? 'pl-28' : 'pl-[265px]'
				} font-dmSans text-[12px] font-medium text-white`}
			>
				<div className='flex gap-2'>
					<p className='pt-3 '>{t('confused_about_making_a_decision')}</p>
					<div
						onClick={() => setModalOpen(true)}
						className='mt-2 flex h-6 cursor-pointer gap-2 rounded-md bg-[#0000004D] bg-opacity-[30%] px-2 pt-1'
					>
						<Image
							src='/assets/icons/transformedshare.svg'
							alt='share icon'
							className='h-4 w-4'
							width={16}
							height={16}
						/>
						<p>{t('share_proposal')}</p>
					</div>
					<p className='pt-3'>{t('with_a_friend_to_get_their_opinion')}</p>
				</div>
				<div
					onClick={() => {
						setNudgeVisible(false);
						setOpenNudge(false);
					}}
				>
					<CloseIcon className='cursor-pointer pt-[10px] text-2xl' />
				</div>
			</div>
			{
				<ConfusedModalShareProposalDetails
					modalOpen={isModalOpen}
					setModalOpen={setModalOpen}
					className='w-[600px]'
					postId={postIndex}
					proposalType={postType}
					title={title}
				/>
			}
		</>
	) : null;
};

export default ConfusedNudge;
