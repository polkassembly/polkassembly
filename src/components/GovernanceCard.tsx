// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, Progress, Skeleton, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import React, { FC, useEffect, useState } from 'react';
import { noTitle } from 'src/global/noTitle';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import OnchainCreationLabel from 'src/ui-components/OnchainCreationLabel';
import StatusTag from 'src/ui-components/StatusTag';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import TopicTag from '~src/ui-components/TopicTag';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { CommentsIcon } from '~src/ui-components/CustomIcons';
import { getFormattedLike } from '~src/util/getFormattedLike';
import { useApiContext } from '~src/context';
import { useRouter } from 'next/router';
import getQueryToTrack from '~src/util/getQueryToTrack';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { IPeriod } from '~src/types';
import { getPeriodData } from '~src/util/getPeriodData';
import { ProposalType } from '~src/global/proposalType';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { getTrackData } from './Listing/Tracks/AboutTrackCard';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import Markdown from '~src/ui-components/Markdown';
import TagsModal from '~src/ui-components/TagsModal';

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});
const VotesProgressInListing = dynamic(() => import('~src/ui-components/VotesProgressInListing'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});

interface IGovernanceProps {
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	address: string;
	username?: string;
	className?: string;
	commentsCount: number;
	created_at?: Date;
	end?: number;
	method?: string;
	onchainId?: string | number | null;
	status?: string | null;
	tipReason?: string;
	title?: string | null;
	topic?: string;
	isTip?: boolean;
	tip_index?: number | null;
	isCommentsVisible?: boolean;
	tags?: string[] | [];
	spam_users_count?: number;
	cid?: string;
	requestedAmount?: number;
	tally?: any;
	timeline?: any[];
	statusHistory?: any[];
	index?: number;
	proposalType?: ProposalType | string;
	votesData?: any;
	trackNumber?: number;
	identityId?: string | null;
	truncateUsername?: boolean;
	showSimilarPost?: boolean;
	type?: string;
	description?: string;
}

