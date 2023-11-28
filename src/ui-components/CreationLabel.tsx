// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, MenuProps, Modal, Tooltip } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { FC, ReactNode, useState } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { poppins } from 'pages/_app';
// import { network as AllNetworks } from '~src/global/networkConstants';

import NameLabel from './NameLabel';
import TopicTag from './TopicTag';
// import dayjs from 'dayjs';
import { getSentimentIcon, getSentimentTitle } from './CommentHistoryModal';
import { CloseIcon, WarningMessageIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';
import HelperTooltip from './HelperTooltip';
import styled from 'styled-components';
import { ESentiment, EVoteDecisionType, IBeneficiary } from '~src/types';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import AbstainGray from '~assets/icons/abstainGray.svg';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import BeneficiariesListing from './BeneficiariesListing';

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
		inPostHeading
	} = props;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [showVotesModal, setShowVotesModal] = useState(false);
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const getSentimentLabel = (sentiment: ESentiment) => {
		return <div className={`${poppins.variable} ${poppins.className} pl-1 pr-1 text-[10px] font-light leading-4 tracking-wide`}>{getSentimentTitle(sentiment)}</div>;
	};

	const items: MenuProps['items'] = [
		{
			key: 1,
			label: getSentimentLabel(sentiment as ESentiment) || null
		}
	];

	const AbstainDetailsComponent = ({ network, vote, power }: any) => {
		return (
			<>
				<div className={'abstain-amount-value ml-[64px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'}>
					{parseBalance((vote?.balance?.abstain || 0).toString(), 2, true, network)}
				</div>
				<div className={'abstain-conviction-value ml-[44px] mr-[50px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'}>-</div>
				<div className='abstain-power-value w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'>{power}</div>
			</>
		);
	};

	const AyeNyeDetailsComponent = ({ network, vote, power }: any) => {
		return (
			<>
				<div className={'amount-value ml-[95px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'}>
					{parseBalance((vote?.balance?.value || 0).toString(), 2, true, network)}
				</div>
				<div className={'conviction-value ml-10 mr-[55px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'}>{`${
					vote.lockPeriod === 0 ? '0.1' : vote.lockPeriod
				}x`}</div>
				<div className='power-value -mr-[60px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'>{power}</div>
			</>
		);
	};
	const SplitDetailsComponent = ({ network, vote, power }: any) => {
		return (
			<>
				<div className={'amount-value ml-[86px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'}>
					{parseBalance((vote?.decision === 'abstain' ? vote?.balance?.abstain || 0 : vote?.balance?.value || 0).toString(), 2, true, network)}
				</div>
				{vote?.decision === 'abstain' && (
					<div className={'conviction-value ml-10 mr-[58px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'}> - </div>
				)}
				<div className='power-value -mr-[60px] w-[92px] overflow-ellipsis text-center text-bodyBlue dark:text-blue-dark-high'>{power}</div>
			</>
		);
	};

	const renderVoteContent = (vote: any, network: any, idx: number) => {
		const lockPeriod = vote.lockPeriod === 0 || vote?.decision === 'abstain' ? 0.1 : vote.lockPeriod;
		const value = vote?.decision === 'abstain' ? BigInt(vote?.balance?.abstain || 0) : BigInt(vote?.balance?.value || 0);
		const powerValue = lockPeriod === 0.1 ? value / BigInt(10) : value * BigInt(lockPeriod);
		const power = parseBalance(powerValue.toString(), 2, true, network);

		return (
			<div
				key={idx}
				className='modal-inner-content mb-2 flex items-center'
			>
				{vote.decision == 'yes' ? (
					<div className='mb-[-1px] justify-between '>
						<div className='flex'>
							<LikeFilled className='relative -top-[4px] text-[green]' /> <span className='relative -top-[2px] ml-1 font-medium capitalize text-[green]'>Aye</span>
							<AyeNyeDetailsComponent
								network={network}
								vote={vote}
								power={power}
							/>
						</div>
					</div>
				) : vote.decision == 'no' ? (
					<div className='w-[90%] justify-between'>
						<div className='mb-[-1px] flex'>
							<DislikeFilled className='relative -top-[4px] text-[red]' /> <span className='relative -top-[2px] mb-[5px] ml-1 font-medium capitalize text-[red]'>Nay</span>
							<AyeNyeDetailsComponent
								network={network}
								vote={vote}
								power={power}
							/>
						</div>
					</div>
				) : vote.decision == 'abstain' && !(vote.balance as any).abstain ? (
					<div className='mb-[-1px] flex w-[90%] justify-between '>
						<div className='mb-[-1px]  flex'>
							<SplitYellow className='mr-1 mt-[2px]' /> <span className='ml-1 font-medium capitalize text-[#FECA7E]'>Split</span>
							<SplitDetailsComponent
								network={network}
								vote={vote}
								power={power}
							/>
						</div>
					</div>
				) : vote.decision == 'abstain' && (vote.balance as any).abstain ? (
					<div className=' align-center mb-[1px] flex w-[90%] justify-between'>
						<div className='flex justify-center align-middle'>
							<AbstainGray className='mr-1' /> <span className='font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>Abstain</span>
							<AbstainDetailsComponent
								network={network}
								vote={vote}
								power={power}
							/>
						</div>
					</div>
				) : null}
			</div>
		);
	};

	return (
		<div className={`${className} flex w-[100%] justify-between bg-none`}>
			<div className={`flex text-xs ${isRow ? 'flex-row' : 'flex-col'} flex-wrap gap-y-3 max-sm:flex-wrap max-sm:gap-1 md:flex-row md:items-center`}>
				<div className={'-mr-[6px] flex w-full items-center max-md:flex-wrap min-[320px]:w-auto min-[320px]:flex-row'}>
					<div className={'flex max-w-full flex-shrink-0 flex-wrap items-center'}>
						{inPostHeading && <span className='mr-1 text-xs text-blue-light-medium dark:text-blue-dark-medium'>Proposer:</span>}
						<NameLabel
							defaultAddress={defaultAddress}
							username={username}
							disableAddressClick={commentSource !== 'polkassembly'}
							truncateUsername={truncateUsername}
							usernameClassName='text-xs text-ellipsis overflow-hidden'
						/>
						{text}&nbsp;
						{topic && (
							<div className='flex items-center sm:-mt-0.5'>
								<span className='mr-2 mt-0.5 text-lightBlue dark:text-blue-dark-medium'>in</span>{' '}
								<TopicTag
									topic={topic}
									className={topic}
									theme={theme}
								/>
							</div>
						)}
						{beneficiaries && beneficiaries?.length > 0 && (
							<>
								<Divider
									className={`md:inline-block ${!isRow ? 'hidden' : 'inline-block'} border-lightBlue dark:border-icon-dark-inactive max-sm:hidden`}
									type='vertical'
								/>
								<BeneficiariesListing
									beneficiaries={beneficiaries}
									inPostHeading={inPostHeading}
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
									<PaperClipOutlined /> IPFS
								</Link>
							</>
						) : null}
					</div>
				</div>
				<div className='flex items-center text-lightBlue dark:text-blue-dark-medium max-xs:ml-1'>
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
					{created_at && (
						<span className={`${inPostHeading ? '' : 'mr-1'} flex items-center md:pl-0 ${isRow ? 'mt-0' : 'xs:mt-2 md:mt-0 md:pl-0'}`}>
							<ClockCircleOutlined className='ml-1 mr-1' />
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
									<LikeFilled className='text-[green]' /> <span className='ont-medium capitalize text-[green]'>Voted {vote}</span>
								</p>
							) : vote === EVoteDecisionType.NAY ? (
								<div>
									<DislikeFilled className='text-[red]' /> <span className='mb-[5px] font-medium capitalize text-[red]'>Voted {vote}</span>
								</div>
							) : vote === EVoteDecisionType.SPLIT ? (
								<div className='align-center mb-[-1px] flex justify-center'>
									<SplitYellow className='mr-1' /> <span className='font-medium capitalize text-[#FECA7E]'>Voted {vote}</span>
								</div>
							) : vote === EVoteDecisionType.ABSTAIN ? (
								<div className='align-center mb-[1px] flex justify-center'>
									<AbstainGray className='mr-1' /> <span className='ont-medium capitalize text-bodyBlue dark:text-blue-dark-high'>Voted {vote}</span>
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
									<LikeFilled className='text-[green]' /> <span className='font-medium capitalize text-[green]'>Voted Aye</span>
								</p>
							) : votesArr[0].decision == 'no' ? (
								<div className='nye-voted-icon voted-icon'>
									<DislikeFilled className='text-[red]' /> <span className='mb-[5px] font-medium capitalize text-[red]'>Voted Nay</span>
								</div>
							) : votesArr[0].decision == 'abstain' && !(votesArr[0].balance as any).abstain ? (
								<div className='split-voted-icon voted-icon align-center mb-[-1px] flex justify-center'>
									<SplitYellow className='mr-1' /> <span className='font-medium capitalize text-[#FECA7E]'>Voted Split</span>
								</div>
							) : votesArr[0].decision == 'abstain' && (votesArr[0].balance as any).abstain ? (
								<div className='abstain-voted-icon voted-icon align-center mb-[1px] flex justify-center'>
									<AbstainGray className='mb-[-1px] mr-1' /> <span className='mt-[2px] font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>Voted Abstain</span>
								</div>
							) : null}
							{/* { votesArr.length > 1 && <p title={`${votesArr.length-1}+ votes available`}  className='mb-[-1px] ml-1' >{votesArr.length-1}+</p>} */}
							<Modal
								open={showVotesModal}
								onCancel={() => setShowVotesModal(false)}
								footer={false}
								className={`${poppins.variable} ${poppins.className} max-h-[675px] rounded-[6px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
								closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
								wrapClassName={`${className} dark:bg-modalOverlayDark`}
								title={
									<div className='-mt-5 ml-[-24px] mr-[-24px] flex h-[65px] items-center gap-2 rounded-t-[6px] border-0 border-b-[1.5px] border-solid border-[#D2D8E0] dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
										<span className='ml-4 text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Votes</span>
									</div>
								}
							>
								<div className='modal-content'>
									<div className='modal-container mt-3 flex text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>
										<p className='m-0 p-0'>Vote</p>
										<p className='amount-container m-0 ml-[124px] p-0'>Amount</p>
										<p className='conviction-container relative m-0 ml-[64px] p-0'>Conviction</p>
										<p className='m-0 ml-auto p-0'>Voting Power</p>
									</div>
									<div className='border-container my-3 -ml-6 w-[560px]  border-0 border-b-[1px] border-solid border-[#D2D8E0] dark:border-[#3B444F]'></div>
									{votesArr.length > 0 &&
										votesArr.slice(0, 1).map((vote: any, idx: any) => {
											return renderVoteContent(vote, network, idx);
										})}
									<div>
										{votesArr.length > 1 && (
											<div className='vote-history-container'>
												<div className='-ml-6 mb-2 w-[560px] border-0 border-b-[1px] border-dashed border-[#D2D8E0] dark:border-[#3B444F]'></div>
												<p className='m-0 mb-2 p-0 text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>Vote History</p>
											</div>
										)}
										{votesArr.length > 1 &&
											votesArr.slice(1).map((vote: any, idx: any) => {
												return renderVoteContent(vote, network, idx);
											})}
									</div>
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
									This comment is imported from <span className='dark-pink'>Subsqaure</span>
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
`;
