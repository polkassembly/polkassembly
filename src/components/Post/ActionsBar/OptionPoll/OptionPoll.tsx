// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Divider, Progress, Spin } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import HelperTooltip from 'src/ui-components/HelperTooltip';

import { MessageType } from '~src/auth/types';
import { usePostDataContext, useUserDetailsContext } from '~src/context';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import { IOptionPollVote } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IOptionPollProps {
	className?: string;
	optionPollId: string;
	question: string;
	options: string[];
	endAt?: number | null | undefined;
	canEdit: boolean;
	votes: IOptionPollVote[];
	proposalType: ProposalType;
}

const OptionPoll: FC<IOptionPollProps> = ({ className, optionPollId, question, options, endAt, votes, proposalType }) => {
	const {
		postData: { postIndex },
		setPostData
	} = usePostDataContext();
	const [addPollVoteErr, setAddPollVoteErr] = useState('');
	const [deletePollVoteErr, setDeletePollVoteErr] = useState('');
	const [loading, setLoading] = useState<boolean>(false);
	const { id } = useUserDetailsContext();
	const [totalVotes, setTotalVotes] = useState(0);

	const [optionMap, setOptionMap] = useState<any>({});

	useEffect(() => {
		const optionMap: any = {};
		let totalVotes = 0;
		votes?.forEach(({ option }) => {
			optionMap[option] = (optionMap[option] || 0) + 1;
			totalVotes++;
		});
		setOptionMap(optionMap);
		setTotalVotes(totalVotes);
	}, [votes]);

	const castVote = useCallback(
		async (option: string) => {
			if (!id) return;

			setLoading(true);
			const { error: deleteVoteErr, data: votesAfterDelete } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deletePollVote', {
				pollId: optionPollId,
				pollType: POLL_TYPE.OPTION,
				postId: postIndex,
				proposalType,
				userId: id
			});

			if (deleteVoteErr) {
				setDeletePollVoteErr(deleteVoteErr);
			} else {
				if (votesAfterDelete && votesAfterDelete.message) {
					setPostData((prev) => {
						return {
							...prev,
							optionPolls:
								prev?.optionPolls?.map((optionPoll) => {
									if (optionPoll.id === optionPollId) {
										optionPoll.option_poll_votes = optionPoll?.option_poll_votes?.filter((optionPollVote) => optionPollVote.user_id !== id) || [];
									}
									return {
										...optionPoll
									};
								}) || []
						};
					});
				}
			}

			const { error: addVoteErr, data: votesAfterAdd } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/addPollVote', {
				option,
				pollId: optionPollId,
				pollType: POLL_TYPE.OPTION,
				postId: postIndex,
				proposalType,
				userId: id
			});

			if (addVoteErr) {
				setAddPollVoteErr(addVoteErr);
			} else {
				if (votesAfterAdd && votesAfterAdd.message) {
					setPostData((prev) => {
						return {
							...prev,
							optionPolls:
								prev?.optionPolls?.map((optionPoll) => {
									if (optionPoll.id === optionPollId) {
										const date = new Date();
										optionPoll.option_poll_votes = [
											...optionPoll.option_poll_votes,
											{
												created_at: date,
												option,
												updated_at: date,
												user_id: id
											}
										];
									}
									return {
										...optionPoll
									};
								}) || []
						};
					});
				}
			}

			setLoading(false);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[id, optionPollId, postIndex, proposalType]
	);

	if (addPollVoteErr && deletePollVoteErr) {
		console.error(deletePollVoteErr, addPollVoteErr);
		return null;
	}
	return (
		<GovSidebarCard className={className}>
<<<<<<< HEAD
			<div className="flex items-center mb-6">
				<h3 className='dashboard-heading mb-0 dark:text-blue-dark-high'><span className='text-navBlue dark:text-blue-dark-medium mr-1'>Poll:</span>{question}?</h3>
				<HelperTooltip className='ml-2' text={id ? 'Click on option to vote' : 'Please login to vote'} />
=======
			<div className='mb-6 flex items-center'>
				<h3 className='dashboard-heading mb-0'>
					<span className='mr-1 text-navBlue'>Poll:</span>
					{question}?
				</h3>
				<HelperTooltip
					className='ml-2'
					text={id ? 'Click on option to vote' : 'Please login to vote'}
				/>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			</div>

			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				{options.map((option) => (
					<div
						key={option}
						className={`${id && 'cursor-pointer'} mb-4`}
						onClick={() => castVote(option)}
					>
						<div>{option}</div>
						<Progress
							type='line'
							strokeWidth={11}
							percent={totalVotes && Math.round(((optionMap[option] || 0) * 100) / totalVotes)}
							format={(percent) => <div> {percent} % </div>}
						/>
					</div>
				))}
			</Spin>

<<<<<<< HEAD
			<div className='mt-6 text-right text-sidebarBlue dark:text-blue-dark-medium font-medium'>
				<span>{totalVotes} {totalVotes > 1 ? 'votes' : 'vote'}</span>
=======
			<div className='mt-6 text-right font-medium text-sidebarBlue'>
				<span>
					{totalVotes} {totalVotes > 1 ? 'votes' : 'vote'}
				</span>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

				{endAt && Math.round(Date.now() / 1000) > endAt && (
					<>
						<Divider
							className='mx-2'
							type='vertical'
							style={{ borderLeft: '1px solid #90A0B7' }}
						/>
						<span>Poll Ended</span>
					</>
				)}
			</div>
		</GovSidebarCard>
	);
};

export default OptionPoll;
