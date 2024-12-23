// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import BlockCountdown from 'src/components/BlockCountdown';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import usePollEndBlock from 'src/hooks/usePollEndBlock';
import { IPollVote, Vote } from 'src/types';
import AyeNayButtons from 'src/ui-components/AyeNayButtons';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import styled from 'styled-components';
import { MessageType } from '~src/auth/types';
import { usePostDataContext } from '~src/context';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';
import { InfoIcon } from '~src/ui-components/CustomIcons';

interface IGeneralSignalsProps {
	className?: string;
	endBlock: number;
	pollId: string;
	canEdit: boolean;
	proposalType: ProposalType;
	votes: IPollVote[];
}

const GeneralSignals: FC<IGeneralSignalsProps> = ({ className, endBlock, pollId, canEdit, proposalType, votes }) => {
	const { id } = useUserDetailsSelector();
	const [error, setErr] = useState('');
	const [loading, setLoading] = useState(false);
	const [ayes, setAyes] = useState(0);
	const [nays, setNays] = useState(0);
	const [ownVote, setOwnVote] = useState<Vote | null>(null);
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		let ayes = 0;
		let nays = 0;
		let ownVote: Vote | null = null;

		votes?.forEach(({ vote, user_id }) => {
			if (user_id === id) ownVote = vote.toUpperCase() as Vote;
			if (vote === Vote.AYE) ayes++;
			if (vote === Vote.NAY) nays++;
		});
		setAyes(ayes);
		setNays(nays);
		setOwnVote(ownVote);
	}, [votes, id]);

	const currentBlockNumber = useCurrentBlock()?.toNumber() || 0;
	const pollEndBlock = usePollEndBlock();
	const canVote = endBlock > currentBlockNumber;

	const {
		postData: { postIndex },
		setPostData
	} = usePostDataContext();

	const cancelVote = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		const { error: deleteVoteErr, data } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deletePollVote', {
			pollId,
			pollType: POLL_TYPE.NORMAL,
			postId: postIndex,
			proposalType,
			userId: id
		});

		if (deleteVoteErr) {
			setErr(deleteVoteErr);
		} else {
			if (data && data.message) {
				setPostData((prev) => {
					return {
						...prev,
						polls:
							prev?.polls?.map((poll) => {
								if (String(poll.id) === String(pollId)) {
									poll.poll_votes = poll.poll_votes.filter((vote) => vote.user_id !== id) || [];
								}
								return {
									...poll
								};
							}) || []
					};
				});
			}
		}
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, pollId, postIndex, proposalType]);

	const castVote = useCallback(
		async (vote: Vote) => {
			if (!id) return;
			setLoading(true);

			const { error: addVoteErr, data } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/addPollVote', {
				pollId,
				pollType: POLL_TYPE.NORMAL,
				postId: postIndex,
				proposalType,
				userId: id,
				vote
			});

			if (addVoteErr) {
				setErr(addVoteErr);
			} else {
				if (data && data.message) {
					setPostData((prev) => {
						return {
							...prev,
							polls:
								prev?.polls?.map((poll) => {
									if (String(poll.id) === String(pollId)) {
										const date = new Date();
										poll.poll_votes = [
											...poll.poll_votes,
											{
												created_at: date,
												updated_at: date,
												user_id: id,
												vote
											}
										];
									}
									return {
										...poll
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
		[id, pollId, postIndex, proposalType]
	);

	const extendsPoll = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		const { data, error: editPollErr } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/editPoll', {
			blockEnd: pollEndBlock,
			pollId: pollId,
			pollType: POLL_TYPE.NORMAL,
			postId: postIndex,
			proposalType,
			userId: id
		});

		if (editPollErr) {
			setErr(editPollErr);
		}

		if (data) {
			setPostData((prev) => {
				return {
					...prev,
					polls:
						prev?.polls?.map((poll) => {
							if (String(poll.id) === String(pollId)) {
								poll.block_end = pollEndBlock;
							}
							return {
								...poll
							};
						}) || []
				};
			});
		}
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, pollEndBlock, pollId, postIndex, proposalType]);

	return (
		<GovSidebarCard className={className}>
			<Spin
				spinning={loading}
				indicator={<LoadingOutlined />}
			>
				<h3 className='flex items-center'>
					<span className='dashboard-heading mr-2 dark:text-white'>Poll Signals</span>{' '}
					<Tooltip
						title='This represents the off-chain votes of Polkassembly users including council members'
						color='#E5007A'
					>
						<InfoIcon className='scale-90 text-2xl text-lightBlue dark:text-icon-dark-inactive' />
					</Tooltip>
				</h3>

				<div className='my-6 flex'>
					<div className='flex flex-col items-center text-base text-white'>
						<div
							id='bigCircle'
							className={`${ayes >= nays ? (theme === 'dark' ? 'bg-aye_green_Dark' : 'bg-aye_green') : theme === 'dark' ? 'bg-nay_red_Dark' : 'bg-nay_red'} 
								z-10 flex h-[110px] w-[110px] items-center justify-center rounded-full`}
						>
							{ayes == 0 && nays == 0 ? '0' : ayes >= nays ? ((ayes / (ayes + nays)) * 100).toFixed(1) : ((nays / (ayes + nays)) * 100).toFixed(1)}%
						</div>
						<div
							id='smallCircle'
							className={`${
								ayes < nays ? (theme === 'dark' ? 'bg-aye_green_Dark' : 'bg-aye_green') : theme === 'dark' ? 'bg-nay_red_Dark' : 'bg-nay_red'
							} z-20 -mt-8 flex h-[75px] w-[75px] items-center justify-center rounded-full border-2 border-white dark:border-[#3B444F]`}
						>
							{ayes == 0 && nays == 0 ? '0' : ayes < nays ? ((ayes / (ayes + nays)) * 100).toFixed(1) : ((nays / (ayes + nays)) * 100).toFixed(1)}%
						</div>
					</div>

					<div className='ml-12 flex flex-1 flex-col justify-between py-12'>
						<div className='mb-auto flex items-center'>
							<div className='mr-auto font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Aye</div>
							<div className='mr-12 text-navBlue dark:text-white'>{ayes}</div>
						</div>

						<div className='flex items-center'>
							<div className='mr-auto font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Nay</div>
							<div className='mr-12 text-navBlue dark:text-white'>{nays}</div>
						</div>
					</div>
				</div>

				<div>{error && <ErrorAlert errorMsg={error} />}</div>
				<div>
					<AyeNayButtons
						className='mx-auto mb-6 mt-9 max-w-[310px]'
						size='large'
						disabled={!!ownVote || !canVote}
						onClickAye={() => castVote(Vote.AYE)}
						onClickNay={() => castVote(Vote.NAY)}
						customWidth='w-[180px]'
					/>
					<div className='mt-6 flex  items-center justify-items-start '>
						{canVote ? (
							<span className='mr-5'>
								Poll ends in <BlockCountdown endBlock={endBlock} />
							</span>
						) : (
							<span className='mr-5'>
								Poll ended.{' '}
								{canEdit ? (
									<CustomButton
										onClick={extendsPoll}
										text='Extend Poll'
										className='info'
										variant='primary'
									/>
								) : (
									''
								)}
							</span>
						)}

						<div>
							{ownVote && canVote && (
								<CustomButton
									onClick={cancelVote}
									className='info text-muted cancelVoteLink'
									variant='primary'
								>
									Cancel <span className='capitalize'>&nbsp;{ownVote.toLowerCase()}&nbsp;</span> vote
								</CustomButton>
							)}
						</div>
					</div>
				</div>
			</Spin>
		</GovSidebarCard>
	);
};

export default styled(GeneralSignals)`
	.blockCountdown {
		display: inline;
		font-weight: 500;
	}

	.info {
		margin: 1em 0;
	}

	.errorText {
		color: red_secondary;
	}

	.signal-btns {
		margin-top: 2rem !important;
	}

	.AYE {
		.ui.button.ui.primary.positive.button {
			background-color: green_secondary !important;
			opacity: 1 !important;
		}
	}

	.NAY {
		.ui.button.ui.primary.negative.button {
			background-color: red_secondary !important;
			opacity: 1 !important;
		}
	}
`;
