// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Anchor, Empty, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { useNetworkContext, usePostDataContext } from '~src/context';
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
import AgainstIcon from '~assets/overall-sentiment/pink-against.svg';
import SlightlyAgainstIcon from '~assets/overall-sentiment/pink-slightly-against.svg';
import NeutralIcon from '~assets/overall-sentiment/pink-neutral.svg';
import SlightlyForIcon from '~assets/overall-sentiment/pink-slightly-for.svg';
import ForIcon from '~assets/overall-sentiment/pink-for.svg';
import { ESentiments } from '~src/types';
import { getPaginatedComments } from './utils/getPaginatedComments';
import { IComment } from './Comment';
import Loader from '~src/ui-components/Loader';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRouter } from 'next/router';
import { getCommentsWithId } from './utils/getPostCommentsWithId';

const { Link: AnchorLink } = Anchor;

export function getStatus(type: string) {
	if (['DemocracyProposal'].includes(type)) {
		return 'Democracy Proposal';
	} else if ('TechCommitteeProposal' === type) {
		return 'Tech Committee Proposal';
	} else if ('TreasuryProposal' === type) {
		return 'Treasury Proposal';
	} else if (['Referendum', 'FellowshipReferendum', 'ReferendumV2'].includes(type)) {
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

export interface ITimeline {
	date: Dayjs;
	status: string;
	id: number;
	commentsCount: number;
	firstCommentId: string;
	index: string;
	type: string;
}
interface IFilteredSentiment {
	sentiment: ESentiments | 0;
	active: boolean;
}
interface ISentimentsPercentage {
	against: ESentiments | 0;
	for: ESentiments | 0;
	neutral: ESentiments | 0;
	slightlyAgainst: ESentiments | 0;
	slightlyFor: ESentiments | 0;
}

const COMMENT_SIZE = 5;

const CommentsContainer: FC<ICommentsContainerProps> = (props) => {
	const { className, id } = props;
	const { postData: { comments:initialComments, postType, timeline, created_at, currentTimeline:initialCurrentTimeline } } = usePostDataContext();
	const targetOffset = 10;
	const [timelines, setTimelines] = useState<ITimeline[]>([]);
	const isGrantClosed: boolean = Boolean(postType === ProposalType.GRANTS && created_at && dayjs(created_at).isBefore(dayjs().subtract(6, 'days')));
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [filteredSentiment, setFilteredSentiment] = useState<IFilteredSentiment>({ active: false, sentiment: 0 });
	const [comments, setComments] = useState<{[index:string]:Array<IComment>}>(initialComments);
	const [showOverallSentiment, setShowOverallSentiment] = useState<boolean>(true);
	const [sentimentsPercentage, setSentimentsPercentage] = useState<ISentimentsPercentage>({ against: 0, for: 0, neutral: 0, slightlyAgainst: 0, slightlyFor: 0 });
	const [loading, setLoading] = useState(true);
	const [currentTimeline, setCurrentTimeline] = useState<ITimeline | null>(initialCurrentTimeline || null);
	const { network } = useNetworkContext();
	const allComments = Object.values(comments)?.flat() || [];
	const router = useRouter();
	const allCommentsLength = timelines.reduce((a, b) => a + b.commentsCount, 0);

	const url = window.location.href;
	const commentId = url.split('#')[1];
	const handleTimelineClick = (e: React.MouseEvent<HTMLElement>, link: { title: React.ReactNode; href: string; }) => {
		if (link.href === '#') {
			e.preventDefault();
			return;
		}
	};

	const handleSetFilteredComments = (sentiment: ESentiments | 0) => {
		setFilteredSentiment((pre) => pre.sentiment === sentiment && pre.active === true ? { ...pre, active: false } : { active: true, sentiment: sentiment });
	};

	const getOverallSentimentPercentage = () => {
		let againstCount = 0;
		let slightlyAgainstCount = 0;
		let neutralCount = 0;
		let slightlyForCount = 0;
		let forCount = 0;

		for (let item = 0; item < allComments.length; item++) {
			switch (allComments[item]?.sentiment) {
			case ESentiments.Against:
				againstCount += 1;
				break;
			case ESentiments.SlightlyAgainst:
				slightlyAgainstCount += 1;
				break;
			case ESentiments.Neutral:
				neutralCount += 1;
				break;
			case ESentiments.SlightlyFor:
				slightlyForCount += 1;
				break;
			case ESentiments.For:
				forCount += 1;
				break;

			}
		}
		const totalCount = againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount;

		setSentimentsPercentage({
			against: Number(Math.round(againstCount / totalCount * 100)) || 0,
			for: Number(Math.round(forCount / totalCount * 100)) || 0,
			neutral: Number(Math.round(neutralCount / totalCount * 100)) || 0,
			slightlyAgainst: Number(Math.round(slightlyAgainstCount / totalCount * 100)) || 0,
			slightlyFor: Number(Math.round(slightlyForCount / totalCount * 100)) || 0
		});

		allComments?.length === 0 ? setShowOverallSentiment(false) : setShowOverallSentiment(true);
		if (againstCount === 0 && slightlyAgainstCount === 0 && neutralCount === 0 && slightlyForCount === 0 && forCount === 0) { setShowOverallSentiment(false); } else { setShowOverallSentiment(true); }

	};

	const getFilteredComments = (sentiment: number) => {
		if (filteredSentiment.sentiment === sentiment && filteredSentiment.active) { setComments(comments); }
		else {
			const commentsPayload = Object.assign({}, comments);
			for(const index in commentsPayload){
				commentsPayload[index] =commentsPayload[index].filter((comment) => comment?.sentiment === sentiment);
			}
			setComments(commentsPayload);
		}
	};

	const checkActive = (sentiment: ESentiments) => {
		return filteredSentiment.active && filteredSentiment.sentiment === sentiment;
	};

	useEffect(() => {
		getOverallSentimentPercentage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comments]);

	const setTimeline = async () => {
		if(!timeline){
			setLoading(false);
			return;
		}
		const timelines:ITimeline[] = [];
		const comments:{[index:string]:IComment[]} ={};
		if (timeline && timeline.length > 0) {
			timeline.forEach((obj) => {
				timelines.push({
					commentsCount: obj.commentsCount,
					date: dayjs(obj?.created_at),
					firstCommentId: '',
					id: timelines.length + 1,
					index: obj?.index.toString(),
					status: getStatus(obj?.type),
					type:obj?.type
				});
				comments[obj?.index.toString()] = [];
			});
			setTimelines(timelines);
		}
		if(commentId){
			if(!currentTimeline){
				return;
			}
			for(let i = 0; i < timelines.length; i++){
				if(timelines[i].commentsCount === 0){
					continue;
				}
				setCurrentTimeline(timelines[i]);
				const res = await getCommentsWithId(timelines[i].index.toString(), commentId, network, COMMENT_SIZE, timelines[i].type);
				const isCommentExit = res.comments.some((comment: { id: string; }) => {
					return comment.id === commentId;
				});
				comments[timelines[i].index] = [...comments[timelines[i].index], ...res.comments];
				if(isCommentExit){
					break;
				}
				console.log(comments);
			}
			setComments(comments);
		}
		if(loading){
			setLoading(false);
		}
	};

	const getNextComments =async () => {
		console.log(currentTimeline);
		if(!currentTimeline){
			return;
		}
		const commentsPayload = Object.assign({}, comments);
		for(let i = 0; i < timelines.length; i++){
			if(timelines[i].commentsCount === 0){
				continue;
			}
			const timeline = timelines[i];
			const lastDoc = commentsPayload[timelines[i].index][commentsPayload[timelines[i].index].length-1]?.id;
			setCurrentTimeline(timeline);
			if(timeline && commentsPayload[timelines[i].index].length < timeline.commentsCount){
				const res:any = await getPaginatedComments(timeline.index.toString(), lastDoc, network, COMMENT_SIZE, timeline.type);
				commentsPayload[timeline.index] = [...commentsPayload[timeline.index], ...res.comments];
				if(res.comments.length === COMMENT_SIZE){
					break;
				}
				if(commentsPayload[timelines[i].index].length < timeline.commentsCount){
					i--;
				}
			}
		}
		setComments(commentsPayload);
	};

	const handleSingleTimelineClick =async (timeline:ITimeline) => {
		const commentsPayload = Object.assign({}, comments);
		if(!currentTimeline || commentsPayload[timeline.index]?.[0] ){
			return;
		}
		for(const data of timelines){
			if(data.id > timeline.id){
				break;
			}
			if(currentTimeline.id <= data.id && data.id !== timeline.id){
				if(commentsPayload[currentTimeline.index].length < currentTimeline.commentsCount){
					const lastDoc = commentsPayload[currentTimeline.index][commentsPayload[data.index].length-1]?.id;
					const res:any = await getPaginatedComments(currentTimeline.index.toString(), lastDoc, network, Infinity, currentTimeline.type);
					commentsPayload[currentTimeline.index] = [...commentsPayload[currentTimeline.index], ...res.comments];
				}
			}
			if(data.id === timeline.id){
				const res:any = await getPaginatedComments(data.index.toString(), undefined, network, COMMENT_SIZE, data.type);
				commentsPayload[data.index] = [...commentsPayload[data.index], ...res.comments];
				break;
			}
		}
		setComments(commentsPayload);
		setCurrentTimeline(timeline);
		return commentsPayload[timeline.index]?.[0].id || '';
	};

	const handleCurrentCommentAndTimeline = (postId:string, comment:IComment) => {
		const commentsPayload = {
			...comments,
			[postId]:[
				...comments[postId],
				comment
			]
		};
		setComments(commentsPayload);
		const timelinePayload = timelines.map((timeline) => (
			timeline.index === postId ?
				{ ...timeline,commentsCount:timeline.commentsCount+1 } :
				timeline
		));
		setTimelines(timelinePayload);
	};

	useEffect(() => {
		setTimeline();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	return (
		<div className={className}>
			{id ? <>
				{isGrantClosed ?
					<Alert message="Grant closed, no comments can be added or edited." type="info" showIcon /> :
					<PostCommentForm className='mb-8' setCurrentState={handleCurrentCommentAndTimeline}/>
				}
			</>
				: <div className="mt-4 mb-8 bg-[#E6F4FF] rounded-[6px] shadow-md h-12 flex justify-center items-center gap-3">
					<Image src="/assets/icons/alert-login.svg" width={20} height={20} alt={''} />
					<div className="text-sm font-medium text-bodyBlue">
						Please <span className="cursor-pointer text-pink_primary" onClick={() => { setOpenLoginModal(true); }}>Log In</span> to comment
					</div>
				</div>
			}
			<div className='mb-5 flex justify-between items-center tooltip-design max-sm:flex-col max-sm:items-start max-sm:gap-1'>
				<span className='text-lg font-medium text-bodyBlue'>
					{allCommentsLength || 0}
					<span className='ml-1'>Comments</span>
				</span>
				{showOverallSentiment && <div className='flex gap-2 max-sm:gap-[2px] max-sm:-ml-2 '>
					<Tooltip color='#E5007A'
						title={<div className='flex flex-col text-xs px-1'>
							<span className='text-center font-medium'>Completely Against</span>
							<span className='text-center pt-1'>Select to filter</span>
						</div>} >
						<div onClick={() => { handleSetFilteredComments(ESentiments.Against); getFilteredComments(ESentiments.Against); }} className={`p-1 flex gap-1 cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] ${checkActive(ESentiments.Against) && 'bg-[#FEF2F8] text-bodyBlue text-pink_primary'}`} >
							{checkActive(ESentiments.Against) ? <AgainstIcon /> : <UnfilterAgainstIcon />}
							<span className={'flex justify-center font-medium'}>{sentimentsPercentage?.against}%</span>
						</div>
					</Tooltip>
					<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
						<span className='text-center font-medium'>Slightly Against</span>
						<span className='text-center pt-1'>Select to filter</span>
					</div>}>
						<div onClick={() => { handleSetFilteredComments(ESentiments.SlightlyAgainst); getFilteredComments(ESentiments.SlightlyAgainst); }} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] ${checkActive(ESentiments.SlightlyAgainst) && 'bg-[#FEF2F8] text-bodyBlue text-pink_primary'}`}>
							{checkActive(ESentiments.SlightlyAgainst) ? <SlightlyAgainstIcon /> : <UnfilterSlightlyAgainstIcon />}
							<span className={'flex justify-center font-medium'}>{sentimentsPercentage?.slightlyAgainst}%</span>
						</div>
					</Tooltip>
					<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
						<span className='text-center font-medium'>Neutral </span>
						<span className='text-center pt-1'>Select to filter</span>
					</div>}>
						<div onClick={() => { handleSetFilteredComments(ESentiments.Neutral); getFilteredComments(ESentiments.Neutral); }} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] ${checkActive(ESentiments.Neutral) && 'bg-[#FEF2F8] text-bodyBlue text-pink_primary'}`}>
							{checkActive(ESentiments.Neutral) ? <NeutralIcon className='text-[20px] font-medium' /> : <UnfilterNeutralIcon />}
							<span className={'flex justify-center font-medium'}>{sentimentsPercentage?.neutral}%</span>
						</div>
					</Tooltip>
					<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
						<span className='text-center font-medium'>Slightly For</span>
						<span className='text-center pt-1'>Select to filter</span>
					</div>}>
						<div onClick={() => { handleSetFilteredComments(ESentiments.SlightlyFor); getFilteredComments(ESentiments.SlightlyFor); }} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] ${checkActive(ESentiments.SlightlyFor) && 'bg-[#FEF2F8] text-bodyBlue text-pink_primary'}`}>
							{checkActive(ESentiments.SlightlyFor) ? <SlightlyForIcon /> : <UnfilterSlightlyForIcon />}
							<span className={'flex justify-center font-medium'}>{sentimentsPercentage?.slightlyFor}%</span>
						</div>
					</Tooltip>
					<Tooltip color='#E5007A' title={<div className='flex flex-col text-xs px-1'>
						<span className='text-center font-medium'>Completely For</span>
						<span className='text-center pt-1'> Select to filter</span>
					</div>}>
						<div onClick={() => { handleSetFilteredComments(ESentiments.For); getFilteredComments(ESentiments.For); }} className={`p-[3.17px] flex gap-[3.46px] cursor-pointer text-xs items-center hover:bg-[#FEF2F8] rounded-[4px] ${checkActive(ESentiments.For) && 'bg-[#FEF2F8] text-bodyBlue text-pink_primary'}`}>
							{checkActive(ESentiments.For) ? <ForIcon /> : <UnfilterForIcon />}
							<span className={'flex justify-center font-medium'}>{sentimentsPercentage?.for}%</span>
						</div>
					</Tooltip>
				</div>}
			</div>
			<div className={'block xl:grid grid-cols-12'}>
				{
					!!allComments?.length && timelines.length >= 1 &&
					<div className='hidden h-auto xl:block col-start-1 col-end-2 min-w-[100px] sticky top-[10%] ml-1'>
						<Anchor targetOffset={targetOffset} className='h-full min-w-[140px]' onClick={handleTimelineClick}>
							{timelines.map((timeline) => {
								return (
									timeline.commentsCount > 0 ?
										<div key={id} onClick={() => {
											if(!comments[timeline.index]?.[0]?.id){
												setLoading(true);
												handleSingleTimelineClick(timeline).then((firstCommentId) => {
													setLoading(false);
													router.push(`#${firstCommentId}`);
												});
											}
										}} className='m-0 p-0 border-none [&>.ant-card-body]:p-0'>
											{comments[timeline.index]?.[0]?.id ? <AnchorLink
												href={`#${comments[timeline.index]?.[0]?.id}`}
												title={
													<div className='flex flex-col text-lightBlue'>
														<div className='text-xs mb-1'>{timeline.date.format('MMM Do')}</div>
														<div className='mb-1 font-medium break-words whitespace-pre-wrap'>{timeline.status}</div>
														<div className='text-xs'>({timeline.commentsCount})</div>
													</div>
												}
											/>:
												<div className='flex flex-col text-lightBlue ml-5 cursor-pointer'>
													<div className='text-xs mb-1'>{timeline.date.format('MMM Do')}</div>
													<div className='mb-1 font-medium break-words whitespace-pre-wrap'>{timeline.status}</div>
													<div className='text-xs'>({timeline.commentsCount})</div>
												</div>
											}
										</div>
										:
										<div key={timeline.id} className='flex flex-col ml-5 cursor-default text-lightBlue'>
											<div className='text-xs mb-1'>{timeline.date.format('MMM Do')}</div>
											<div className='mb-1 font-medium break-words whitespace-pre-wrap'>{timeline.status}</div>
											<div className='text-xs'>({timeline.commentsCount})</div>
										</div>
								);
							})}
						</Anchor>
					</div>
				}
				<div className={`col-start-1 ${timelines.length >= 1 && 'xl:col-start-3'} col-end-13 mt-0`}>
					{!!allComments?.length && !loading &&
						<>
							<InfiniteScroll
								dataLength={allComments.length}
								className='overflow-hidden'
								next={getNextComments}
								hasMore={allComments.length < allCommentsLength}
								loader={<Loader/>}
								endMessage={
									<p style={{ textAlign: 'center' }}>
										No more comments
									</p>
								}>
								<Comments disableEdit={isGrantClosed} comments={allComments} />
							</InfiniteScroll>
						</>
					}
					{loading && <Loader/>}
					{allComments.length === 0 && allComments.length > 0 && <div className='mt-4 mb-4'>
						<Empty description='No comments available' />
					</div>}
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

// @ts-ignore
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