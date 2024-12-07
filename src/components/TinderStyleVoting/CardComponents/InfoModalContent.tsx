// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import CardPostHeading from '../PostInfoComponents/CardPostHeading';
import { Divider } from 'antd';
import Markdown from '~src/ui-components/Markdown';
import Link from 'next/link';
import ReferendumV2CardInfo from '../PostInfoComponents/ReferendumV2CardInfo';
import CardComments from './CardComments';
import { IVotesCount } from '~src/types';

interface IInfoModalContent {
	post?: any;
}

const InfoModalContent: FC<IInfoModalContent> = (props) => {
	const { post } = props;
	const [ayeNayAbstainCounts, setAyeNayAbstainCounts] = useState<IVotesCount>({ abstain: 0, ayes: 0, nays: 0 });

	const sanitizeSummary = (md: string) => {
		return (md || '')?.trim();
	};
	return (
		<section className='mt-6 flex h-[500px] flex-col  gap-y-4 overflow-y-auto overflow-x-hidden bg-white dark:bg-transparent'>
			<div className='overflow-y-auto rounded-2xl px-4 shadow-md'>
				<div className='flex items-start justify-between'>
					<CardPostHeading
						method={post?.method}
						motion_method={post?.motion_method}
						postArguments={post?.proposed_call?.args}
						className='mb-5'
						post={post}
					/>
				</div>
				<Divider
					type='horizontal'
					className='border-l-1 border-[#D2D8E0] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
				/>
				<div className='flex w-full justify-start overflow-hidden text-ellipsis'>
					<Markdown
						className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
						md={sanitizeSummary(post?.summary || '')}
					/>
				</div>
				<Link
					className='m-0 my-4 flex cursor-pointer justify-start p-0 text-xs text-pink_primary'
					href={`/referenda/${post?.id}`}
					target='_blank'
				>
					Read Full post
				</Link>
				{post?.comments?.length > 0 && <CardComments proposal={post} />}
				<div className='h-[300px] overflow-y-auto rounded-2xl bg-white p-4 shadow-md dark:border dark:border-solid dark:border-separatorDark dark:bg-transparent'>
					<ReferendumV2CardInfo
						ayeNayAbstainCounts={ayeNayAbstainCounts}
						setAyeNayAbstainCounts={setAyeNayAbstainCounts}
						tally={post?.tally}
						post={post}
						hideInfo={true}
					/>
				</div>
			</div>
		</section>
	);
};

export default InfoModalContent;
