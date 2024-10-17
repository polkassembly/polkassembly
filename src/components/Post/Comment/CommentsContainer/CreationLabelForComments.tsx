// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, Modal, Dropdown } from 'antd';
import React, { FC, useState } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { poppins } from 'pages/_app';
import { CloseIcon, WarningMessageIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';
import { ESentiment, EVoteDecisionType } from '~src/types';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import AbstainGray from '~assets/icons/abstainGray.svg';
import { useTheme } from 'next-themes';
import VoteList from '~src/components/Post/GovernanceSideBar/Modal/VoteData/VoteList';
import Tooltip from '~src/basic-components/Tooltip';
import NameLabel from '~src/ui-components/NameLabel';
import { getSentimentIcon, getSentimentTitle } from '~src/ui-components/CommentHistoryModal';
import { usePostDataContext } from '~src/context';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';

interface ICreationLabelProps {
	className?: string;
	created_at?: Date;
	defaultAddress?: string | null;
	voterAddress?: string | null;
	username?: string;
	sentiment?: number;
	commentSource?: 'polkassembly' | 'subsquare';
	spam_users_count?: number;
	vote?: string | null;
	votesArr?: any;
	isRow?: boolean;
	children?: React.ReactNode;
}

const CreationLabelForComments: FC<ICreationLabelProps> = (props) => {
	const {
		className,
		created_at,
		defaultAddress,
		voterAddress,
		username,
		sentiment,
		commentSource = 'polkassembly',
		spam_users_count = 0,
		vote,
		votesArr = [],
		isRow = true,
		children
	} = props;
	const { postData } = usePostDataContext();
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [showVotesModal, setShowVotesModal] = useState(false);
	const { resolvedTheme: theme } = useTheme();
	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};
	const getSentimentLabel = (sentiment: ESentiment) => {
		return <div className={`${poppins.variable} ${poppins.className} pl-1 pr-1 text-[10px] font-light leading-4 tracking-wide`}>{getSentimentTitle(sentiment)}</div>;
	};

	const items = [
		{
			key: 'sentiment',
			label: getSentimentLabel(sentiment as ESentiment) || null
		}
	];

	return (
		<div className={`${className} flex w-[100%] justify-between gap-1 bg-none sm:gap-3`}>
			<div className={`flex text-xs ${isRow ? 'flex-row' : 'flex-col'} gap-1 max-sm:gap-1 md:flex-row md:items-center`}>
				<NameLabel
					defaultAddress={defaultAddress}
					username={username}
					disableAddressClick={commentSource !== 'polkassembly'}
					usernameClassName='text-xs text-ellipsis overflow-hidden'
				/>
				<div className={' flex items-center text-lightBlue dark:text-blue-dark-medium max-md:pt-1 max-xs:ml-1'}>
					{vote && (
						<div className='flex items-center justify-center'>
							{vote === EVoteDecisionType.AYE ? (
								<p className='mb-[-1px]'>
									<LikeFilled className='text-[green]' /> <span className='font-medium capitalize text-[green]'>Voted {vote}</span>
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
									<AbstainGray className='mr-1' /> <span className='font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>Voted {vote}</span>
								</div>
							) : null}
						</div>
					)}

					{/* showing vote from subsquid */}
					{votesArr.length > 0 ? (
						<div
							className={votesArr.length >= 1 ? ' flex items-center justify-center hover:cursor-pointer' : 'ml-1 flex items-center justify-center'}
							onClick={() => {
								if (votesArr.length >= 1) setShowVotesModal(!showVotesModal);
							}}
						>
							<span className={`${poppins.variable} ${poppins.className} mr-[6px] text-xs text-blue-light-high dark:text-blue-dark-high`}>voted</span>
							{votesArr[0].decision == 'yes' ? (
								<p className='mb-[-0.1px]'>
									<LikeFilled className='text-[green]' /> <span className='font-medium capitalize text-[green]'> Aye</span>
								</p>
							) : votesArr[0].decision == 'no' ? (
								<p className='mb-[-1px]'>
									<DislikeFilled className='text-[red]' /> <span className='mb-[2px] font-medium capitalize text-[red]'> Nay</span>
								</p>
							) : votesArr[0].decision == 'abstain' && !(votesArr[0].balance as any).abstain ? (
								<p className='mb-[-1px]'>
									<SplitYellow className='mr-1' /> <span className='font-medium capitalize text-[#FECA7E]'> Split</span>
								</p>
							) : votesArr[0].decision == 'abstain' && (votesArr[0].balance as any).abstain ? (
								<p className='mb-[-1px]'>
									<AbstainGray className='mb-[-1px] mr-1' /> <span className='font-medium capitalize text-bodyBlue dark:text-blue-dark-high'> Abstain</span>
								</p>
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
										<span className='ml-6 text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Votes</span>
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
				{relativeCreatedAt && (
					<div className={`${poppins.variable} ${poppins.className} flex items-center`}>
						<Divider
							className='ml-1 mr-2 mt-[2px] hidden border-lightBlue dark:border-blue-dark-medium  md:inline-block'
							type='vertical'
						/>
						<span className={`flex items-center max-[450px]:text-[9px] text-blue-light-medium dark:text-blue-dark-medium md:pl-0 ${isRow ? 'mt-0' : 'xs:mt-2 md:mt-0 md:pl-0'}`}>
							<ClockCircleOutlined className={'mr-1'} />
							{relativeCreatedAt}
						</span>
					</div>
				)}
				{children && (
					<div className='flex items-center'>
						<Divider
							className='ml-[2px] mt-[2px] hidden border-lightBlue dark:border-blue-dark-medium  md:inline-block'
							type='vertical'
						/>
						{children}
					</div>
				)}
			</div>

			<div className='flex'>
				<Dropdown
					overlayClassName='sentiment-hover'
					placement='topCenter'
					menu={{ items }}
					className='z-[1056] flex items-center justify-center text-lg text-white min-[320px]:mr-2'
				>
					<div>{getSentimentIcon(sentiment as ESentiment, theme || '')}</div>
				</Dropdown>

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
			</div>
		</div>
	);
};

export default CreationLabelForComments;
