// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, Spin,  Tooltip } from 'antd';
import Image from 'next/image';
import React, { useEffect,useState } from 'react';
import { LoadingStatusType, NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AyeNayButtons from 'src/ui-components/AyeNayButtons';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { useApiContext, useUserDetailsContext } from '~src/context';
import LoginToVote from '../LoginToVoteOrEndorse';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { EDecision, IVotesHistoryResponse } from 'pages/api/v1/votes/history';
import { network } from '~src/global/networkConstants';
import { ProposalType } from '~src/global/proposalType';
import AyeGreen from '~assets/icons/aye-green-icon.svg';
import { DislikeIcon } from '~src/ui-components/CustomIcons';
import dayjs from 'dayjs';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';

interface Props {
	accounts: InjectedTypeWithCouncilBoolean[];
	address: string;
	className?: string;
	motionId?: number | null;
	motionProposalHash?: string;
	onAccountChange: (address: string) => void;
	proposalType?: ProposalType;
	isCouncil?: boolean;
}

const VoteMotion = ({
	accounts,
	address,
	className,
	motionId,
	motionProposalHash,
	onAccountChange,
	proposalType,
	isCouncil
}: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message:'' });
	const [forceVote, setForceVote] = useState(false);
	const { api, apiReady } = useApiContext();
	const { isLoggedOut } = useUserDetailsContext();
	const [vote,setVote] = useState<{
		timestamp: string | undefined,
		decision:EDecision,
	}>({
		decision:EDecision.YES,
		timestamp:''
	});
	const [voteCount,setVoteCount] = useState<number>(0);

	useEffect( () => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
		nextApiClientFetch<IVotesHistoryResponse>(`api/v1/votes/history?page=${1}&voterAddress=${address}&network=${network}&numListingLimit=${1}&proposalType=${proposalType}&proposalIndex=${motionId}`)
			.then((res) => {
				if (res.error) {
					console.log('error');
				} else {
					if(res.data?.count){
						setVoteCount(res.data?.count);
						setVote({
							decision:res.data?.votes[0].decision,
							timestamp:res.data?.votes[0].timestamp
						});
					}
				}

			})
			.catch((err) => {
				console.error(err);
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address,api,apiReady,network,proposalType,motionId]);

	const voteMotion = async (aye: boolean) => {
		if (!motionId && motionId !== 0) {
			console.error('motionId not set');
			return;
		}

		if (!motionProposalHash) {
			console.error('motionProposalHash not set');
			return;
		}

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		const vote = api.tx.council.vote(motionProposalHash, motionId, aye);

		vote.signAndSend(address, ({ status }) => {
			if (status.isInBlock) {
				queueNotification({
					header: 'Success!',
					message: `Vote on motion #${motionId} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				console.log(`Completed at block hash #${status.asInBlock.toString()}`);
			} else {
				if (status.isBroadcast){
					setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' });
				}
				console.log(`Current status: ${status.type}`);
			}
		}).catch((error) => {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		});
	};

	if (isLoggedOut()) {
		return <LoginToVote />;
	}
	const openModal = () => {
		setShowModal(true);
	};

	const VotingForm = () =>
		<GovSidebarCard>
			<h3 className='text-[#243A57] font-semibold text-xl leading-6 tracking-[0.0015em] mb-6'>Cast your Vote!</h3>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg my-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[95%] mx-auto'
				onClick={openModal}
			>
				Cast Vote
			</Button>

			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={null}
			>
				<Spin spinning={loadingStatus.isLoading} indicator={<LoadingOutlined />}>
					<h4 className='text-[#243A57] font-semibold text-xl leading-6 tracking-[0.0015em] mb-7'>Cast Your Vote</h4>

					<AccountSelectionForm
						title='Vote with Account'
						accounts={accounts}
						address={address}
						withBalance
						onAccountChange={onAccountChange}
					/>

					<AyeNayButtons
						className='mt-6 max-w-[156px]'
						size='large'
						disabled={!apiReady}
						onClickAye={() => voteMotion(true)}
						onClickNay={() => voteMotion(false)}
					/>
				</Spin>
			</Modal>
			{ voteCount ?
				<div>
					<p className='font-medium text-[12px] leading-6 text-[#243A57] mb-[5px]'>Last Vote:</p>
					<div className='flex text-[#243A57] text-[12px] font-normal leading-6 mb-[-5px]'>
						<Tooltip placement="bottom"  title="Decision"  color={'#E5007A'} className='w-[20%] max-[345px]:w-auto'>
							<span className='h-[25px]'>{vote.decision == 'yes' ? <p><AyeGreen /> <span className='capitalize font-medium text-[#2ED47A]'>{'Aye'}</span></p> :vote.decision == 'no' ?  <div><DislikeIcon className='text-[#F53C3C]'/> <span className='mb-[5px] capitalize font-medium text-[#F53C3C]'>{'Nay'}</span></div> : null}</span>
						</Tooltip>
						<Tooltip placement="bottom"  title="Time"  color={'#E5007A'} className='w-[30%] max-[345px]:w-auto'>
							<span className=''><ClockCircleOutlined className='mr-1' />{dayjs(vote.timestamp, 'YYYY-MM-DD').format('Do MMM\'YY')}</span>
						</Tooltip>

					</div>
				</div>
				: null
			}

		</GovSidebarCard>;

	const NotCouncil = () =>
		<GovSidebarCard>
			<h3 className='dashboard-heading mb-6'>Cast your Vote!</h3>
			<Alert className='mb-6' type='warning' message={<div className='flex items-center gap-x-2'>
				<span>
					No account found from the council
				</span>
				<Image width={25} height={25} src='/assets/frowning-face.png' alt="frowning face" />
			</div>} />
			<Button onClick={() => setForceVote(true)}>Let me try still.</Button>
		</GovSidebarCard>;

	return (
		<div className={className}>
			{isCouncil || forceVote
				? <VotingForm/>
				: <NotCouncil/>
			}
		</div>
	);
};

export default styled(VoteMotion)`
	.LoaderWrapper {
		height: 15rem;
		position: absolute;
		width: 100%;
	}
`;
