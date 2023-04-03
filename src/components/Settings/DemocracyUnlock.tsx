// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import queueNotification from '~src/ui-components/QueueNotification';
import { LoadingStatusType, NotificationStatus } from 'src/types';
import { Button, Divider, Form } from 'antd';
import Loader from 'src/ui-components/Loader';
import Web3 from 'web3';

import { chainProperties } from '../../global/networkConstants';
import AccountSelectionForm from '../../ui-components/AccountSelectionForm';
import formatBnBalance from '../../util/formatBnBalance';
import getNetwork from '../../util/getNetwork';
import { useApiContext, useNetworkContext } from '~src/context';
import addEthereumChain from '~src/util/addEthereumChain';

const abi = require('../../moonbeamAbi.json');

const currentNetwork = getNetwork();

interface Props {
	className?: string
}

interface Vote {
	refIndex: BN;
	vote: boolean;
	amount: BN;
	conviction: number;
}

const contractAddress = process.env.NEXT_PUBLIC_DEMOCRACY_PRECOMPILE;

const DemocracyUnlock = ({ className }: Props) => {
	const { network } = useNetworkContext();
	const [address, setAddress] = useState<string>('');
	const [votes, setVotes] = useState<Vote[]>([]);
	const [lockedBalance, setLockedBalance] = useState<BN>(new BN(0));
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [unlocksAt, setUnlocksAt] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [canBeUnlocked, setCanBeUnlocked] = useState<boolean>(false);
	const { api, apiReady } = useApiContext();
	const [isBalanceUpdated, setIsBalanceUpdated] = useState(false);

	useEffect(() => {
		if (!accounts.length) {
			getAccounts();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length]);

	useEffect(() => {
		if (address) {
			getLockedBalance();
		}
	}, [api, apiReady, address]); // eslint-disable-line react-hooks/exhaustive-deps

	const getLockedBalance = async () => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const votingInfo = await api.query.democracy.votingOf(address);

		setUnlocksAt(votingInfo.asDirect.prior[0].toString());

		setVotes(votingInfo.asDirect.votes.map((vote) => {
			const refIndex = vote[0];

			let conviction = 0;

			if(vote[1].asStandard.vote.conviction.isLocked1x){
				conviction = 1;
			}
			else if(vote[1].asStandard.vote.conviction.isLocked2x){
				conviction = 2;
			}
			else if(vote[1].asStandard.vote.conviction.isLocked3x){
				conviction = 3;
			}
			else if(vote[1].asStandard.vote.conviction.isLocked4x){
				conviction = 4;
			}
			else if(vote[1].asStandard.vote.conviction.isLocked5x){
				conviction = 5;
			}
			else if(vote[1].asStandard.vote.conviction.isLocked6x){
				conviction = 6;
			}
			else{
				conviction = 0;
			}

			return {
				amount: vote[1].asStandard.balance,
				conviction: conviction,
				refIndex,
				vote: vote[1].asStandard.vote.isAye
			};
		}));

		votes.sort((a, b) => a.conviction - b.conviction);

		const balances = await api.query.balances.locks(address);

		let lockedBalance = new BN(0);
		balances.forEach((balance) => {
			if (balance.id.toHuman() === 'democrac') {
				lockedBalance = lockedBalance.add(balance.amount);
			}
		});

		setLockedBalance(lockedBalance);
		setIsBalanceUpdated((prev) => !prev);
	};

	const getAccounts = async () => {
		const ethereum = (window as any).ethereum;

		if (!ethereum) {
			return;
		}

		try {
			await addEthereumChain({
				ethereum,
				network
			});
		} catch (error) {
			setIsAccountLoading(false);
			return;
		}

		let addresses: any[] = [];

		try {
			addresses = await ethereum.request({ method: 'eth_requestAccounts' });
		} catch (e) {
			setIsAccountLoading(false);
			return;
		}

		if (addresses.length === 0) {
			setIsAccountLoading(false);
			return;
		}

		setAccounts(addresses.map((address: string): InjectedAccountWithMeta => {
			const account = {
				address,
				meta: {
					genesisHash: null,
					name: 'metamask',
					source: 'metamask'
				}
			};

			return account;
		}));

		if (addresses.length > 0) {
			setAddress(addresses[0]);
		}

		setIsAccountLoading(false);
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const handleRemove = async (refIndex: BN) => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		// const web3 = new Web3(process.env.REACT_APP_WS_PROVIDER || 'wss://wss.testnet.moonbeam.network');
		const web3 = new Web3((window as any).ethereum);

		const chainId = await web3.eth.net.getId();

		if (chainId !== chainProperties[currentNetwork].chainId) {
			queueNotification({
				header: 'Wrong Network!',
				message: `Please change to ${currentNetwork} network`,
				status: NotificationStatus.ERROR
			});
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for confirmation' });

		const contract = new web3.eth.Contract(abi, contractAddress);

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		contract.methods
			.remove_vote(refIndex.toString())
			.send({
				from: address,
				to: contractAddress
			})
			.then((result: any) => {
				console.log(result);
				queueNotification({
					header: 'Success!',
					message: 'Remove Vote successful.',
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				setCanBeUnlocked(true);
			})
			.catch((error: any) => {
				console.error('ERROR:', error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
				setLoadingStatus({ isLoading: false, message: '' });
				setCanBeUnlocked(false);
			});
	};

	const handleUnlock = async () => {
		// const web3 = new Web3(process.env.REACT_APP_WS_PROVIDER || 'wss://wss.testnet.moonbeam.network');
		const web3 = new Web3((window as any).ethereum);

		const chainId = await web3.eth.net.getId();

		if (chainId !== chainProperties[currentNetwork].chainId) {
			queueNotification({
				header: 'Wrong Network!',
				message: `Please change to ${currentNetwork} network`,
				status: NotificationStatus.ERROR
			});
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for confirmation' });

		const contract = new web3.eth.Contract(abi, contractAddress);

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		contract.methods
			.unlock(address)
			.send({
				from: address,
				to: contractAddress
			})
			.then((result: any) => {
				console.log(result);
				setLoadingStatus({ isLoading: false, message: '' });
				queueNotification({
					header: 'Success!',
					message: 'Unlock successful.',
					status: NotificationStatus.SUCCESS
				});
				setCanBeUnlocked(false);
				getLockedBalance();
			})
			.catch((error: any) => {
				setLoadingStatus({ isLoading: false, message: '' });
				console.error('ERROR:', error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
				setCanBeUnlocked(true);
				getLockedBalance();
			});
	};

	const GetAccountsButton = () =>
		<Form>
			<Form.Item className='button-container'>
				<Button
					className='bg-pink_primary rounded-md outline-none border-none text-white mt-2'
					onClick={getAccounts}
					size={'large'}
				>
					Vote
				</Button>
			</Form.Item>
		</Form>;

	const noAccount = accounts.length === 0;

	return (
		<div className={className}>
			{noAccount
				? <GetAccountsButton />
				: null
			}
			<Form id='democracyUnlock'>
				<div>
					<Form.Item>
						<h1 className='dashboard-heading' >Unlock democracy locks</h1>
						{ accounts.length > 0 ? <AccountSelectionForm
							title='Choose account'
							accounts={accounts}
							address={address}
							onAccountChange={onAccountChange}
							withBalance
							isBalanceUpdated={isBalanceUpdated}
						/> :
							<span className='text-sidebarBlue'>No accounts found, Please approve request from your wallet and/or <a href="javascript:window.location.reload(true)">refresh</a> and try again! </span>
						}
					</Form.Item>
				</div>
				<div>
					<Form.Item>
						{lockedBalance.isZero()
							? <div className='text-sidebarBlue'>You currently have no democracy locks.</div>
							: <div className='text-sidebarBlue'>Your locked balance: <span className=' font-medium'>{formatBnBalance(String(lockedBalance), { numberAfterComma: 2, withUnit: true }, network)}.</span>{unlocksAt === '0' ? <div className=' font-medium'>Available to be immediately unlocked.</div> : <div>UnlocksAt: <span className='font-medium'>{unlocksAt}</span></div>} </div>
						}
						{votes.length ?
							<>
								<ul className='list-none flex flex-col text-sidebarBlue mt-3'>
									<li className='grid grid-cols-6 md:grid-cols-8 font-medium gap-x-5 py-1'>
										<span className='col-span-2'>Referendums</span>
										<span className='col-span-2'>Locked</span>
										<span className='col-span-2'>Unlocks At</span>
										<span className='col-span-2'></span>
									</li>
									<Divider className='my-1'/>
									{votes.map((vote, id) => (
										<>
											<li key={vote.refIndex.toString()} className='grid grid-cols-6 md:grid-cols-8 gap-x-5 py-1'>
												<span className='col-span-2'>
													<Link href={`/referendum/${vote.refIndex.toString()}`}>
														Referendum #{vote.refIndex.toString()}
													</Link>
												</span>
												<span className='col-span-2'>
													{formatBnBalance(String(vote.amount), { numberAfterComma: 2, withUnit: true }, network)}
												</span>
												<span className='col-span-2'>{unlocksAt}</span>
												<span className='col-span-2'>
													{ id === 0 ? canBeUnlocked ? <Button
														onClick={handleUnlock}
														loading={loadingStatus.isLoading}
														size='small'
														className='bg-pink_primary rounded-md outline-none border-none text-white'
													>
																Unlock
													</Button>
														:
														<Button
															size='small'
															className='bg-pink_primary rounded-md outline-none border-none text-white'
															onClick={() => handleRemove(vote.refIndex)}
															loading={loadingStatus.isLoading}
														>
																Remove
														</Button> : <></> }
												</span>
											</li>
											<Divider className='my-1'/>
										</>
									))}
								</ul>
								{/* <div>{unlocking ? <>Please Confirm to Unlock.</> : <>*Remove Votes will also call Unlock.</>}</div> */}
							</>
							: <>
								<Button
									className='bg-pink_primary rounded-md outline-none border-none text-white mt-2'
									onClick={handleUnlock}
									loading={loadingStatus.isLoading}
								>
									Unlock
								</Button>
							</>}
					</Form.Item>
				</div>
			</Form>
			{isAccountLoading || loadingStatus.isLoading
				? <Loader className='loader-wrapper' text={loadingStatus.message} />
				: null
			}
		</div>
	);
};

export default DemocracyUnlock;