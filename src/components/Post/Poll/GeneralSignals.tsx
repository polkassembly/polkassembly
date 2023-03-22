// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import BlockCountdown from 'src/components/BlockCountdown';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import usePollEndBlock from 'src/hooks/usePollEndBlock';
import { IPollVote, Vote } from 'src/types';
import AyeNayButtons from 'src/ui-components/AyeNayButtons';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import styled from 'styled-components';

import { MessageType } from '~src/auth/types';
import { usePostDataContext, useUserDetailsContext } from '~src/context';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IGeneralSignalsProps {
	className?: string
	endBlock: number
	pollId: string
	canEdit: boolean;
	proposalType: ProposalType;
	votes: IPollVote[];
}

const GeneralSignals: FC<IGeneralSignalsProps> = ({ className, endBlock, pollId, canEdit, proposalType, votes }) => {
	const { id } = useUserDetailsContext();
	const [error, setErr] = useState('');
	const [loading, setLoading] = useState(false);
	const [ayes, setAyes] = useState(0);
	const [nays, setNays] = useState(0);
	const [ownVote, setOwnVote] = useState<Vote | null>(null);

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
	const canVote =  endBlock > currentBlockNumber;

	const { postData: { postIndex }, setPostData } = usePostDataContext();

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
						polls: prev?.polls?.map((poll) => {
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

	const castVote = useCallback(async (vote: Vote) => {
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
						polls: prev?.polls?.map((poll) => {
							if (String(poll.id) === String(pollId)) {
								const date = new Date();
								poll.poll_votes = [...poll.poll_votes, {
									created_at: date,
									updated_at: date,
									user_id: id,
									vote
								}];
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

		if(data) {
			setPostData((prev) => {
				return {
					...prev,
					polls: prev?.polls?.map((poll) => {
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
			<Spin spinning={loading} indicator={<LoadingOutlined />}>
				<h3 className='flex items-center'><span className='mr-2 dashboard-heading'>Poll Signals</span> <HelperTooltip text='This represents the off-chain votes of Polkassembly users including council members'/></h3>

				<div className="my-6 flex">
					<div className='flex flex-col items-center text-white text-base'>
						<div id="bigCircle" className={`${ayes >= nays ? 'bg-aye_green' : 'bg-nay_red'} rounded-full h-[110px] w-[110px] flex items-center justify-center z-10`}>
							{
								(ayes == 0 && nays == 0) ? '0' : ayes >= nays ? ((ayes/(ayes + nays)) * 100).toFixed(1) : ((nays/(ayes + nays)) * 100).toFixed(1)
							}%
						</div>
						<div id="smallCircle" className={`${ayes < nays ? 'bg-aye_green' : 'bg-nay_red'} -mt-8 border-2 border-white rounded-full h-[75px] w-[75px] flex items-center justify-center z-20`}>
							{
								(ayes == 0 && nays == 0) ? '0' : ayes < nays ? ((ayes/(ayes + nays)) * 100).toFixed(1) : ((nays/(ayes + nays)) * 100).toFixed(1)
							}%
						</div>
					</div>

					<div className='flex-1 flex flex-col justify-between ml-12 py-9'>
						<div className='mb-auto flex items-center'>
							<div className='mr-auto text-sidebarBlue font-medium'>Aye</div>
							<div className='text-navBlue'>{ayes}</div>
						</div>

						<div className='flex items-center'>
							<div className='mr-auto text-sidebarBlue font-medium'>Nay</div>
							<div className='text-navBlue'>{nays}</div>
						</div>
					</div>
				</div>

				<div>
					{error && <ErrorAlert errorMsg={error} />}
				</div>
				<div>
					<AyeNayButtons
						className='mt-9 mb-6 mx-auto'
						size='large'
						disabled={!id || !!ownVote || !canVote}
						onClickAye={() => castVote(Vote.AYE)}
						onClickNay={() => castVote(Vote.NAY)}
					/>
					<div className='flex items-center justify-between mt-6'>
						<div>
							{ownVote && canVote &&
							<Button size='middle' className='info text-muted cancelVoteLink' onClick={cancelVote}>
								Cancel <span className='capitalize'>&nbsp;{ownVote.toLowerCase()}&nbsp;</span> vote
							</Button>
							}
						</div>
						{canVote
							? <span>Poll ends in <BlockCountdown endBlock={endBlock}/></span>
							: <span>Poll ended. {canEdit
								? <Button className='info' onClick={extendsPoll}>Extend Poll</Button>
								: ''}
							</span>
						}
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
		.ui.button.ui.primary.negative.button{
			background-color: red_secondary !important;
			opacity: 1 !important;
		}
	}
`;
