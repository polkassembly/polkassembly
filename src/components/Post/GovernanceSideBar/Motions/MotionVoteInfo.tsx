// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import React, { FC, useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import HelperTooltip from 'src/ui-components/HelperTooltip';

import Address from '../../../../ui-components/Address';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { useTranslation } from 'next-i18next';

interface IMotionVoteInfoProps {
	className?: string;
	councilVotes: {
		decision: string;
		voter: string;
	}[];
}

const MotionVoteInfo: FC<IMotionVoteInfoProps> = (props) => {
	const { councilVotes, className } = props;
	const {
		postData: { postType }
	} = usePostDataContext();
	const { t } = useTranslation('common');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const { resolvedTheme: theme } = useTheme();

	const itemsPerPage = 10;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const onChange = (page: number) => {
		setCurrentPage(page);
	};
	return (
		<GovSidebarCard className={`${className} px-1 md:px-9 xl:overflow-y-visible`}>
			<h3 className='dashboard-heading flex items-center dark:text-white'>
				{postType === ProposalType.ADVISORY_COMMITTEE && 'Advisory'} {t('council_votes')}
				<HelperTooltip
					className='ml-2 w-3.5 font-normal'
					text='This represents the onchain votes of council members'
				/>
			</h3>
			<div className='mt-6'>
				{councilVotes.slice(startIndex, endIndex).map((councilVote, index) => (
					<div
						className='mb-6 flex items-center justify-between'
						key={`${councilVote.voter}_${index}`}
					>
						<div className='item'>
							<Address
								isSubVisible={false}
								address={councilVote.voter}
							/>
						</div>

						{councilVote.decision === 'yes' ? (
							<div className='text-md flex items-center text-aye_green'>
								<LikeFilled className='mr-2' /> {t('ayes')}
							</div>
						) : (
							<div className='text-md flex items-center text-nay_red'>
								<DislikeFilled className='mr-2' /> {t('nays')}
							</div>
						)}
					</div>
				))}
			</div>
			<div className='-mr-2 mt-6 flex justify-end'>
				<Pagination
					theme={theme}
					size='small'
					defaultCurrent={1}
					current={currentPage}
					onChange={onChange}
					total={councilVotes.length || 0}
					showSizeChanger={false}
					pageSize={itemsPerPage}
					responsive={true}
					hideOnSinglePage={true}
				/>
			</div>
		</GovSidebarCard>
	);
};

export default MotionVoteInfo;
