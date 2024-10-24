// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, MenuProps, Modal } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { FC, ReactNode, useState } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { poppins } from 'pages/_app';
import NameLabel from './NameLabel';
import TopicTag from './TopicTag';
import { getSentimentIcon, getSentimentTitle } from './CommentHistoryModal';
import { CloseIcon, WarningMessageIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';
import HelperTooltip from './HelperTooltip';
import styled from 'styled-components';
import { ESentiment, EVoteDecisionType, IBeneficiary } from '~src/types';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import AbstainGray from '~assets/icons/abstainGray.svg';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import { useTheme } from 'next-themes';
import { usePostDataContext } from '~src/context';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import VoteList from '~src/components/Post/GovernanceSideBar/Modal/VoteData/VoteList';
import BeneficiariesListing from './BeneficiariesListing';
import Tooltip from '~src/basic-components/Tooltip';
import { useTranslation } from 'react-i18next';

const Styled = styled.div`
	padding: 0;
	margin: 0;
	margin-top: -2px;
	margin-right: 8px;
	& svg {
		width: 14.6px;
		height: 14.6px;
	}
	&:hover {
		color: #e5007a;
	}
	.ant-tooltip {
		font-size: 16px;
	}
	.ant-tooltip .ant-tooltip-placement-leftTop {
		height: 10px;
		padding: 0px;
	}
	.ant-tooltip .ant-tooltip-inner {
		min-height: 0;
	}
	.ant-tooltip-arrow {
		display: none;
	}
	.ant-tooltip-inner {
		color: black;
		font-size: 10px;
		padding: 0px 6px;
	}

	.dark-pink {
		color: #e5007a;
		text-decoration: underline;
	}
`;
interface ICreationLabelProps {
	className?: string;
	children?: ReactNode;
	created_at?: Date;
	defaultAddress?: string | null;
	voterAddress?: string | null;
	text?: string;
	topic?: string;
	username?: string;
	sentiment?: number;
	commentSource?: 'polkassembly' | 'subsquare';
	cid?: string;
	spam_users_count?: number;
	truncateUsername?: boolean;
	vote?: string | null;
	votesArr?: any;
	isRow?: boolean;
	voteData?: any;
	beneficiaries?: IBeneficiary[];
	inPostHeading?: boolean;
	assetId?: null | string;
}

const CreationLabel: FC<ICreationLabelProps> = (props) => {
	const {
		beneficiaries,
		className,
		children,
		created_at,
		text,
		username,
		defaultAddress,
		topic,
		sentiment,
		commentSource = 'polkassembly',
		cid,
		spam_users_count = 0,
		truncateUsername,
		vote,
		votesArr = [],
		isRow,
		voterAddress,
		inPostHeading,
		assetId
	} = props;
	const { t } = useTranslation('common');
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [showVotesModal, setShowVotesModal] = useState(false);
	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};
	const { resolvedTheme: theme } = useTheme();
	const { postData } = usePostDataContext();
	const getSentimentLabel = (sentiment: ESentiment) => {
		return <div className={`${poppins.variable} ${poppins.className} pl-1 pr-1 text-[10px] font-light leading-4 tracking-wide`}>{getSentimentTitle(sentiment)}</div>;
	};

	const items: MenuProps['items'] = [
		{
			key: 1,
			label: getSentimentLabel(sentiment as ESentiment) || null
		}
	];

	return (
		<div className={`${className} flex w-[100%] justify-between gap-1 bg-none sm:gap-3`}>
			<div
				className={`text-xs ${inPostHeading ? '' : 'flex'} ${isRow ? 'flex-row' : 'flex-col'} ${
					inPostHeading && !beneficiaries?.length ? 'flex' : ''
				} gap-y-3 max-sm:gap-1 md:flex-row md:items-center`}
			>
				<div className={'-mr-[6px] flex w-full items-center max-md:flex-wrap min-[320px]:w-auto min-[320px]:flex-row'}>
					<div className={'flex max-w-full flex-shrink-0 flex-wrap items-center'}>
						{inPostHeading && <span className='mr-2 text-xs text-blue-light-medium dark:text-blue-dark-medium'>{t('proposer')}</span>}
						<NameLabel
							defaultAddress={defaultAddress}
							username={username}
							disableAddressClick={commentSource !== 'polkassembly'}
							truncateUsername={truncateUsername}
							usernameClassName='text-xs text-ellipsis overflow-hidden'
						/>
						{text}&nbsp;
						{topic && (
							<div className='topic-container ml-1 flex items-center'>
								<span className='mr-2 text-lightBlue dark:text-blue-dark-medium'>{t('in')}</span>{' '}
								<TopicTag
									topic={topic}
									className={topic}
									theme={theme as any}
								/>
							</div>
						)}
						{beneficiaries && beneficiaries?.length > 0 && (
							<>
								<Divider
									className={`md:inline-block ${!isRow ? 'hidden' : 'inline-block'} ${inPostHeading ? 'mr-3' : ''} border-lightBlue dark:border-icon-dark-inactive max-sm:hidden`}
									type='vertical'
								/>
								<BeneficiariesListing
									beneficiaries={beneficiaries}
									inPostHeading={inPostHeading}
									assetId={assetId}
								/>
							</>
						)}
						{cid ? (
							<>
								<Divider
									type='vertical'
									className='border-l-1 border-lightBlue dark:border-icon-dark-inactive md:inline-block'
								/>
								<Link
									href={`https://ipfs.io/ipfs/${cid}`}
									target='_blank'
								>
									<PaperClipOutlined /> {t('IPFS')}
								</Link>
							</>
						) : null}
					</div>
				</div>
				<div
					className={`details-container ${
						inPostHeading && beneficiaries && beneficiaries?.length > 0 ? 'mt-2' : ''
					} flex items-center text-lightBlue dark:text-blue-dark-medium max-md:pt-1 max-xs:ml-1`}
				>
					{!inPostHeading && (
						<div>
							{(topic || text || created_at) && (
								<>
									&nbsp;
									<Divider
										className={`md:inline-block ${!isRow ? 'hidden' : 'inline-block'} border-lightBlue dark:border-icon-dark-inactive max-sm:hidden`}
										type='vertical'
									/>
								</>
							)}
						</div>
					)}
					{inPostHeading && !beneficiaries?.length && (
						<Divider
							className='ml-3 hidden xs:mt-2 md:mt-0 md:inline-block'
							type='vertical'
							style={{ borderLeft: '1px solid #485F7D' }}
						/>
					)}
					{created_at && (
						<span className={`${inPostHeading ? '' : 'sm:mr-1'} flex items-center max-[450px]:text-[9px] md:pl-0 ${isRow ? 'mt-0' : 'xs:mt-2 md:mt-0 md:pl-0'}`}>
							<ClockCircleOutlined className={`${inPostHeading ? '' : 'ml-1'} mr-1`} />
							{relativeCreatedAt}
						</span>
					)}
					{children}
					{/* showing vote from local state */}
					{vote && (
						<div className='flex items-center justify-center'>
							<Divider
								className='mb-[-1px] ml-1 hidden border-lightBlue dark:border-icon-dark-inactive md:inline-block'
								type='vertical'
							/>
							{vote === EVoteDecisionType.AYE ? (
								<p className='mb-[-1px]'>
									<LikeFilled className='text-[green]' />{' '}
									<span className='font-medium capitalize text-[green]'>
										{t('voted')} {vote}
									</span>
								</p>
							) : vote === EVoteDecisionType.NAY ? (
								<div>
									<DislikeFilled className='text-[red]' />{' '}
									<span className='mb-[5px] font-medium capitalize text-[red]'>
										{t('voted')} {vote}
									</span>
								</div>
							) : vote === EVoteDecisionType.SPLIT ? (
								<div className='align-center mb-[-1px] flex justify-center'>
									<SplitYellow className='mr-1' />{' '}
									<span className='font-medium capitalize text-[#FECA7E]'>
										{t('voted')} {vote}
									</span>
								</div>
							) : vote === EVoteDecisionType.ABSTAIN ? (
								<div className='align-center mb-[1px] flex justify-center'>
									<AbstainGray className='mr-1' />{' '}
									<span className='font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>
										{t('voted')} {vote}
									</span>
								</div>
							) : null}
						</div>
					)}

					{/* showing vote from subsquid */}
					{votesArr.length > 0 ? (
						<div
							className={votesArr.length >= 1 ? 'ml-1 flex items-center justify-center hover:cursor-pointer' : 'ml-1 flex items-center justify-center'}
							onClick={() => {
								if (votesArr.length >= 1) setShowVotesModal(!showVotesModal);
							}}
						>
							<Divider
								className='mb-[-1px] ml-1 mr-3 hidden border-lightBlue dark:border-icon-dark-inactive md:inline-block'
								type='vertical'
							/>
							{votesArr[0].decision == 'yes' ? (
								<p className='aye-voted-icon voted-icon mb-[-1px]'>
									<LikeFilled className='text-[green]' /> <span className='font-medium capitalize text-[green]'>{t('voted_aye')}</span>
								</p>
							) : votesArr[0].decision == 'no' ? (
								<div className='nye-voted-icon voted-icon'>
									<DislikeFilled className='text-[red]' /> <span className='mb-[5px] font-medium capitalize text-[red]'>{t('voted_nay')}</span>
								</div>
							) : votesArr[0].decision == 'abstain' && !(votesArr[0].balance as any).abstain ? (
								<div className='split-voted-icon voted-icon align-center mb-[-1px] flex justify-center'>
									<SplitYellow className='mr-1' /> <span className='font-medium capitalize text-[#FECA7E]'>{t('voted_split')}</span>
								</div>
							) : votesArr[0].decision == 'abstain' && (votesArr[0].balance as any).abstain ? (
								<div className='abstain-voted-icon voted-icon align-center mb-[1px] flex justify-center'>
									<AbstainGray className='mb-[-1px] mr-1' /> <span className='mt-[2px] font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>{t('voted_abstain')}</span>
								</div>
							) : null}
							{/* { votesArr.length > 1 && <p title={`${votesArr.length-1}+ votes available`}  className='mb-[-1px] ml-1' >{votesArr.length-1}+</p>} */}
							<Modal
								open={showVotesModal}
								onCancel={() => setShowVotesModal(false)}
								footer={false}
								className={`${poppins.variable} ${poppins.className} max-h-[675px] w-[595px] rounded-sm max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
								closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
								wrapClassName='dark:bg-modalOverlayDark'
								title={
									<div className='-ml-6 -mr-6 -mt-5 flex h-[65px] items-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-section-light-container dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
										<span className='ml-6 text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>{t('votes')}</span>
									</div>
								}
							>
								<div onClick={handleContentClick}>
									<VoteList
										referendumId={postData?.postIndex as number}
										isUsedInVotedModal={true}
										voterAddress={voterAddress}
										voteType={getVotingTypeFromProposalType(postData?.postType)}
									/>
								</div>
							</Modal>
						</div>
					) : null}
				</div>
			</div>
			<div className='flex'>
				{spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0 ? (
					<div className='mr-2 flex items-center'>
						<Tooltip
							color='#E5007A'
							title={`This comment has been reported as spam by ${spam_users_count} members`}
						>
							<WarningMessageIcon className='scale-75 text-xl text-[#FFA012]' />
						</Tooltip>
					</div>
				) : null}
				{votesArr.length > 0 ? (
					<div
						className={votesArr.length >= 1 ? 'ml-1 flex items-center justify-center hover:cursor-pointer' : 'ml-1 flex items-center justify-center'}
						onClick={() => {
							if (votesArr.length >= 1) setShowVotesModal(!showVotesModal);
						}}
					>
						{votesArr[0].decision == 'yes' ? (
							<LikeFilled className='aye-voted-icon sentiment-vote-icon mb-[-1px] hidden text-[green]' />
						) : votesArr[0].decision == 'no' ? (
							<DislikeFilled className='nye-voted-icon sentiment-vote-icon hidden text-[red]' />
						) : votesArr[0].decision == 'abstain' && !(votesArr[0].balance as any).abstain ? (
							<SplitYellow className='split-voted-icon sentiment-vote-icon align-center mb-[-1px] mr-1 hidden justify-center' />
						) : votesArr[0].decision == 'abstain' && (votesArr[0].balance as any).abstain ? (
							<AbstainGray className='abstain-voted-icon sentiment-vote-icon align-center mr-1 hidden justify-center' />
						) : null}
					</div>
				) : null}
				<Dropdown
					theme={theme}
					overlayClassName='sentiment-hover'
					placement='topCenter'
					menu={{ items }}
					className='z-[1056] flex  items-center justify-center text-lg  text-white min-[320px]:mr-2'
				>
					<div>{getSentimentIcon(sentiment as ESentiment, theme || '')}</div>
				</Dropdown>
				{commentSource === 'subsquare' && (
					<Styled>
						<HelperTooltip
							text={
								<span className='dark:text-blue-dark-high'>
									{t('this_comment_is_imported_from')} <span className='dark-pink'>{t('subsquare')}</span>
								</span>
							}
							placement={'leftTop'}
							bgColor='#FCE5F2'
						/>
					</Styled>
				)}
			</div>
		</div>
	);
};

export default styled(CreationLabel)`
	@media (min-width: 468px) and (max-width: 389px) {
		.amount-container {
			left: 58px !important;
		}

		.conviction-container {
			left: 68px !important;
		}

		.amount-value {
			left: 55px !important;
		}

		.conviction-value {
			left: 100px !important;
		}

		.power-value {
			left: 178px !important;
		}
	}

	@media (max-width: 468px) and (min-width: 319px) {
		.topic-container {
			margin-top: 2px;
		}
	}

	@media (max-width: 768px) and (min-width: 319px) {
		.details-container {
			margin-top: -4px !important;
		}
	}
`;
