// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Alert, Button, Modal, Spin } from 'antd';
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

interface Props {
	accounts: InjectedAccount[]
	address: string
	className?: string
	getAccounts: () => Promise<undefined>
	motionId?: number | null
	motionProposalHash?: string
	onAccountChange: (address: string) => void
}

const VoteMotion = ({
	accounts,
	address,
	className,
	getAccounts,
	motionId,
	motionProposalHash,
	onAccountChange
}: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message:'' });
	const [isCouncil, setIsCouncil] = useState(false);
	const [forceVote, setForceVote] = useState(false);
	const [currentCouncil, setCurrentCouncil] = useState<string[]>([]);
	const { api, apiReady } = useApiContext();
	const { addresses, isLoggedOut } = useUserDetailsContext();

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		api.query.council.members().then((memberAccounts) => {
			setCurrentCouncil(memberAccounts.map(member => member.toString()));
		});

	}, [api, apiReady]);

	useEffect( () => {
		// it will iterate through all addresses
		addresses && addresses.some(address => {
			if (currentCouncil.includes(address)) {
				setIsCouncil(true);
				// this breaks the loop as soon as we find a matching address
				return true;
			}
			return false;
		});
	}, [addresses, currentCouncil]);

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
		if(accounts.length === 0) {
			getAccounts();
		}
	};

	const VotingForm = () =>
		<GovSidebarCard>
			<h3 className='dashboard-heading mb-6'>Cast your Vote!</h3>
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
					<h4 className='dashboard-heading mb-7'>Cast Your Vote</h4>

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
