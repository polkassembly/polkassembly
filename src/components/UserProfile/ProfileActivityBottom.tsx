// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Markdown from '~src/ui-components/Markdown';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { ClockCircleOutlined } from '@ant-design/icons';
import { EUserActivityIn, IUserActivityTypes } from './ProfileUserActivity';
import Link from 'next/link';
import { IProfileMentions } from './ProfileMentions';
import { IProfileReactions } from './ProfileReactions';

const ActivityBottomContent = ({ activity }: { activity: IUserActivityTypes | IProfileMentions | IProfileReactions }) => {
	return (
		<div className='flex  flex-col gap-3'>
			<Link
				href={`/${getSinglePostLinkFromProposalType(activity?.postType)}/${activity?.postId}`}
				target='_blank'
				className='text-sm font-medium'
			>
				{activity?.postTitle}
			</Link>
			<div className='bg-mainBg -mt-1 items-center rounded-md border-0 border-l-[1.5px] border-solid border-pink_primary px-4 pb-0.5 pt-2 text-bodyBlue dark:bg-[#191919] dark:text-blue-dark-high'>
				<Markdown
					md={activity?.content?.length > 200 ? `${activity?.content?.slice(1, 200)}...` : activity?.content}
					imgHidden
				/>
			</div>
			{[EUserActivityIn.COMMENT, EUserActivityIn.REPLY].includes(activity?.activityIn) && (
				<CustomButton
					width={150}
					height={30}
					variant='default'
					onClick={() => window.open(`/${getSinglePostLinkFromProposalType(activity?.postType)}/${activity?.postId}#${activity?.commentId}`, '_blank')}
					text={EUserActivityIn.COMMENT === activity.activityIn ? 'View Comment' : 'View Reply'}
					size='small'
				/>
			)}
			<span className='flex items-center gap-1 text-xs'>
				<ClockCircleOutlined />
				{getRelativeCreatedAt(activity?.createdAt)}
			</span>
		</div>
	);
};

export default ActivityBottomContent;
