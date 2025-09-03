// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Markdown from '~src/ui-components/Markdown';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { ClockCircleOutlined } from '@ant-design/icons';
import { IUserActivityTypes } from './ProfileUserActivity';
import Link from 'next/link';
import { IProfileMentions } from './ProfileMentions';
import { IProfileReactions } from './ProfileReactions';
import Image from 'next/image';
import { EUserActivityIn } from '~src/types';
import styled from 'styled-components';
import classNames from 'classnames';

const ActivityBottomContent = ({ activity, className }: { activity: IUserActivityTypes | IProfileMentions | IProfileReactions; className?: string }) => {
	return (
		<div className={classNames('flex flex-col gap-3 pr-6', className)}>
			<div className='flex justify-between max-md:flex-col'>
				<Link
					href={`/${getSinglePostLinkFromProposalType(activity?.postType)}/${activity?.postId}`}
					target='_blank'
					className=' text-sm font-medium'
				>
					<span>
						#{activity?.postId} {activity?.postTitle.length > 95 ? `${activity?.postTitle?.slice(0, 95)}...` : activity?.postTitle}
					</span>
					<Image
						src='/assets/icons/redirect.svg'
						alt=''
						height={16}
						width={16}
						className='ml-1'
					/>
				</Link>
				<span className='flex flex-shrink-0 items-center gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
					<ClockCircleOutlined />
					{getRelativeCreatedAt(activity?.createdAt)}
				</span>
			</div>
			{activity?.content?.length > 0 && (
				<div className='-mt-1 w-full items-center rounded-sm border-0 border-l-[1.5px] border-solid border-pink_primary bg-[#FAFAFC] px-4 pb-2.5 pt-2 text-bodyBlue dark:bg-[#191919] dark:text-blue-dark-high'>
					<Markdown
						md={activity?.content.trim()}
						className='line-clamp h-[67px] text-lightBlue dark:text-blue-dark-medium'
					/>
				</div>
			)}
			{[EUserActivityIn.COMMENT, EUserActivityIn.REPLY].includes(activity?.activityIn) && (
				<CustomButton
					width={120}
					height={28}
					type='default'
					className='text-xs font-semibold'
					onClick={() => window.open(`/${getSinglePostLinkFromProposalType(activity?.postType)}/${activity?.postId}#${activity?.commentId}`, '_blank')}
					text={EUserActivityIn.COMMENT === activity.activityIn ? 'View Comment' : 'View Reply'}
					size='small'
				/>
			)}
		</div>
	);
};

export default styled(ActivityBottomContent)`
	.line-clamp {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
`;
