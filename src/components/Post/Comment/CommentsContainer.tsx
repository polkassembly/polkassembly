// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Anchor, Empty, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';

import PostCommentForm from '../PostCommentForm';
import Comments from './Comments';
import RefendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';
import Image from 'next/image';
import UnfilterAgainstIcon from '~assets/overall-sentiment/against.svg';
import UnfilterSlightlyAgainstIcon from '~assets/overall-sentiment/slightly-against.svg';
import UnfilterNeutralIcon from '~assets/overall-sentiment/neutral.svg';
import UnfilterSlightlyForIcon from '~assets/overall-sentiment/slightly-for.svg';
import UnfilterForIcon from '~assets/overall-sentiment/for.svg';
import { AgainstIcon, ForIcon, NeutralIcon, SlightlyAgainstIcon, SlightlyForIcon } from '~src/ui-components/CustomIcons';

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
	const[openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [againstCount, setAgainstCount] = useState<number>(0);
	const [slightlyAgainstCount, setSlightlyAgainstCount] = useState<number>(0);
	const [neutralCount, setNeutralCount] = useState<number>(0);
	const [slightlyForCount, setSlightlyForCount] = useState<number>(0);
	const [forCount, setForCount] = useState<number>(0);
	const [filteredSentiment, setFilteredSentiment] = useState<number>(0);
	const [filteredComments, setFilteredComments] = useState(comments);

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

	const getOverallSentiment = () => {
		let againstCount = 0;
		let slightlyAgainstCount = 0;
		let neutralCount = 0;
		let slightlyForCount = 0;
		let forCount = 0;

		for(let item = 0; item < comments.length; item++){
			if(comments[item]?.sentiment === 1){
				againstCount += 1;
			}
			if(comments[item]?.sentiment === 2){
				slightlyAgainstCount += 1;
			}
			if(comments[item]?.sentiment === 3){
				neutralCount += 1;
			}
			if(comments[item]?.sentiment === 4){
				slightlyForCount += 1;
			}
			if(comments[item]?.sentiment === 5){
				forCount += 1;
			}
		}

		setAgainstCount(Number((( againstCount / (againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount) * 100)).toFixed(2)));

		setSlightlyAgainstCount(Number((( slightlyAgainstCount / (againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount) * 100)).toFixed(2)));

		setNeutralCount(Number((( neutralCount / (againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount) * 100)).toFixed(2)));

		setSlightlyForCount(Number((( slightlyForCount / (againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount) * 100)).toFixed(2)));

		setForCount(Number((( forCount / (againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount) * 100)).toFixed(2)));

	};

	const getFilteredComments = (sentiment: number) => {

		const filteredData = comments.filter((comment) => comment?.sentiment === sentiment);
		setFilteredComments(filteredData);

	};

	useEffect(() => {
		getOverallSentiment();
	}, []);

	return (
		<div className={`${className} block xl:grid grid-cols-12 `}>
			{
				!!comments?.length && timelines.length > 1 &&
					<div className='hidden h-screen xl:block col-start-1 col-end-2 min-w-[100px] -ml-2 sticky top-[10%] pt-10'>
						<Anchor targetOffset={targetOffset} className='h-full min-w-[140px]' onClick={handleTimelineClick}>
							{timelines.map(({ commentsCount, date, firstCommentId, id, status }) => {
								return (
									commentsCount > 0 ?
										<AnchorLink
											key={id}
											href={`#${firstCommentId}`}
											title={
												<div className='flex flex-col'>
													<div className='text-xs mb-1'>{date.format('MMM Do')}</div>
													<div className='mb-1 font-medium break-words whitespace-pre-wrap'>{status}</div>
													<div className='text-xs'>({commentsCount})</div>
												</div>
											}
										/>
										:
										<div key={id} className='flex flex-col ml-5 cursor-default'>
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
				{ id ? <>
					{ isGrantClosed ?
						<Alert message="Grant closed, no comments can be added or edited." type="info" showIcon /> :
						<PostCommentForm className='mb-8' />
					}
				</>
					:<div className="p-4 mt-4 mb-8 bg-[#FFF7FB] border-none rounded-lg shadow-md">
						<div className="flex flex-wrap justify-center items-center">
							<Image src="/assets/icons/alert-login.svg" width={20} height={20} alt={''} />
							<div className="ml-1 mt-3">
								<p className="text-sm leading-5 font-medium text-[#243A57]">
									Please <span className="cursor-pointer text-pink_primary" onClick={() => {setOpenLoginModal(true);}}>Log In</span> to comment
								</p>
							</div>
						</div>
					</div>
				}
				<div className='mb-5 flex justify-between  items-center text-base tooltip-design border-solid text-[#485F7D] max-sm:flex-col  max-sm:items-start'>
					<span className='text-base font-medium text-[#243A57]'>
						{filteredComments?.length}
						<span className='ml-1'>Comments</span>
					</span>
					<div className='flex gap-2 max-sm:gap-[2px] border-solid'>
						<Tooltip color='#E5007A'
							title={<div className='flex flex-col text-xs px-1'>
								<span className='text-center font-medium'>Completely Against</span>
								<span className='text-center pt-1'>Select to filter.</span>
							</div>} >
							<div onClick={() => {setFilteredSentiment(1); getFilteredComments(1);}} className={`p-1 flex gap-1 cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] hover:text-[#243A57] ${filteredSentiment === 1 && 'bg-[#FEF2F8] text-[#243A57] '}`} >
								{filteredSentiment === 1 ? <AgainstIcon className='text-[20px] font-medium'/> : <UnfilterAgainstIcon/>}
								<span className='flex justify-center font-medium'>{againstCount}%</span>
							</div>
						</Tooltip>
						<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
							<span className='text-center font-medium'>Slightly Against</span>
							<span className='text-center pt-1'>Select to filter.</span>
						</div>}>
							<div onClick={() => {setFilteredSentiment(2); getFilteredComments(2);}} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] hover:text-[#243A57] ${filteredSentiment === 2 && 'bg-[#FEF2F8] text-[#243A57] '}`}>
								{filteredSentiment === 2 ? <SlightlyAgainstIcon className='text-[20px] font-medium text-white'/> : <UnfilterSlightlyAgainstIcon/>}
								<span className='flex justify-center font-medium'>{slightlyAgainstCount}%</span>
							</div>
						</Tooltip>
						<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
							<span className='text-center font-medium'>Neutral </span>
							<span className='text-center pt-1'>Select to filter.</span>
						</div>}>
							<div onClick={() => {setFilteredSentiment(3); getFilteredComments(3);}} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] hover:text-[#243A57] ${filteredSentiment === 3 && 'bg-[#FEF2F8] text-[#243A57] '}`}>
								{filteredSentiment === 3 ? <NeutralIcon className='text-[20px] font-medium'/> : <UnfilterNeutralIcon/>}
								<span className='flex justify-center font-medium'>{neutralCount}%</span>
							</div>
						</Tooltip>
						<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
							<span className='text-center font-medium'>Slightly For</span>
							<span className='text-center pt-1'>Select to filter.</span>
						</div>}>
							<div onClick={() => {setFilteredSentiment(4); getFilteredComments(4);}} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] hover:text-[#243A57] ${filteredSentiment === 4 && 'bg-[#FEF2F8] text-[#243A57] '}`}>
								{filteredSentiment === 4 ? <SlightlyForIcon className='text-[20px] font-medium text-white'/> : <UnfilterSlightlyForIcon/>}
								<span className='flex justify-center font-medium'>{slightlyForCount}%</span>
							</div>
						</Tooltip>
						<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
							<span className='text-center font-medium'>Completely For</span>
							<span className='text-center pt-1'> Select to filter.</span>
						</div>}>
							<div onClick={() => {setFilteredSentiment(5); getFilteredComments(5);}} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] hover:text-[#243A57] ${filteredSentiment === 5 && 'bg-[#FEF2F8] text-[#243A57] '}`}>
								{filteredSentiment === 5 ? <ForIcon className='text-[21.4px] font-medium'/> : <UnfilterForIcon/>}
								<span className='flex justify-center font-medium'>{forCount}%</span>
							</div>
						</Tooltip>
					</div>
				</div>
				{ !!comments?.length &&
						<>
							<Comments disableEdit={isGrantClosed} comments={filteredComments} />
						</>
				}
				{filteredComments.length === 0 && comments.length > 0 && <div className='mt-4 mb-4'><Empty/></div>}
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