const GovernanceCard: FC<IGovernanceProps> = (props) => {
	const {
		postReactionCount,
		address,
		cid,
		className,
		commentsCount,
		created_at,
		end = 0,
		method,
		onchainId,
		status,
		tipReason,
		title,
		topic,
		isTip,
		tip_index,
		isCommentsVisible = true,
		username,
		tags,
		spam_users_count,
		requestedAmount,
		tally,
		timeline,
		trackNumber,
		statusHistory = [],
		index = 0,
		proposalType,
		votesData,
		identityId = null,
		truncateUsername = true,
		showSimilarPost,
		description
	} = props;

	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { resolvedTheme: theme } = useTheme();

	let titleString = title || method || tipReason || noTitle;
	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = <span className={tipReason && 'tipTitle'}>{titleString}</span>;
	const subTitle = title && tipReason && method && <h5>{title}</h5>;
	const currentBlock = useCurrentBlock()?.toNumber() || 0;
	const ownProposal = currentUser?.addresses?.includes(address);
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	const [polkadotProposer, setPolkadotProposer] = useState<string>('');
	const content = description;

	const [showMore, setShowMore] = useState(false);

	const tokenDecimals = chainProperties[network]?.tokenDecimals;
	const confirmedStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Confirmed');
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const isProposalFailed = ['Rejected', 'TimedOut', 'Cancelled', 'Killed'].includes(status || '');
	const requestedAmountFormatted = requestedAmount ? new BN(requestedAmount).div(new BN(10).pow(new BN(tokenDecimals))).toString() : 0;

	const [decision, setDecision] = useState<IPeriod>();
	const [remainingTime, setRemainingTime] = useState<string>('');
	const decidingBlock = statusHistory?.filter((status) => status.status === 'Deciding')?.[0]?.block || 0;
	const convertRemainingTime = (preiodEndsAt: any) => {
		const diffMilliseconds = preiodEndsAt.diff();

		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if (!diffDays) {
			return `${diffHours}hrs : ${diffMinutes}mins `;
		}
		return `${diffDays}d  : ${diffHours}hrs : ${diffMinutes}mins `;
	};

	const getProposerFromPolkadot = async (identityId: string) => {
		if (!api || !apiReady) return;

		const didKeys = await api.query.identity.didKeys.keys(identityId);
		if (didKeys.length > 0) {
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	useEffect(() => {
		if (!window || trackNumber === null) return;
		let trackDetails = getQueryToTrack(router.pathname.split('/')[1], network);
		if (!trackDetails) {
			trackDetails = getTrackData(network, '', trackNumber);
		}
		if (!created_at || !trackDetails) return;

		const prepare = getPeriodData(network, dayjs(created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		setRemainingTime(convertRemainingTime(decision.periodEndsAt));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!identityId || address) return;

		(async () => {
			const proposer = await getProposerFromPolkadot(identityId);
			setPolkadotProposer(proposer as string);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	function formatTrackName(str: string) {
		return str
			.split('_') // Split the string into words using underscores as separators
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
			.join(' '); // Join the words back together with a space separator
	}

	return (
		<>
			<div
				className={`${className} ${
					ownProposal && 'border-l-4 border-l-pink_primary'
				} min-h-[120px] border-[#DCDFE350] transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-separatorDark xs:hidden sm:flex sm:p-3`}
			>
				<div className='w-full flex-1 flex-col sm:mt-2.5 sm:flex sm:justify-between'>
					<div className='flex items-center justify-between'>
						<div className='flex flex-grow'>
							<span className={`flex-none text-center font-medium text-bodyBlue dark:text-white ${showSimilarPost ? 'mt-[2px] w-[76px]' : 'sm:w-[120px]'}`}>
								#{isTip ? tip_index : onchainId}
							</span>
							<OnchainCreationLabel
								address={address || polkadotProposer}
								username={username}
								truncateUsername={truncateUsername}
							/>
						</div>
						<div className={' flex items-center justify-end'}>
							{status && (
								<StatusTag
									className='sm:mr-10'
									status={status}
									theme={theme}
								/>
							)}
						</div>
					</div>
					<div className='mt-1 flex items-center justify-between'>
						<div className={`${showSimilarPost ? 'ml-[76px]' : 'ml-[120px]'} flex flex-grow`}>
							<h1 className='mt-0.5 flex overflow-hidden text-sm text-bodyBlue dark:text-white lg:max-w-none'>
								<span className='break-all text-sm font-medium text-bodyBlue dark:text-white'>{mainTitle}</span>
							</h1>
							<h2 className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{subTitle}</h2>
						</div>
						{requestedAmount && (
							<div className='flex items-center justify-center'>
								{requestedAmount > 100 ? (
									<span className='whitespace-pre text-sm font-medium text-lightBlue dark:text-blue-dark-high sm:mr-[2.63rem]'>
										{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}
									</span>
								) : (
									<span className='whitespace-pre text-sm font-medium text-lightBlue dark:text-blue-dark-high sm:mr-[2.65rem]'>
										{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}
									</span>
								)}
							</div>
						)}
					</div>
					{showSimilarPost && content && (
						<div className={`${showSimilarPost ? 'ml-[76px]' : 'ml-[120px]'}`}>
							<h1 className='desc-container mr-12 mt-0.5 flex max-h-[94px] overflow-hidden text-sm text-bodyBlue dark:text-white'>
								<p className='m-0 p-0 text-sm font-normal text-lightBlue'>
									<Markdown
										className='post-content'
										md={content}
									/>
								</p>
							</h1>
							<p
								onClick={() => {
									setShowMore(!showMore);
								}}
								className='m-0 p-0 text-xs text-pink_primary'
							>
								See More
							</p>
							<h2 className='text-sm font-medium text-bodyBlue'>{subTitle}</h2>
						</div>
					)}
					<div
						className={`flex-col items-start text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:hidden sm:mb-1 ${
							showSimilarPost ? 'ml-[96px]' : 'sm:ml-[120px]'
						} sm:mt-0 sm:flex lg:flex-row lg:items-center`}
					>
						<div className={`${showSimilarPost ? '-ml-5' : ''} flex items-center gap-x-2 lg:h-[32px]`}>
							{postReactionCount && (
								<div className='items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
									<LikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
									<span className='text-lightBlue dark:text-blue-dark-medium'>{getFormattedLike(postReactionCount['👍'])}</span>
								</div>
							)}
							{postReactionCount && (
								<div className='mr-0.5 items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
									<DislikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
									<span className='text-lightBlue dark:text-blue-dark-medium'>{getFormattedLike(postReactionCount['👎'])}</span>
								</div>
							)}
							{isCommentsVisible && !showSimilarPost ? (
								<>
									<div className='items-center text-lightBlue dark:text-blue-dark-medium xs:hidden sm:flex'>
										<CommentsIcon className='mr-1 text-lightBlue dark:text-icon-dark-inactive' /> {commentsCount}
									</div>
									{!showSimilarPost && (
										<Divider
											type='vertical'
											className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-lg:hidden'
										/>
									)}
								</>
							) : null}
							{tags && tags.length > 0 && (
								<>
									{tags?.slice(0, 2).map((tag, index) => (
										<div
											key={index}
											className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-[14px] py-1 text-[10px] font-medium text-lightBlue dark:border-[#3B444F] dark:text-blue-dark-medium'
										>
											{tag}
										</div>
									))}
									{tags.length > 2 && (
										<span
											className='text-bodyBlue dark:text-blue-dark-high'
											style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												setTagsModal(true);
											}}
										>
											+{tags.length - 2}
										</span>
									)}
									<Divider
										type='vertical'
										className='border-l-1 border-lightBlue dark:border-icon-dark-inactive'
									/>
								</>
							)}
							{cid ? (
								<>
									<Link
										href={`https://ipfs.io/ipfs/${cid}`}
										target='_blank'
									>
										{' '}
										<PaperClipOutlined /> IPFS
									</Link>
									<Divider
										type='vertical'
										className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
									/>
								</>
							) : null}
							{relativeCreatedAt && (
								<>
									<div className='flex items-center text-lightBlue dark:text-icon-dark-inactive sm:mt-0'>
										<ClockCircleOutlined className='mr-1' /> <span className='whitespace-nowrap'>{relativeCreatedAt}</span>
									</div>
								</>
							)}
							{decision && decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
								<>
									<Divider
										type='vertical'
										className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
									/>
									<Tooltip
										overlayClassName='max-w-none'
										title={
											<div className={`p-1.5 ${poppins.className} ${poppins.variable} flex items-center whitespace-nowrap text-xs`}>{`Deciding ends in ${remainingTime} ${
												decidingBlock !== 0 ? `#${decidingBlock}` : ''
											}`}</div>
										}
										color='#575255'
									>
										<div className='mt-2 min-w-[30px]'>
											<Progress
												strokeWidth={5}
												percent={decision.periodPercent || 0}
												strokeColor='#407AFC'
												trailColor='#D4E0FC'
											/>
										</div>
									</Tooltip>
								</>
							)}
							{(votesData?.data || tally) && (
								<>
									<Divider
										type='vertical'
										className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
									/>
									<VotesProgressInListing
										index={index}
										proposalType={proposalType}
										votesData={votesData}
										onchainId={onchainId}
										status={status}
										tally={tally}
									/>
								</>
							)}
							{!isOpenGovSupported(network) && topic ? (
								<div className='flex items-center sm:-mt-1'>
									<Divider
										type='vertical'
										className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden sm:mt-1'
									/>
									<TopicTag
										theme={theme}
										className='sm:mx-1 sm:mt-0'
										topic={topic}
									/>
								</div>
							) : null}
							{showSimilarPost && isOpenGovSupported(network) ? (
								<>
									<Divider
										type='vertical'
										className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-sm:hidden'
									/>
									<p className='m-0 p-0 text-pink_primary'>{formatTrackName(getTrackNameFromId(network, trackNumber))}</p>
								</>
							) : null}
						</div>

						{!!end && !!currentBlock && (
							<div className='flex items-center text-lightBlue dark:text-icon-dark-inactive'>
								<Divider
									className='border-l-1 hidden border-lightBlue dark:border-icon-dark-inactive lg:inline-block'
									type='vertical'
								/>
								<ClockCircleOutlined className='mr-1' />
								{end > currentBlock ? (
									<span>
										<BlockCountdown endBlock={end} /> remaining
									</span>
								) : (
									<span>
										ended <BlockCountdown endBlock={end} />
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			<div
				className={`${className} ${
					ownProposal && 'border-l-4 border-l-pink_primary'
				} h-auto min-h-[147px] border-2 border-grey_light transition-all duration-200  hover:border-pink_primary hover:shadow-xl xs:flex xs:px-2 xs:py-2 sm:hidden md:pb-6`}
			>
				<div className='flex-1 flex-col xs:mt-1 xs:flex sm:hidden'>
					<div className='justify-between xs:flex sm:my-0 sm:hidden'>
						{topic && !isOpenGovSupported(network) && (
							<div>
								<TopicTag
									className='xs:mx-1'
									topic={topic}
									theme={theme}
								/>
							</div>
						)}
						{requestedAmount && (
							<div className='xs:mr-5 sm:m-0'>
								{requestedAmount > 100 ? (
									<span className='text-sm font-medium text-lightBlue dark:text-blue-dark-high'>
										{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}
									</span>
								) : (
									<span className='text-sm font-medium text-lightBlue dark:text-blue-dark-high'>
										{requestedAmount} {chainProperties[network]?.tokenSymbol}
									</span>
								)}
							</div>
						)}
						{showSimilarPost && isOpenGovSupported(network) && <p className='m-0 ml-1 mt-1 p-0 text-pink_primary'>{formatTrackName(getTrackNameFromId(network, trackNumber))}</p>}
					</div>
					<div className='items-center justify-between gap-x-2 xs:flex sm:hidden'>
						{spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0 ? (
							<div className='flex items-center justify-center'>
								<Tooltip
									color='#E5007A'
									title='This post could be a spam.'
								>
									<WarningMessageIcon className='text-xl text-[#FFA012]' />
								</Tooltip>
							</div>
						) : null}
					</div>
					<div className='max-xs-hidden mx-1 my-3 text-sm font-medium text-bodyBlue dark:text-white'>
						#{isTip ? tip_index : onchainId} {mainTitle} {subTitle}
					</div>

					<div className='flex-col gap-3 pl-1 text-xs font-medium text-bodyBlue dark:text-blue-dark-high xs:flex sm:hidden lg:flex-row lg:items-center'>
						<div className='h-[30px] flex-shrink-0 items-center xs:flex xs:justify-start sm:hidden'>
							<OnchainCreationLabel
								address={address}
								truncateUsername
								username={username}
							/>
							<Divider
								type='vertical'
								className='border-l-1 border-lightBlue dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
							/>
							{relativeCreatedAt && (
								<>
									<div className='mt-0 flex items-center text-lightBlue dark:text-icon-dark-inactive'>
										<ClockCircleOutlined className='mr-1' /> <span> {relativeCreatedAt}</span>
									</div>
								</>
							)}
							{decision && decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
								<div className='flex items-center'>
									<Divider
										type='vertical'
										className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
									/>
									<div className='mt-2 min-w-[30px]'>
										<Progress
											percent={decision.periodPercent || 0}
											strokeColor='#407AFC'
											trailColor='#D4E0FC'
											strokeWidth={5}
										/>
									</div>
								</div>
							)}
							{(votesData?.data || tally) && network !== 'polymesh' && (
								<div className='flex items-center'>
									<Divider
										type='vertical'
										className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-lg:hidden xs:mt-0.5 xs:inline-block'
									/>
									<div>
										<VotesProgressInListing
											index={index}
											proposalType={proposalType}
											votesData={votesData}
											onchainId={onchainId}
											status={status}
											tally={tally}
										/>
									</div>
								</div>
							)}
						</div>
						{showSimilarPost && content && (
							<div>
								<h1 className='desc-container mt-0.5 flex overflow-hidden text-sm text-bodyBlue'>
									<p className='m-0 max-h-[114px] break-all p-0 text-sm font-normal text-lightBlue'>
										<Markdown
											className='post-content'
											md={content}
										/>
									</p>
								</h1>
								<p
									onClick={() => {
										setTagsModal(true);
									}}
									className='m-0 p-0 text-xs text-pink_primary'
								>
									See More
								</p>
								<h2 className='text-sm font-medium text-bodyBlue'>{subTitle}</h2>
							</div>
						)}

						<div className='mb-1 items-center justify-between xs:flex xs:gap-x-2'>
							{status && (
								<StatusTag
									theme={theme}
									status={status}
								/>
							)}
							{tags && tags.length > 0 && (
								<div className='flex'>
									<Divider
										type='vertical'
										className='border-l-1 border-[#90A0B7] dark:border-icon-dark-inactive max-lg:hidden'
									/>
									<div className='mr-[2px] flex gap-1'>
										{tags?.slice(0, 2).map((tag, index) => (
											<div
												key={index}
												className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-[14px] py-1 text-[10px] font-medium text-lightBlue dark:border-[#3B444F] dark:text-blue-dark-medium'
											>
												{tag}
											</div>
										))}
										{tags.length > 2 && (
											<span
												className='text-bodyBlue dark:text-blue-dark-high'
												style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
												onClick={(e) => {
													e.stopPropagation();
													e.preventDefault();
													setTagsModal(true);
												}}
											>
												+{tags.length - 2}
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<TagsModal
				tags={tags}
				proposalType={proposalType}
				openTagsModal={tagsModal}
				setOpenTagsModal={setTagsModal}
			/>
		</>
	);
};

export default styled(GovernanceCard)`
	.ant-progress.ant-progress-circle .ant-progress-text {
		display: none;
	}
	.ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path {
		stroke: #ff3c5f;
	}
	.ant-progress-circle > circle:nth-child(3) {
		stroke: #2ed47a !important;
	}
	.ant-progress .ant-progress-text {
		display: none;
	}
	.ant-progress.ant-progress-show-info .ant-progress-outer {
		margin-inline-end: 0px;
		padding-inline-end: 0px;
	}
	.progress-rotate {
		transform: rotate(-87deg);
	}
`;
