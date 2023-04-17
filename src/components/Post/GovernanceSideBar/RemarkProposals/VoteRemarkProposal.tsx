// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Modal, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { MessageType } from '~src/auth/types';
import { useApiContext, useNetworkContext, usePostDataContext, useUserDetailsContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import { useCurrentBlock } from '~src/hooks';
import { IRemarkPollVote } from '~src/types';
import { IRemarkPoll, NotificationStatus } from '~src/types';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import getAllAccounts, { initResponse } from '~src/util/getAllAccounts';
import { Signer } from '@polkadot/api/types';

interface Props {
	className?:string;
	startBlock: number;
	endBlock: number;
}

const VoteRemarkProposal = ({ className, startBlock } : Props) => {
	const { id } = useUserDetailsContext();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const { postData : { postIndex, remark_poll }, setPostData } = usePostDataContext();
	const currentBlock = useCurrentBlock();

	const [accountsInfo, setAccountsInfo] = useState(initResponse);
	const { accounts, accountsMap, signersMap } = accountsInfo;

	const [error, setError] = useState('');
	const [address, setAddress] = useState('');
	const [addVoteError, setAddVoteError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [voteCount, setVoteCount] = useState<{[index: string]: any}>({});
	const [selectedOption, setSelectedOption] = useState('');

	const getRemarkPoll = useCallback(async () => {
		if(remark_poll) return;
		const { data: fetchData , error: fetchError } = await nextApiClientFetch<IRemarkPoll>( `api/v1/polls?postId=${postIndex}&pollType=${POLL_TYPE.REMARK}&proposalType=${ProposalType.REMARK_PROPOSALS}`);

		if(fetchError) {
			setError(fetchError);
			console.error(fetchError);
			return;
		}

		if(fetchData) {
			const voteCountLocal : {[index: string]: any} = {};
			fetchData.remark_poll_votes.forEach(vote => {
				const option = vote.option;
				if (voteCountLocal[option]) {
					voteCountLocal[option]++;
				} else {
					voteCountLocal[option] = 1;
				}
			});

			setVoteCount(voteCountLocal);

			setError('');
			setPostData((prev) => {
				return {
					...prev,
					remark_poll: fetchData
				};
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if(remark_poll) return;
		getRemarkPoll();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function addPollVote(votePayload: any) {
		if(!id || !address) return;

		const { error: addVoteErr, data: addVoteData } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/addPollVote', {
			address,
			blockNumber: votePayload.blockNumber,
			option: votePayload.option,
			pollId: remark_poll?.id,
			pollType: POLL_TYPE.REMARK,
			postId: postIndex,
			power: votePayload.power,
			proposalType: ProposalType.REMARK_PROPOSALS,
			userId: id
		});

		if (addVoteErr) {
			setAddVoteError(addVoteErr);
		} else {
			if (addVoteData && addVoteData.message) {
				const newRemarkPollVote: IRemarkPollVote = {
					address,
					block_number: votePayload.blockNumber,
					created_at: new Date(),
					option: votePayload.option,
					power: votePayload.power,
					updated_at: new Date(),
					user_id: id
				};

				setPostData((prev) => {
					return {
						...prev,
						remark_poll : {
							...remark_poll!,
							remark_poll_votes: [
								...remark_poll!.remark_poll_votes,
								newRemarkPollVote
							]
						}
					};
				});
			}
		}
	}

	const openSelectAddress = (option: string) => {
		setSelectedOption(option);
		setLoading(true);

		getAllAccounts({
			api,
			apiReady,
			get_erc20: ['moonbase', 'moonriver', 'moonbeam'].includes(network),
			network
		})
			.then((res) => {
				setAccountsInfo(res);
			})
			.catch((err) => {
				console.error(err);
			});

		setShowAddressModal(true);
		setLoading(false);
	};

	const handlePollOptionClick = async () => {
		if(loading || !api || !apiReady || !id || !address || !selectedOption) return;
		setLoading(true);

		const signer: Signer = signersMap[accountsMap[address]];
		api.setSigner(signer);

		try {
			const blockHash = await api.rpc.chain.getBlockHash(startBlock);
			const apiAt = await api.at(blockHash);

			const balance = await apiAt.query.system.account(address);

			const votePayload = {
				address,
				blockNumber: currentBlock?.toNumber() || 0,
				option: selectedOption,
				power: balance.data?.free?.toString(),
				proposalId: postIndex,
				user_id: id
			};

			const payload = JSON.stringify(votePayload);

			await api.tx.system.remarkWithEvent(`${network.charAt(0).toUpperCase() + network.slice(1)}::Vote::${payload}`).signAndSend(address, async ({ status }: { status: any }) => {
				setLoading(true);
				if(status.isInBlock){
					await addPollVote(votePayload);
				}else {
					if (status.isBroadcast){
						setLoading(true);
					}
					console.log(`Current status: ${status.type}`);
				}
			}).catch((error) => {
				queueNotification({
					header: 'Error in Voting!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
				console.log(error);
				setLoading(false);
			});

			// votesRefetch();
		} catch (error) {
			setLoading(false);
			console.log(error);
		}

		setLoading(false);
	};

	if (error || !remark_poll) return <></>;

	return (<>
		<GovSidebarCard className={className}>
			<div className="dashboard-heading mb-4">Vote</div>

			{addVoteError && <ErrorAlert className='mb-6' errorMsg={addVoteError} />}

			<div className="grid grid-cols-2 gap-4">
				{remark_poll.options.map((option, index) => {
					const count = voteCount[option] || 0;
					const percentage = count / remark_poll.remark_poll_votes.length * 100;

					return <button key={index} onClick={() => openSelectAddress(option)} className={`bg-white group cursor-pointer transition-all border border-solid border-pink-300 hover:bg-pink_primary hover:border-pink_primary hover:text-white rounded-md p-2 ${loading && 'cursor-not-allowed'}`}>
						<div className='break-all w-full text-left'>{option}</div>
						<div className='w-full text-right text-pink_primary group-hover:text-white'>{isNaN(percentage) ? 0 : percentage}%</div>
					</button>;
				})}
			</div>

			<Divider />

			<div className="flex flex-col gap-y-2">
				<div className="flex justify-between">
					<span className='text-md text-gray-600 font-medium'>Voted</span>
					<span className='text-pink-400 font-medium'>{ remark_poll.remark_poll_votes.reduce((acc, curr) => acc + parseFloat(curr.power), 0) } {chainProperties[network]?.tokenSymbol} </span>
				</div>

				<div className="flex justify-between">
					<span className='text-md text-gray-600 font-medium'>Voters</span>
					<span className='text-pink-400 font-medium'> {remark_poll.remark_poll_votes.length} </span>
				</div>
			</div>

			<button className="border-none cursor-pointer bg-white text-pink_primary font-semibold mt-8">All Votes</button>

		</GovSidebarCard>

		<Modal
			title="Select Address"
			open={showAddressModal}
			onCancel={() => setShowAddressModal(false)}
			onOk={() => handlePollOptionClick()}
		>
			<Spin spinning={loading} indicator={<LoadingOutlined />}>
				<AccountSelectionForm
					title='Endorse with account'
					accounts={accounts}
					address={address || ''}
					withBalance
					onAccountChange={(addr) => setAddress(addr)}
				/>
			</Spin>
		</Modal>
	</>
	);
};

export default VoteRemarkProposal;