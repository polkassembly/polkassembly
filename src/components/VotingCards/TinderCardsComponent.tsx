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
interface ITinderCardsComponent {
	proposal: any;
}

const TinderCardsComponent: FC<ITinderCardsComponent> = (props) => {
	const { proposal } = props;
	console.log('from tinder cards --> ', proposal);
	const [ayeNayAbstainCounts, setAyeNayAbstainCounts] = useState<IVotesCount>({ abstain: 0, ayes: 0, nays: 0 });

	const sanitizeSummary = (md: string) => {
		const newMd = (md || '').trim();
		return newMd;
	};

	return (
		<section>
			<div>
				<CardPostHeading
					method={proposal?.method}
					motion_method={proposal?.motion_method}
					postArguments={proposal?.proposed_call?.args}
					className='mb-5'
					post={proposal}
				/>
				<Divider
					type='horizontal'
					className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
				/>
				<div className='flex w-full justify-start'>
					<Markdown
						className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
						md={sanitizeSummary(proposal?.summary || '')}
					/>
				</div>
				<Divider
					type='horizontal'
					className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
				/>
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
