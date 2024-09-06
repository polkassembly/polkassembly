// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Anchor, Empty } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCommentDataContext, usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import { AiStarIcon } from '~src/ui-components/CustomIcons';
import PostCommentForm from '../PostCommentForm';
import Comments from './Comments';
import RefendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
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
import GreenTickIcon from '~assets/icons/green-tick.svg';
import MinusSignIcon from '~assets/icons/minus-sign.svg';
import UnfilterDarkSentiment1 from '~assets/overall-sentiment/dark/dark(1).svg';
import UnfilterDarkSentiment2 from '~assets/overall-sentiment/dark/dark(2).svg';
import UnfilterDarkSentiment3 from '~assets/overall-sentiment/dark/dark(3).svg';
import UnfilterDarkSentiment4 from '~assets/overall-sentiment/dark/dark(4).svg';
import UnfilterDarkSentiment5 from '~assets/overall-sentiment/dark/dark(5).svg';
import DarkSentiment1 from '~assets/overall-sentiment/dark/dizzy(1).svg';
import DarkSentiment2 from '~assets/overall-sentiment/dark/dizzy(2).svg';
import DarkSentiment3 from '~assets/overall-sentiment/dark/dizzy(3).svg';
import DarkSentiment4 from '~assets/overall-sentiment/dark/dizzy(4).svg';
import DarkSentiment5 from '~assets/overall-sentiment/dark/dizzy(5).svg';
import { ESentiments, ICommentsSummary } from '~src/types';
import { IComment } from './Comment';
import Loader from '~src/ui-components/Loader';
import { useRouter } from 'next/router';
import { getAllCommentsByTimeline } from './utils/getAllCommentsByTimeline';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import Tooltip from '~src/basic-components/Tooltip';
import Alert from '~src/basic-components/Alert';
import getIsCommentAllowed from './utils/getIsCommentAllowed';
import getCommentDisabledMessage from './utils/getCommentDisabledMessage';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import Skeleton from '~src/basic-components/Skeleton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

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

interface ISentimentsPercentage {
	against: ESentiments | 0;
	for: ESentiments | 0;
	neutral: ESentiments | 0;
	slightlyAgainst: ESentiments | 0;
	slightlyFor: ESentiments | 0;
}

export const getSortedComments = (comments: { [index: string]: Array<IComment> }) => {
	const commentResponse: any = {};
	for (const key in comments) {
		commentResponse[key] = comments[key].sort((a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)));
	}
	return commentResponse;
};

