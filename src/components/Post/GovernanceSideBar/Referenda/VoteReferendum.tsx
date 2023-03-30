// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Button, Form, Modal, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo,useState } from 'react';
import { LoadingStatusType,NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import WalletButtons from '~src/components/Login/WalletButtons';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import AyeNayButtons from '~src/ui-components/AyeNayButtons';
import LoginToVote from '../LoginToVoteOrEndorse';

interface Props {
	className?: string
	referendumId?: number | null | undefined
	address: string
	accounts: InjectedAccount[]
	onAccountChange: (address: string) => void
	getAccounts: () => Promise<undefined>
	lastVote: string | null | undefined
	setLastVote: React.Dispatch<React.SetStateAction<string | null | undefined>>
	proposalType: ProposalType;
  defaultAccounts:any;
}

const VoteReferendum = ({ className, referendumId, address, accounts, onAccountChange, getAccounts, lastVote, setLastVote, proposalType, defaultAccounts }: Props) => {
	const { addresses, isLoggedOut } = useUserDetailsContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [lockedBalance, setLockedBalance] = useState<BN | undefined>(undefined);
	const { api, apiReady } = useApiContext();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [isFellowshipMember, setIsFellowshipMember] = useState<boolean>(false);
	const [fetchingFellowship, setFetchingFellowship] = useState(true);
	const { network } = useNetworkContext();
	const [fetchAccountsInfo, setFetchAccountsInfo] = useState(true);
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);

	const convictionOpts = useMemo(() => [
		<Select.Option key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	],[CONVICTIONS]);

	const [conviction, setConviction] = useState<number>(0);

	const onConvictionChange = (value: any) => {
		setConviction(Number(value));
	};

	const onBalanceChange = (balance: BN) => setLockedBalance(balance);

	const checkIfFellowshipMember = async () => {
		if (!api || !apiReady) {
			return;
		}

		if (!api?.query?.fellowshipCollective?.members?.entries) {
			return;
		}

		// using any because it returns some Codec types
		api.query.fellowshipCollective.members.entries().then((entries: any) => {
			const members: string[] = [];

			for (let i = 0; i < entries.length; i++) {
				// key split into args part to extract
				const [{ args: [accountId] }, optInfo] = entries[i];
				if (optInfo.isSome) {
					members.push(accountId.toString());
				}
			}

			addresses && addresses.some(address => {
				if (members.includes(address)) {
					setIsFellowshipMember(true);
					// this breaks the loop as soon as we find a matching address
					return true;
				}
				return false;
			});

			setFetchingFellowship(false);

		});
	};

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		checkIfFellowshipMember();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	const voteReferendum = async (aye: boolean) => {
		if (!referendumId && referendumId !== 0) {
			console.error('referendumId not set');
			return;
		}

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		let voteTx = null;

		if(proposalType === ProposalType.OPEN_GOV){
			voteTx = api.tx.convictionVoting.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye, conviction } } });
		} else if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			voteTx = api.tx.fellowshipCollective.vote(referendumId, aye);
		} else{
			voteTx = api.tx.democracy.vote(referendumId, { Standard: { balance: lockedBalance, vote: { aye, conviction } } });
		}

		if(network == 'equilibrium'){
			voteTx.signAndSend(address, { nonce: -1 }, ({ status }) => {
				if (status.isInBlock) {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
						status: NotificationStatus.SUCCESS
					});
					setLastVote(aye ? 'aye' : 'nay');
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
		}else{
			voteTx.signAndSend(address, ({ status }) => {
				if (status.isInBlock) {
					setLoadingStatus({ isLoading: false, message: '' });
					queueNotification({
						header: 'Success!',
						message: `Vote on referendum #${referendumId} successful.`,
						status: NotificationStatus.SUCCESS
					});
					setLastVote(aye ? 'aye' : 'nay');
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

		}
	};

	if (isLoggedOut()) {
		return <LoginToVote />;
	}
	const openModal = () => {
		setShowModal(true);
	};

	const VoteLock = ({ className }: { className?:string }) =>
		<Form.Item className={className}>
			<label  className='mb-3 flex items-center text-sm text-sidebarBlue'>
				Vote lock
				<HelperTooltip className='ml-2' text='You can multiply your votes by locking your tokens for longer periods of time.' />
			</label>

			<Select onChange={onConvictionChange} size='large' className='rounded-md text-sm text-sidebarBlue p-1 w-full' defaultValue={conviction}>
				{convictionOpts}
			</Select>
		</Form.Item>;

	const VoteUI = <>
		<div className={className}>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[95%]'
				onClick={openModal}
			>
				{lastVote == null || lastVote == undefined  ? 'Cast Vote Now' : 'Cast Vote Again' }
			</Button>
			<Modal
				open={showModal}
				onCancel={() => setShowModal(false)}
				closable={!fetchAccountsInfo}
				footer={
					fetchAccountsInfo?
						<div className='flex items-center justify-end'>
							{
								[
									<Button
										key='got-it'
										icon={<CheckOutlined />}
										className='bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
										onClick={async () => {
											await getAccounts();
											setFetchAccountsInfo(false);
										}}
									>
										Got it!
									</Button>,
									<Button
										key="cancel"
										onClick={() => setShowModal(false)}
										className='bg-white text-pink_primary outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
									>
										Cancel
									</Button>
								]
							}
						</div>
						: null
				}
			>
				{
					fetchAccountsInfo?
						<div className='max-w-[600px]'>
							<p>
					For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
							</p>
						</div>
						: <>
							<Spin spinning={loadingStatus.isLoading} indicator={<LoadingOutlined />}>
								<h4 className='dashboard-heading mb-7'>Cast Your Vote</h4>
								{
									proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS &&
						<BalanceInput
							label={'Lock balance'}
							helpText={'Amount of you are willing to lock for this vote.'}
							placeholder={'123'}
							onChange={onBalanceChange}
						/>
								}

								<AccountSelectionForm
									title='Vote with Account'
									accounts={accounts}
									address={address}
									withBalance
									onAccountChange={onAccountChange}
								/>

								{
									proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS &&
						<VoteLock className='mt-6' />
								}

								<AyeNayButtons
									className='mt-6 max-w-[156px]'
									size='large'
									disabled={!apiReady}
									onClickAye={() => voteReferendum(true)}
									onClickNay={() => voteReferendum(false)}
								/>

							</Spin>
						</>
				}
			</Modal>
		</div>
	</>;

	if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
		if(!fetchingFellowship) {
			if(isFellowshipMember) return VoteUI;

			return <div className={className}>Only fellowship members may vote.</div>;

		} else {
			return <div className={className}>Fetching fellowship members...</div>;
		}
	}

	return VoteUI;
};

export default styled(VoteReferendum)`
	.LoaderWrapper {
		height: 40rem;
		position: absolute;
		width: 100%;
	}

	.vote-form-cont {
		padding: 12px;
	}
`;
