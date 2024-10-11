// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { Button, Divider } from 'antd';
import Markdown from '~src/ui-components/Markdown';
import { IVotesCount } from '~src/types';
import Link from 'next/link';
import { ITinderCardsComponent } from '~src/components/TinderStyleVoting/types';
import CardPostHeading from '~src/components/TinderStyleVoting/PostInfoComponents/CardPostHeading';
import CardComments from '~src/components/TinderStyleVoting/CardComponents/CardComments';
import ReferendumV2CardInfo from '~src/components/TinderStyleVoting/PostInfoComponents/ReferendumV2CardInfo';

const TinderCardsComponent: FC<ITinderCardsComponent> = (props) => {
	const { proposal, onSkip } = props;
	const [ayeNayAbstainCounts, setAyeNayAbstainCounts] = useState<IVotesCount>({ abstain: 0, ayes: 0, nays: 0 });

	const sanitizeSummary = (md: string) => {
		const newMd = (md || '').trim();
		return newMd;
	};

	return (
		<div className='flex overflow-hidden'>
			<div className='h-[500px] rounded-2xl bg-white px-4 py-6 dark:border dark:border-solid dark:border-separatorDark dark:bg-black'>
				<div className='flex items-start justify-between'>
					<CardPostHeading
						method={proposal?.method}
						motion_method={proposal?.motion_method}
						postArguments={proposal?.proposed_call?.args}
						className='mb-5'
						post={proposal}
					/>
					<Button
						className='border-none bg-transparent p-0 text-pink_primary shadow-none'
						onClick={() => onSkip(proposal.id)}
					>
						Skip &gt;
					</Button>
				</div>
				<Divider
					type='horizontal'
					className='border-l-1 border-grey_stroke -mt-4 mb-4 dark:border-separatorDark'
				/>
				<div className='max-h-[316px] overflow-y-auto'>
					<div className='flex w-full justify-start overflow-hidden text-ellipsis'>
						<Markdown
							className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
							md={sanitizeSummary(proposal?.summary || '')}
						/>
					</div>
					<Link
						className='m-0 my-4 flex cursor-pointer justify-start p-0 text-xs text-pink_primary'
						href={`/referenda/${proposal.id}`}
						target='_blank'
					>
						Read Full Proposal
					</Link>
					{proposal?.comments?.length > 0 && <CardComments proposal={proposal} />}
					<Divider
						type='horizontal'
						className='border-l-1 my-2 border-[#D2D8E0] dark:border-separatorDark max-lg:hidden xs:inline-block'
					/>
					<ReferendumV2CardInfo
						className='shadow-none'
						ayeNayAbstainCounts={ayeNayAbstainCounts}
						setAyeNayAbstainCounts={setAyeNayAbstainCounts}
						tally={proposal?.tally}
						post={proposal}
						hideInfo={true}
						isUsedInTinderWebView={true}
					/>
				</div>
			</div>
		</div>
	);
};

export default TinderCardsComponent;