const CommentsContainer: FC<ICommentsContainerProps> = (props) => {
	const { className, id } = props;
	const { loginAddress, isUserOnchainVerified } = useUserDetailsSelector();
	const {
		postData: { postType, timeline, created_at, allowedCommentors, userId, postIndex }
	} = usePostDataContext();
	const targetOffset = 10;
	const { comments, setComments, setTimelines, timelines, overallSentiments, setOverallSentiments } = useCommentDataContext();
	const isGrantClosed: boolean = Boolean(postType === ProposalType.GRANTS && created_at && dayjs(created_at).isBefore(dayjs().subtract(6, 'days')));
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const [showOverallSentiment, setShowOverallSentiment] = useState<boolean>(true);
	const [sentimentsPercentage, setSentimentsPercentage] = useState<ISentimentsPercentage>({ against: 0, for: 0, neutral: 0, slightlyAgainst: 0, slightlyFor: 0 });
	const [loading, setLoading] = useState(true);
	const { network } = useNetworkSelector();
	const [filterSentiments, setFilterSentiments] = useState<ESentiments | null>(null);
	const router = useRouter();
	let allComments = Object.values(comments)?.flat() || [];
	const { resolvedTheme: theme } = useTheme();
	const [reasonForNoComment, setReasonForNoComment] = useState<String | null>(null);
	const [isCommentAllowed, setCommentAllowed] = useState<boolean>(false);
	const [aiContentSummary, setAiContentSummary] = useState<ICommentsSummary | null>(null);
	const [fetchingAISummary, setFetchingAISummary] = useState<boolean>(false);
	const [showPositiveSummary, setShowPositiveSummary] = useState(false);
	const [showNegativeSummary, setShowNegativeSummary] = useState(false);
	const [hasEnoughContent, setHasEnoughContent] = useState<boolean>(false);

	const CommentsContentCheck = (comments: { [key: string]: Array<{ content: string; replies?: Array<{ content: string }> }> }) => {
		let allCommentsContent = '';

		Object.values(comments).forEach((commentArray) => {
			commentArray.forEach((comment) => {
				allCommentsContent += ' ' + comment.content;
				if (comment.replies && comment.replies.length > 0) {
					comment.replies.forEach((reply) => {
						allCommentsContent += ' ' + reply.content;
					});
				}
			});
		});
		const wordCount = allCommentsContent.split(/\s+/).filter((word) => word.trim().length > 0).length;
		return wordCount > 200;
	};

	if (filterSentiments) {
		allComments = allComments.filter((comment) => comment?.sentiment === filterSentiments);
	}

	const handleTimelineClick = (e: React.MouseEvent<HTMLElement>, link: { title: React.ReactNode; href: string }) => {
		if (link.href === '#') {
			e.preventDefault();
			return;
		}
	};

	const getOverallSentimentPercentage = () => {
		const againstCount = overallSentiments?.[ESentiments.Against] || 0;
		const slightlyAgainstCount = overallSentiments?.[ESentiments.SlightlyAgainst] || 0;
		const neutralCount = overallSentiments?.[ESentiments.Neutral] || 0;
		const slightlyForCount = overallSentiments?.[ESentiments.SlightlyFor] || 0;
		const forCount = overallSentiments?.[ESentiments.For] || 0;

		const totalCount = againstCount + slightlyAgainstCount + neutralCount + slightlyForCount + forCount;

		setSentimentsPercentage({
			against: Number(Math.round((againstCount / totalCount) * 100)) || 0,
			for: Number(Math.round((forCount / totalCount) * 100)) || 0,
			neutral: Number(Math.round((neutralCount / totalCount) * 100)) || 0,
			slightlyAgainst: Number(Math.round((slightlyAgainstCount / totalCount) * 100)) || 0,
			slightlyFor: Number(Math.round((slightlyForCount / totalCount) * 100)) || 0
		});

		allComments?.length === 0 ? setShowOverallSentiment(false) : setShowOverallSentiment(true);
		if (againstCount === 0 && slightlyAgainstCount === 0 && neutralCount === 0 && slightlyForCount === 0 && forCount === 0) {
			setShowOverallSentiment(false);
		} else {
			setShowOverallSentiment(true);
		}
	};

	const getFilteredComments = (sentiment: number) => {
		setFilterSentiments(filterSentiments === sentiment ? null : sentiment);
	};

	const checkActive = (sentiment: ESentiments) => {
		return filterSentiments === sentiment;
	};

	const getSummary = async () => {
		setFetchingAISummary(true);
		try {
			const { data, error } = await nextApiClientFetch<ICommentsSummary | null>('api/v1/ai-summary/fetchCommentsSummary', {
				postId: postIndex,
				postType
			});

			if (error || !data) {
				console.log('Error While fetching AI summary data', error);
				setFetchingAISummary(false);
			}

			if (data) {
				setAiContentSummary(data);
				setFetchingAISummary(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getOverallSentimentPercentage();
		if (!Object.keys(comments).length) return;
		if (network != 'rococo') return;
		setHasEnoughContent(CommentsContentCheck(comments));
		getSummary();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comments]);

	const addCommentDataToTimeline = async () => {
		if (!timeline) {
			setLoading(false);
			return;
		}
		const timelines: ITimeline[] = [];
		const comments: { [index: string]: IComment[] } = {};
		if (timeline && timeline.length > 0) {
			timeline.forEach((obj) => {
				timelines.push({
					commentsCount: obj.commentsCount,
					date: dayjs(obj?.created_at),
					firstCommentId: '',
					id: timelines.length + 1,
					index: obj?.index?.toString(),
					status: getStatus(obj?.type),
					type: obj?.type
				});
				comments[`${obj?.index?.toString()}_${obj?.type}`] = [];
			});
			setTimelines(timelines);
		}
		const commentResponse = await getAllCommentsByTimeline(timeline, network);

		if (!commentResponse || Object.keys(commentResponse).length == 0) {
			setComments(comments);
		} else {
			setComments(getSortedComments(commentResponse.comments));
			setOverallSentiments(commentResponse.overallSentiments);
		}
		if (loading) {
			setLoading(false);
		}
	};

	const handleCurrentCommentAndTimeline = (postId: string, type: string, comment: IComment) => {
		const key = `${postId}_${type}`;
		const existingComments = comments[key] || [];
		const commentsPayload = {
			...comments,
			[key]: [...existingComments, comment]
		};
		setComments(getSortedComments(commentsPayload));
		const timelinePayload = timelines.map((timeline) => (timeline.index === postId ? { ...timeline, commentsCount: timeline.commentsCount + 1 } : timeline));
		setTimelines(timelinePayload);
		router.push(`#${comment.id}`);
	};

	useEffect(() => {
		if (!timeline || timeline.length == 0) {
			if (loading) {
				setLoading(false);
			}
			return;
		}
		addCommentDataToTimeline();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeline]);

	const sentimentsData = [
		{
			iconActive: theme !== 'dark' ? <AgainstIcon /> : <DarkSentiment1 />,
			iconInactive: theme !== 'dark' ? <UnfilterAgainstIcon /> : <UnfilterDarkSentiment1 />,
			percentage: sentimentsPercentage?.against,
			sentiment: ESentiments.Against,
			title: 'Completely Against'
		},
		{
			iconActive: theme !== 'dark' ? <SlightlyAgainstIcon /> : <DarkSentiment2 />,
			iconInactive: theme !== 'dark' ? <UnfilterSlightlyAgainstIcon /> : <UnfilterDarkSentiment2 />,
			percentage: sentimentsPercentage?.slightlyAgainst,
			sentiment: ESentiments.SlightlyAgainst,
			title: 'Slightly Against'
		},
		{
			iconActive: theme !== 'dark' ? <NeutralIcon className='text-[20px] font-medium' /> : <DarkSentiment3 />,
			iconInactive: theme !== 'dark' ? <UnfilterNeutralIcon /> : <UnfilterDarkSentiment3 />,
			percentage: sentimentsPercentage?.neutral,
			sentiment: ESentiments.Neutral,
			title: 'Neutral'
		},
		{
			iconActive: theme !== 'dark' ? <SlightlyForIcon /> : <DarkSentiment4 />,
			iconInactive: theme !== 'dark' ? <UnfilterSlightlyForIcon /> : <UnfilterDarkSentiment4 />,
			percentage: sentimentsPercentage?.slightlyFor,
			sentiment: ESentiments.SlightlyFor,
			title: 'Slightly For'
		},
		{
			iconActive: theme !== 'dark' ? <ForIcon /> : <DarkSentiment5 />,
			iconInactive: theme !== 'dark' ? <UnfilterForIcon /> : <UnfilterDarkSentiment5 />,
			percentage: sentimentsPercentage?.for,
			sentiment: ESentiments.For,
			title: 'Completely For'
		}
	];

	useEffect(() => {
		setReasonForNoComment(getCommentDisabledMessage(allowedCommentors, !!loginAddress && isUserOnchainVerified));
		setCommentAllowed(id === userId ? true : getIsCommentAllowed(allowedCommentors, !!loginAddress && isUserOnchainVerified));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allowedCommentors, loginAddress, isUserOnchainVerified]);

	const toggleSummary = (type: 'positive' | 'negative') => {
		if (type === 'positive') {
			setShowPositiveSummary(!showPositiveSummary);
		} else {
			setShowNegativeSummary(!showNegativeSummary);
		}
	};

	const getDisplayText = (text: string, showFull: boolean) => {
		if (!text) return '';
		const words = text.split(' ');
		const isLongText = words.length > 100;
		return showFull || !isLongText ? text : words.slice(0, 100).join(' ') + '...';
	};

	const shouldShowToggleButton = (text: string) => {
		return text.split(' ').length > 100;
	};

	return (
		<div className={className}>
			{id ? (
				<>
					{isGrantClosed ? (
						<Alert
							message={<span className='mb-6 dark:text-blue-dark-high'>Grant closed, no comments can be added or edited.</span>}
							type='info'
							showIcon
						/>
					) : !isCommentAllowed ? (
						<Alert
							message={<span className='mb-10 dark:text-blue-dark-high'>{reasonForNoComment}</span>}
							type='info'
							showIcon
						/>
					) : (
						<PostCommentForm
							className='mb-2'
							setCurrentState={handleCurrentCommentAndTimeline}
						/>
					)}
				</>
			) : (
				<div
					id='comment-login-prompt'
					className={classNames(!isCommentAllowed ? ' mt-6' : '', 'mb-8 mt-4 flex h-12 items-center justify-center gap-3 rounded-sm bg-[#E6F4FF] shadow-md dark:bg-alertColorDark')}
				>
					<Image
						src='/assets/icons/alert-login.svg'
						width={20}
						height={20}
						alt={''}
					/>
					<div className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
						Please{' '}
						<span
							className='cursor-pointer text-pink_primary'
							onClick={() => {
								setOpenLoginModal(true);
							}}
						>
							Log In
						</span>{' '}
						to comment
					</div>
				</div>
			)}
			{network == 'rococo' ? (
				<div className='mt-4'>
					{fetchingAISummary ? (
						<Skeleton className='mt-4' />
					) : aiContentSummary && hasEnoughContent ? (
						<div className='mb-6 mt-4 w-full rounded-xl border border-solid border-[#d2d8e0] p-[10px] dark:border-separatorDark sm:p-4'>
							<div className={`${poppins.variable} ${poppins.className} items-center justify-between sm:flex`}>
								<div className='text-base font-semibold text-[#334D6E] dark:text-blue-dark-high '>Users are saying...</div>
								<span
									className={`${poppins.variable} ${poppins.className} ml-auto mt-2 rounded-lg bg-[#F6F6F6] px-2 py-1 text-xs text-blue-light-medium dark:bg-section-dark-background dark:text-blue-dark-medium sm:mt-0`}
								>
									<span className='mr-1 '>Based on</span>
									{allComments.length || 0}
									<span className='ml-1'>Comments</span>
								</span>
							</div>
							<div className='mt-2 flex items-start gap-4'>
								<span className='mt-2'>
									<GreenTickIcon />
								</span>
								<p className={`${poppins.variable} ${poppins.className} mt-2 text-sm font-normal text-blue-light-high dark:text-blue-dark-high`}>
									{getDisplayText(aiContentSummary?.summary_positive, showPositiveSummary)}
									{shouldShowToggleButton(aiContentSummary?.summary_positive) && (
										<span
											onClick={() => toggleSummary('positive')}
											className='ml-1 cursor-pointer text-sm text-pink_primary'
										>
											{showPositiveSummary ? 'See Less' : 'See More'}
										</span>
									)}
								</p>
							</div>
							<div className='flex items-start gap-4'>
								<span className='mt-2'>
									<MinusSignIcon />
								</span>
								<p className={`${poppins.variable} ${poppins.className} mt-2 text-sm font-normal text-blue-light-high dark:text-blue-dark-high`}>
									{getDisplayText(aiContentSummary?.summary_negative, showNegativeSummary)}
									{shouldShowToggleButton(aiContentSummary?.summary_negative) && (
										<span
											onClick={() => toggleSummary('negative')}
											className='ml-1 cursor-pointer border-none bg-transparent text-sm text-pink_primary'
										>
											{showNegativeSummary ? 'See Less' : 'See More'}
										</span>
									)}
								</p>
							</div>
							<h2 className={`${poppins.variable} ${poppins.className} mt-2 text-xs text-[#485F7DCC] dark:text-blue-dark-medium`}>
								<AiStarIcon className='text-base' /> AI-generated from comments
							</h2>
						</div>
					) : null}
				</div>
			) : null}
			{Boolean(allComments?.length) && timelines.length >= 1 && !loading && (
				<div
					id='comments-section'
					className={classNames(!isCommentAllowed ? ' mt-6' : '', 'tooltip-design mb-5 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-1')}
				>
					<span className='text-lg font-medium text-bodyBlue dark:font-normal dark:text-blue-dark-high'>
						{allComments.length || 0}
						<span className='ml-1'>Comments</span>
					</span>
					{showOverallSentiment && (
						<div className='flex gap-2 max-sm:-ml-2 max-sm:gap-[2px] '>
							{sentimentsData.map((data) => (
								<Tooltip
									key={data.sentiment}
									color='#E5007A'
									title={
										<div className='flex flex-col px-1 text-xs'>
											<span className='text-center font-medium'>{data.title}</span>
											<span className='pt-1 text-center'>Select to filter</span>
										</div>
									}
								>
									<div
										onClick={() => getFilteredComments(data.sentiment)}
										className={`flex cursor-pointer items-center gap-[3.46px] rounded-[4px] p-[3.17px] text-xs hover:bg-[#FEF2F8]  ${
											checkActive(data.sentiment) && 'bg-[#FEF2F8] text-pink_primary dark:bg-[#33071E]'
										} ${loading ? 'pointer-events-none cursor-not-allowed opacity-50' : ''} ${
											overallSentiments[data.sentiment] == 0 ? 'pointer-events-none' : ''
										} dark:hover:bg-[#33071E]`}
									>
										{checkActive(data.sentiment) ? data.iconActive : data.iconInactive}
										<span className={'flex justify-center font-medium dark:font-normal dark:text-[#ffffff99]'}>{data.percentage}%</span>
									</div>
								</Tooltip>
							))}
						</div>
					)}
				</div>
			)}
			<div className={classNames(!isCommentAllowed ? 'mt-6' : '', 'block grid-cols-12 xl:grid')}>
				{!!allComments?.length && timelines.length >= 1 && (
					<div className='sticky top-[110px] col-start-1 col-end-2 mb-[65px] ml-1 hidden h-min min-w-[100px] xl:block'>
						<Anchor
							targetOffset={targetOffset}
							className='h-full min-w-[140px]'
							onClick={handleTimelineClick}
						>
							{timelines.map((timeline) => {
								return timeline.commentsCount > 0 ? (
									<div
										key={timeline.id}
										className='m-0 border-none p-0 [&>.ant-card-body]:p-0'
									>
										{comments[`${timeline.index}_${timeline.type}`]?.[0]?.id ? (
											<AnchorLink
												href={`#${comments[`${timeline.index}_${timeline.type}`]?.[0]?.id}`}
												title={
													<div className='sticky top-10 flex flex-col text-lightBlue dark:text-blue-dark-high'>
														<div className='mb-1 text-xs'>{timeline.date.format('MMM Do')}</div>
														<div className='mb-1 whitespace-pre-wrap break-words font-medium'>{timeline.status}</div>
														<div className='text-xs'>({comments[`${timeline.index}_${timeline.type}`]?.length || 0})</div>
													</div>
												}
											/>
										) : (
											<div className='sticky top-10 ml-5 flex cursor-pointer flex-col text-lightBlue dark:text-blue-dark-high'>
												<div className='mb-1 text-xs'>{timeline.date.format('MMM Do')}</div>
												<div className='mb-1 whitespace-pre-wrap break-words font-medium'>{timeline.status}</div>
												<div className='text-xs'>({timeline.commentsCount})</div>
											</div>
										)}
									</div>
								) : (
									<div
										key={timeline.id}
										className='sticky top-10 ml-5 flex cursor-default flex-col text-lightBlue dark:text-blue-dark-high'
									>
										<div className='mb-1 text-xs'>{timeline.date.format('MMM Do')}</div>
										<div className='mb-1 whitespace-pre-wrap break-words font-medium'>{timeline.status}</div>
										<div className='text-xs'>({timeline.commentsCount})</div>
									</div>
								);
							})}
						</Anchor>
					</div>
				)}
				<div className={`col-start-1 ${timelines.length >= 1 && 'xl:col-start-3'} col-end-13 mt-0`}>
					{!!allComments?.length && !loading && (
						<>
							<Comments
								disableEdit={isGrantClosed}
								comments={allComments}
							/>
						</>
					)}
					{loading && <Loader />}
					{allComments.length === 0 && allComments.length > 0 && (
						<div className='mb-4 mt-4'>
							<Empty description='No comments available' />
						</div>
					)}
					{
						<RefendaLoginPrompts
							theme={theme}
							modalOpen={openLoginModal}
							setModalOpen={setOpenLoginModal}
							image='/assets/post-comment.png'
							title='Join Polkassembly to Comment on this proposal.'
							subtitle='Discuss, contribute and get regular updates from Polkassembly.'
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
