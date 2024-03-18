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
import Image from 'next/image';

const ActivityBottomContent = ({ activity }: { activity: IUserActivityTypes | IProfileMentions | IProfileReactions }) => {
	return (
		<div className='flex flex-col gap-3 pr-6'>
			<div className='flex justify-between max-md:flex-col'>
				<Link
					href={`/${getSinglePostLinkFromProposalType(activity?.postType)}/${activity?.postId}`}
					target='_blank'
					className='flex items-center gap-1 text-sm font-medium'
				>
					#{activity?.postId} {activity?.postTitle.length > 95 ? `${activity?.postTitle?.slice(0, 95)}...` : activity?.postTitle}
					<Image
						src='/assets/icons/redirect.svg'
						alt=''
						height={16}
						width={16}
					/>
				</Link>
				<span className='flex flex-shrink-0 items-center gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
					<ClockCircleOutlined />
					{getRelativeCreatedAt(activity?.createdAt)}
				</span>
			</div>
			<div className='-mt-1 w-full items-center rounded-sm border-0 border-l-[1.5px] border-solid border-pink_primary bg-[#FAFAFC] px-4 pb-0.5 pt-2 text-bodyBlue dark:bg-[#191919] dark:text-blue-dark-high'>
				<Markdown
					md={activity?.content?.length > 200 ? `${activity?.content?.slice(1, 200)}...` : activity?.content}
					className='text-lightBlue dark:text-blue-dark-medium'
					imgHidden
				/>
			</div>
			{[EUserActivityIn.COMMENT, EUserActivityIn.REPLY].includes(activity?.activityIn) && (
				<CustomButton
					width={120}
					height={28}
					variant='default'
					className='text-xs font-semibold'
					onClick={() => window.open(`/${getSinglePostLinkFromProposalType(activity?.postType)}/${activity?.postId}#${activity?.commentId}`, '_blank')}
					text={EUserActivityIn.COMMENT === activity.activityIn ? 'View Comment' : 'View Reply'}
					size='small'
				/>
			)}
		</div>
	);
};

export default ActivityBottomContent;
