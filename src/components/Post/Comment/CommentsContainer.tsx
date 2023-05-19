// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Anchor } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';

import PostCommentForm from '../PostCommentForm';
import Comments from './Comments';
import RefendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';
import Image from 'next/image';

const { Link: AnchorLink } = Anchor;

export function getStatus(type: string) {
	if (['DemocracyProposal'].includes(type)) {
		return 'Democracy Proposal';
	} else if ('TechCommitteeProposal' === type) {
		return 'Tech Committee Proposal';
	} else if ('TreasuryProposal' === type) {
		return 'Treasury Proposal';
	} else if(['Referendum', 'FellowshipReferendum', 'ReferendumV2'].includes(type)) {
		return 'Referendum';
	} else if (type === 'CouncilMotion') {
		return 'Motion';
	} else if (type === 'ChildBounty') {
		return 'Child Bounty';
	} else if (['Discussions', 'Grants'].includes(type)) {
		return type.substring(0, type.length - 1);
	}
	return type;
}

interface ICommentsContainerProps {
	className?: string;
	id: number | null | undefined;
}

interface ITimeline {
	date: Dayjs;
	status: string;
	id: number;
	commentsCount: number;
	firstCommentId: string;
}

const CommentsContainer: FC<ICommentsContainerProps> = (props) => {
	const { className, id } = props;
	const { postData: { postType, timeline, created_at, comments } } = usePostDataContext();
	const targetOffset = 10;
	const [timelines, setTimelines] = useState<ITimeline[]>([]);
	const isGrantClosed: boolean = Boolean(postType === ProposalType.GRANTS && created_at && dayjs(created_at).isBefore(dayjs().subtract(6, 'days')));
	const[openLoginModal,setOpenLoginModal]=useState<boolean>(false);
	const getCommentCountAndFirstIdBetweenDates = (startDate: Dayjs, endDate: Dayjs, comments: any[]) => {
		if (startDate.isAfter(endDate)) {
			return {
				count: 0,
				firstCommentId: ''
			};
		}
		const filteredComments = comments.filter((comment: any) => {
			const commentDate = dayjs(comment.created_at);
			return commentDate.isBetween(startDate, endDate, 'minutes' , '[)');
		});

		return {
			count: filteredComments.length,
			firstCommentId: filteredComments.length > 0 ? filteredComments[0].id : ''
		};
	};

	const handleTimelineClick = (e: React.MouseEvent<HTMLElement>, link: {title: React.ReactNode; href: string;}) => {
		if(link.href === '#') {
			e.preventDefault();
			return;
		}
	};
	useEffect(() => {
		let timelines: ITimeline[] = [];
		if (timeline && timeline.length > 0 && comments.length > 0) {
			timeline.forEach((obj) => {
				timelines.push({
					commentsCount: 0,
					date: dayjs(obj?.created_at),
					firstCommentId: '',
					id: timelines.length + 1,
					status: getStatus(obj?.type)
				});
			});

			if(timelines.length > 1) {
				const newComments = comments.sort((a, b) => dayjs(a.created_at).diff(b.created_at));
				timelines = timelines.map((timelineObj, i) => {
					const { count, firstCommentId } = getCommentCountAndFirstIdBetweenDates(i === 0 ? dayjs(newComments[0].created_at) : timelineObj.date, timelines[i + 1]?.date || dayjs(), newComments);
					return{
						...timelineObj,
						commentsCount: count,
						firstCommentId
					};
				});
				setTimelines(timelines);
			}
		}
	}, [timeline, comments]);
	return (
		<div className={className}>
			{ id ? <>
				{ isGrantClosed ?
					<Alert message="Grant closed, no comments can be added or edited." type="info" showIcon /> :
					<PostCommentForm className='mb-8' />
				}
			</>
				:<div className="mt-4 mb-8 bg-[#E6F4FF] rounded-[6px] shadow-md h-12 flex justify-center items-center gap-3">
					<Image src="/assets/icons/alert-login.svg" width={20} height={20} alt={''} />
					<div className="text-sm font-medium text-[#243A57]">
									Please <span className="cursor-pointer text-pink_primary" onClick={() => {setOpenLoginModal(true);}}>Log In</span> to comment
					</div>
				</div>
			}
			<div className='text-sidebarBlue text-sm font-medium mb-5'>{comments?.length} comments</div>
			<div  className={'block xl:grid grid-cols-12'}>
				{
					!!comments?.length && timelines.length > 1 &&
					<div className='hidden h-screen xl:block col-start-1 col-end-2 min-w-[100px] sticky top-[10%] '>
						<Anchor targetOffset={targetOffset} className='h-full min-w-[140px]' onClick={handleTimelineClick}>
							{timelines.map(({ commentsCount, date, firstCommentId, id, status }) => {
								return (
									commentsCount > 0 ?
										<AnchorLink
											key={id}
											href={`#${firstCommentId}`}
											title={
												<div className='flex flex-col text-[#485F7D]'>
													<div className='text-xs mb-1'>{date.format('MMM Do')}</div>
													<div className='mb-1 font-medium break-words whitespace-pre-wrap'>{status}</div>
													<div className='text-xs'>({commentsCount})</div>
												</div>
											}
										/>
										:
										<div key={id} className='flex flex-col ml-5 cursor-default text-[#485F7D]'>
											<div className='text-xs mb-1'>{date.format('MMM Do')}</div>
											<div className='mb-1 font-medium break-words whitespace-pre-wrap'>{status}</div>
											<div className='text-xs'>({commentsCount})</div>
										</div>
								);
							})}
						</Anchor>
					</div>
				}

				<div className={`col-start-1 ${timelines.length > 1 && 'xl:col-start-3'} col-end-13 mt-0`}>
					{ !!comments?.length &&
						<>
							<Comments disableEdit={isGrantClosed} comments={comments} />
						</>
					}
					{
						<RefendaLoginPrompts
							modalOpen={openLoginModal}
							setModalOpen={setOpenLoginModal}
							image="/assets/post-comment.png"
							title="Join Polkassembly to Comment on this proposal."
							subtitle="Discuss, contribute and get regular updates from Polkassembly."
						/>
					}
				</div>
			</div>
		</div>
	);
};

export default React.memo(styled(CommentsContainer)`
.ant-anchor-wrapper {
	.ant-anchor {
		display: flex;
		flex-direction: column;
		gap: 96px;
	}

	.ant-anchor-ink {
		margin-left: 5px;
	}
	
	.ant-anchor-link {
		margin-left: 5px;
	}

	.ant-anchor-ink-ball-visible {
		display: block !important;
		background: url('/assets/pa-small-circle.png') !important;
		background-repeat: no-repeat !important;
		background-position: center !important;
		height: 18px !important;
		width: 18px !important;
		border: none !important;
		border-radius: 50% !important;
		margin-left: -7px;
	}
	.my-alert .ant-alert-message span {
  		color: red !important;
	}
}
`);