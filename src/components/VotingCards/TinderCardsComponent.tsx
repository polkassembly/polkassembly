// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import CardPostHeading from '../Post/CardPostHeading';
import { Divider } from 'antd';
import Markdown from '~src/ui-components/Markdown';
// import ReferendumV2VoteInfo from '../Post/GovernanceSideBar/Referenda/ReferendumV2VoteInfo';
import { IVotesCount } from '~src/types';
import ReferendumV2CardInfo from '../Post/GovernanceSideBar/Referenda/ReferendumV2CardInfo';
import { useRouter } from 'next/router';
import CardComments from './CardComments';

interface ITinderCardsComponent {
	proposal: any;
}

const TinderCardsComponent: FC<ITinderCardsComponent> = (props) => {
	const { proposal } = props;
	const router = useRouter();
	const [ayeNayAbstainCounts, setAyeNayAbstainCounts] = useState<IVotesCount>({ abstain: 0, ayes: 0, nays: 0 });

	const sanitizeSummary = (md: string) => {
		const newMd = (md || '').trim();
		return newMd;
	};

	return (
		<section className='flex flex-col gap-y-4 overflow-x-hidden'>
			<div className='overflow-y-auto rounded-2xl bg-white p-4 px-4 py-6 shadow-md dark:border dark:border-solid dark:border-[#D2D8E0] dark:bg-transparent'>
				<CardPostHeading
					method={proposal?.method}
					motion_method={proposal?.motion_method}
					postArguments={proposal?.proposed_call?.args}
					className='mb-5'
					post={proposal}
				/>
				<Divider
					type='horizontal'
					className='border-l-1 border-[#D2D8E0] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
				/>
				<div className='flex w-full justify-start overflow-hidden text-ellipsis'>
					<Markdown
						className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
						md={sanitizeSummary(proposal?.summary || '')}
					/>
				</div>
				<p
					className='m-0 my-4 flex cursor-pointer justify-start p-0 text-xs text-pink_primary'
					onClick={() => {
						router.push(`/refernda/${proposal?.id}`);
					}}
				>
					Read Full Proposal
				</p>
				{proposal?.comments?.length > 0 && <CardComments proposal={proposal} />}
			</div>
			<div className='h-full rounded-2xl bg-white p-4 shadow-md dark:border dark:border-solid dark:border-[#D2D8E0] dark:bg-transparent'>
				<ReferendumV2CardInfo
					ayeNayAbstainCounts={ayeNayAbstainCounts}
					setAyeNayAbstainCounts={setAyeNayAbstainCounts}
					tally={proposal?.tally}
					post={proposal}
				/>
			</div>
		</section>
	);
};

export default TinderCardsComponent;
