// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { useTranslation } from 'next-i18next';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import VoteProgress from 'src/ui-components/VoteProgress';
import { VotingHistoryIcon } from '~src/ui-components/CustomIcons';

interface IFellowshipReferendumVoteInfoProps {
	className?: string;
	tally?: any;
	setOpen: (value: React.SetStateAction<boolean>) => void;
}

const FellowshipReferendumVoteInfo: FC<IFellowshipReferendumVoteInfoProps> = (props) => {
	const { className, tally, setOpen } = props;
	const { t } = useTranslation('common');

	return (
		<GovSidebarCard className={className}>
			<h6 className='dashboard-heading mb-6 dark:text-white'>{t('voting_status')}</h6>

			{tally && (
				<>
					<VoteProgress
						ayesNum={Number(tally?.ayes)}
						className='vote-progress'
						naysNum={Number(tally?.nays)}
					/>
					<section className='-mt-4 grid grid-cols-2 gap-x-7 gap-y-3 text-[#485F7D] dark:text-blue-dark-medium'>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex items-center gap-x-1'>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>{t('ayes')}</span>
							</div>
							<div className='text-xs font-medium leading-[22px] text-navBlue'>{tally.ayes}</div>
						</article>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex items-center gap-x-1'>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>{t('bare_ayes')}</span>
							</div>
							<div className='text-xs font-medium leading-[22px] text-navBlue'>{tally.bareAyes}</div>
						</article>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex items-center gap-x-1'>
								<span className='text-xs font-medium leading-[18px] tracking-[0.01em]'>{t('nays')}</span>
							</div>
							<div className='text-xs font-medium leading-[22px] text-navBlue'>{tally.nays}</div>
						</article>
					</section>
					<section className='mt-[18px] flex items-center gap-x-4 border-0 border-t-[0.75px] border-solid border-section-light-container pb-[14px] pt-[18px] dark:border-[#3B444F]'>
						<button
							className='m-0 flex cursor-pointer items-center gap-x-1 border-none bg-transparent p-0 text-xs font-medium leading-[22px] text-pink_primary outline-none'
							onClick={() => {
								setOpen(true);
							}}
						>
							<VotingHistoryIcon />
							<span>{t('voting_history')}</span>
						</button>
					</section>
				</>
			)}
		</GovSidebarCard>
	);
};

export default React.memo(FellowshipReferendumVoteInfo);
