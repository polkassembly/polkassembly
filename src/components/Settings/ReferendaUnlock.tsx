// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/types';
import { Button, Divider, Form, Spin } from 'antd';
import Loader from 'src/ui-components/Loader';
import Web3 from 'web3';

import { chainProperties } from '../../global/networkConstants';
import AccountSelectionForm from '../../ui-components/AccountSelectionForm';
import formatBnBalance from '../../util/formatBnBalance';
import getNetwork from '../../util/getNetwork';
import { useApiContext, useNetworkContext } from '~src/context';
import addEthereumChain from '~src/util/addEthereumChain';
import { networkTrackInfo } from '~src/global/post_trackInfo';

const abi = require('../../moonbeamConvictionVoting.json');

const currentNetwork = getNetwork();

export const getTrackName = (network: string, trackId: number) => {
	const tracksObj = networkTrackInfo[network];
	let name = '';
	if (tracksObj) {
		Object.values(tracksObj).forEach((obj) => {
			if (obj.trackId === trackId) {
				name = obj.name;
			}
		});
	}
	return name;
};

interface IReferendaUnlockProps {
	className?: string;
	isBalanceUpdated: boolean;
	setIsBalanceUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Vote {
	refIndex: BN;
	vote: boolean;
	amount: BN;
	trackId: number;
	unlocksAt: string;
	conviction: number;
}

interface Unlock {
	trackId: number;
	amount: BN;
}

const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE;

interface IReferendaUnlockStatus {
	remove: {
		[key: string]: { isLoading: boolean, message: string };
	};
	unlock: {
		[key: string]: { isLoading: boolean, message: string };
	};
}

const ReferendaUnlock: FC<IReferendaUnlockProps> = ({ className, isBalanceUpdated, setIsBalanceUpdated }) => {
	const { network } = useNetworkContext();
	const [address, setAddress] = useState<string>('');
	const [votes, setVotes] = useState<Vote[]>([]);
	const [unlocks, setUnlocks] = useState<Unlock[]>([]);
	const [lockedBalance, setLockedBalance] = useState<BN>(new BN(0));
	const [loadingStatus, setLoadingStatus] = useState<IReferendaUnlockStatus>({
		remove: {},
		unlock: {}
	});
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const { api, apiReady } = useApiContext();

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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address]);

	const getLockedBalance = async () => {
		if (!api || !apiReady) {
			return;
		}

		const unlocks: Unlock[] = [];

		const res = await api.query.convictionVoting.classLocksFor(address);
		if (res && res.toHuman) {
			const arr = res.toHuman() as [string, string][];
			arr.forEach((obj) => {
				if (obj && Array.isArray(obj) && obj.length > 1) {
					unlocks.push({
						amount: new BN(obj[1].replaceAll(',', '')),
						trackId: Number(obj[0])
					});
				}
			});
		}

		const votes: Vote[] = [];
		const votingInfoEntries = await api.query.convictionVoting.votingFor.entries(address);
		votingInfoEntries.forEach((([keys, votingInfo]) => {
			const arr = keys.toHuman() as [string, number];
			votes.push(...votingInfo.asCasting.votes.map((vote) => {
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
					trackId: Number(arr[1]),
					unlocksAt: votingInfo.asCasting.prior[0].toString(),
					vote: vote[1].asStandard.vote.isAye
				};
			}));
		}));

		setVotes(votes);
		votes.forEach((vote) => {
			const unlockIndex = unlocks.findIndex((unlock) => unlock.trackId === vote.trackId);
			if (unlockIndex >= 0) {
				unlocks.splice(unlockIndex, 1);
			}
		});

		setUnlocks(unlocks);

		votes.sort((a, b) => a.conviction - b.conviction);

		const balances = await api.query.balances.locks(address);

		let lockedBalance = new BN(0);
		balances.forEach((balance) => {
			if (balance.id.toHuman() === 'pyconvot') {
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

	const handleRemove = async (vote: Vote) => {
		if (!api || !apiReady) {
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

		setLoadingStatus((prev) => {
			return {
				...prev,
				remove: {
					...prev.remove,
					[vote.refIndex.toString()]: { isLoading: true, message: 'Waiting for confirmation' }
				}
			};
		});

		const contract = new web3.eth.Contract(abi, contractAddress);

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		contract.methods
			.removeVoteForTrack(vote.refIndex, vote.trackId)
			.send({
				from: address,
				to: contractAddress
			})
			.then((result: any) => {
				console.log(result);
				setLoadingStatus((prev) => {
					return {
						...prev,
						remove: {
							...prev.remove,
							[vote.refIndex.toString()]: { isLoading: false, message: '' }
						}
					};
				});
				queueNotification({
					header: 'Success!',
					message: 'Remove Vote successful.',
					status: NotificationStatus.SUCCESS
				});
				getLockedBalance();
			})
			.catch((error: any) => {
				console.error('ERROR:', error);
				setLoadingStatus((prev) => {
					return {
						...prev,
						remove: {
							...prev.remove,
							[vote.refIndex.toString()]: { isLoading: false, message: '' }
						}
					};
				});
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
				getLockedBalance();
			});
	};

	const handleUnlock = async (unlock: Unlock) => {
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

		setLoadingStatus((prev) => {
			return {
				...prev,
				unlock: {
					...prev.unlock,
					[unlock.trackId.toString()]: { isLoading: true, message: 'Waiting for confirmation' }
				}
			};
		});

		const contract = new web3.eth.Contract(abi, contractAddress);

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		contract.methods
			.unlock(unlock.trackId, address)
			.send({
				from: address,
				to: contractAddress
			})
			.then((result: any) => {
				console.log(result);
				setLoadingStatus((prev) => {
					return {
						...prev,
						unlock: {
							...prev.unlock,
							[unlock.trackId.toString()]: { isLoading: false, message: '' }
						}
					};
				});
				queueNotification({
					header: 'Success!',
					message: 'Unlock successful.',
					status: NotificationStatus.SUCCESS
				});
				getLockedBalance();
			})
			.catch((error: any) => {
				console.error('ERROR:', error);
				setLoadingStatus((prev) => {
					return {
						...prev,
						unlock: {
							...prev.unlock,
							[unlock.trackId.toString()]: { isLoading: false, message: '' }
						}
					};
				});
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
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
		<Spin spinning={!api || !apiReady} indicator={<LoadingOutlined />}>
			<div className={className}>
				{noAccount
					? <GetAccountsButton />
					: null
				}
				<Form id='referendaUnlock'>
					<div>
						<Form.Item>
							<h1 className='dashboard-heading' >Unlock Opengov locks</h1>
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
								? <div className='text-sidebarBlue'>You currently have no referenda locks.</div>
								: <div className='text-sidebarBlue'>Your locked balance: <span className=' font-medium'>{formatBnBalance(String(lockedBalance), { numberAfterComma: 2, withUnit: true }, network)}.</span></div>
							}
							{
								votes.length ?
									<>
										<ul className='list-none flex flex-col text-sidebarBlue mt-3'>
											<li className='grid grid-cols-6 md:grid-cols-8 font-medium gap-x-5 py-1'>
												<span className='col-span-2'>Referendums</span>
												<span className='col-span-2'>Locked</span>
												<span className='col-span-2'>Unlocks At</span>
												<span className='col-span-2'></span>
											</li>
											<Divider className='my-1'/>
											{votes.map((vote) => (
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
														<span className='col-span-2'>{vote.unlocksAt}</span>
														<span className='col-span-2'>
															<Button
																size='small'
																className='bg-pink_primary rounded-md outline-none border-none text-white'
																onClick={() => handleRemove(vote)}
																loading={loadingStatus?.remove?.[vote?.refIndex?.toString()]?.isLoading}
															>
																Remove
															</Button>
														</span>
													</li>
													<Divider className='my-1'/>
												</>
											))}
										</ul>
										{/* <div>{unlocking ? <>Please Confirm to Unlock.</> : <>*Remove Votes will also call Unlock.</>}</div> */}
									</>
									: null
							}
							{
								unlocks.length ?
									<>
										<ul className='list-none flex flex-col text-sidebarBlue mt-3'>
											<li className='grid grid-cols-6 md:grid-cols-8 font-medium gap-x-5 py-1'>
												<span className='col-span-2'>Tracks</span>
												<span className='col-span-2'>Locked</span>
												<span className='col-span-2'></span>
											</li>
											<Divider className='my-1'/>
											{unlocks.map((unlock) => {
												const { amount, trackId } = unlock;
												const name = getTrackName(network, trackId);
												return (
													<>
														<li key={unlock.trackId.toString()} className='grid grid-cols-6 md:grid-cols-8 gap-x-5 py-1'>
															<span className='col-span-2'>
																<Link className='capitalize' href={`/${name.split('_').join('-')}`}>
																	{name.split('_').join(' ')}
																</Link>
															</span>
															<span className='col-span-2'>
																{formatBnBalance(String(amount), { numberAfterComma: 2, withUnit: true }, network)}
															</span>
															<span className='col-span-2'>
																<Button
																	size='small'
																	className='bg-pink_primary rounded-md outline-none border-none text-white'
																	onClick={() => handleUnlock(unlock)}
																	loading={loadingStatus?.unlock?.[unlock?.trackId?.toString()]?.isLoading}
																>
																	Unlock
																</Button>
															</span>
														</li>
														<Divider className='my-1'/>
													</>
												);
											})}
										</ul>
									</>
									: null
							}
						</Form.Item>
					</div>
				</Form>
				{isAccountLoading
					? <Loader className='loader-wrapper' />
					: null
				}
			</div>
		</Spin>
	);
};

export default ReferendaUnlock;