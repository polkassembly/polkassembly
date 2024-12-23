// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import queueNotification from '~src/ui-components/QueueNotification';
import { EVoteDecisionType, NotificationStatus } from 'src/types';
import { Divider, Form, Spin } from 'antd';
import Loader from 'src/ui-components/Loader';
import { BrowserProvider, Contract, formatUnits } from 'ethers';

import { chainProperties } from '../../global/networkConstants';
import AccountSelectionForm from '../../ui-components/AccountSelectionForm';
import formatBnBalance from '../../util/formatBnBalance';
import getNetwork from '../../util/getNetwork';
import { useApiContext } from '~src/context';
import addEthereumChain from '~src/util/addEthereumChain';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { useNetworkSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const abi = require('../../moonbeamConvictionVoting.json');

const currentNetwork = getNetwork();

const ZERO_BN = new BN(0);
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
	ayeBalance: BN;
	nayBalance: BN;
	abstainBalance: BN;
	voteType: EVoteDecisionType | null;
}

interface Unlock {
	trackId: number;
	amount: BN;
}

const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE || '';

interface IReferendaUnlockStatus {
	remove: {
		[key: string]: { isLoading: boolean; message: string };
	};
	unlock: {
		[key: string]: { isLoading: boolean; message: string };
	};
}
export const getUnlockVotesDetails = (vote: any) => {
	let ayeBalance = ZERO_BN;
	let nayBalance = ZERO_BN;
	let abstainBalance = ZERO_BN;
	let balance = ZERO_BN;
	let voteType = null;
	let conviction = 0;
	if (vote?.isSplit) {
		conviction = 0.1;
		ayeBalance = vote?.asSplit.aye || '0';
		nayBalance = vote?.asSplit.nay || '0';
		voteType = EVoteDecisionType.SPLIT;
	} else if (vote?.isSplitAbstain) {
		conviction = 0.1;
		ayeBalance = vote?.asSplitAbstain.aye || '0';
		nayBalance = vote?.asSplitAbstain.nay || '0';
		abstainBalance = vote?.asSplitAbstain.abstain || '0';
		voteType = EVoteDecisionType.ABSTAIN;
	} else if (vote?.asStandard !== undefined) {
		balance = vote?.asStandard.balance;
		if (vote?.asStandard.vote.isAye) {
			voteType = EVoteDecisionType.AYE;
		} else {
			voteType = EVoteDecisionType.NAY;
		}

		if (vote?.asStandard.vote.conviction.isLocked1x) {
			conviction = 1;
		} else if (vote?.asStandard.vote.conviction.isLocked2x) {
			conviction = 2;
		} else if (vote?.asStandard.vote.conviction.isLocked3x) {
			conviction = 3;
		} else if (vote?.asStandard.vote.conviction.isLocked4x) {
			conviction = 4;
		} else if (vote?.asStandard.vote.conviction.isLocked5x) {
			conviction = 5;
		} else if (vote?.asStandard.vote.conviction.isLocked6x) {
			conviction = 6;
		} else {
			conviction = 0.1;
		}
	}
	return {
		abstainBalance,
		amount: balance,
		ayeBalance,
		conviction: conviction,
		nayBalance,
		vote: !!voteType,
		voteType
	};
};

const ReferendaUnlock: FC<IReferendaUnlockProps> = ({ className, isBalanceUpdated, setIsBalanceUpdated }) => {
	const { network } = useNetworkSelector();
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
		votingInfoEntries.forEach(([keys, votingInfo]) => {
			const arr = keys.toHuman() as [string, number];
			votes.push(
				...votingInfo.asCasting.votes.map((vote) => {
					const refIndex = vote[0];
					const details = getUnlockVotesDetails(vote[1]);

					return {
						...details,
						refIndex,
						trackId: Number(arr[1]),
						unlocksAt: votingInfo.asCasting.prior[0].toString()
					};
				})
			);
		});

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
		const ethereum = (window as any)?.ethereum;

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

		setAccounts(
			addresses.map((address: string): InjectedAccountWithMeta => {
				const account = {
					address,
					meta: {
						genesisHash: null,
						name: 'metamask',
						source: 'metamask'
					}
				};

				return account;
			})
		);

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
		const web3 = new BrowserProvider((window as any).ethereum);

		const { chainId } = await web3.getNetwork();

		if (Number(chainId.toString()) !== chainProperties[currentNetwork].chainId) {
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

		const signer = await web3.getSigner();

		const contract = new Contract(contractAddress, abi, signer);

		const gasPrice = await contract.removeVoteForTrack.estimateGas(vote.refIndex.toString(), vote.trackId);
		const estimatedGasPriceInWei = new BN(formatUnits(gasPrice, 'wei'));

		// increase gas by 15%
		const gasLimit = estimatedGasPriceInWei.div(new BN(100)).mul(new BN(15)).add(estimatedGasPriceInWei).toString();

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		console.log('Removing vote for referenda #', vote.refIndex.toString());

		await contract
			.removeVoteForTrack(vote.refIndex.toString(), vote.trackId, {
				gasLimit
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
		const web3 = new BrowserProvider((window as any).ethereum);

		const { chainId } = await web3.getNetwork();

		if (Number(chainId.toString()) !== chainProperties[currentNetwork].chainId) {
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

		const contract = new Contract(contractAddress, abi, await web3.getSigner());

		const gasPrice = await contract.unlock.estimateGas(unlock.trackId, address);
		const estimatedGasPriceInWei = new BN(formatUnits(gasPrice, 'wei'));

		// increase gas by 15%
		const gasLimit = estimatedGasPriceInWei.div(new BN(100)).mul(new BN(15)).add(estimatedGasPriceInWei).toString();

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		await contract
			.unlock(unlock.trackId, address, {
				gasLimit
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

	const GetAccountsButton = () => (
		<Form>
			<Form.Item className='button-container'>
				<CustomButton
					onClick={getAccounts}
					className='mt-2 border-none'
					variant='primary'
					text='Vote'
					buttonsize='xs'
				/>
			</Form.Item>
		</Form>
	);

	const noAccount = accounts.length === 0;

	return (
		<Spin
			spinning={!api || !apiReady}
			indicator={<LoadingOutlined />}
		>
			<div className={className}>
				{noAccount ? <GetAccountsButton /> : null}
				<Form id='referendaUnlock'>
					<div>
						<Form.Item>
							<h1 className='dashboard-heading dark:text-separatorDark'>Unlock Opengov locks</h1>
							{accounts.length > 0 ? (
								<AccountSelectionForm
									title='Choose account'
									accounts={accounts}
									address={address}
									onAccountChange={onAccountChange}
									withBalance
									isBalanceUpdated={isBalanceUpdated}
								/>
							) : (
								<span className='text-sidebarBlue dark:text-separatorDark'>
									No accounts found, Please approve request from your wallet and/or <a href='javascript:window.location.reload(true)'>refresh</a> and try again!{' '}
								</span>
							)}
						</Form.Item>
					</div>
					<div>
						<Form.Item>
							{lockedBalance.isZero() ? (
								<div className='text-sidebarBlue dark:text-separatorDark'>You currently have no referenda locks.</div>
							) : (
								<div className='text-sidebarBlue dark:text-separatorDark'>
									Your locked balance: <span className=' font-medium'>{formatBnBalance(String(lockedBalance), { numberAfterComma: 2, withUnit: true }, network)}.</span>
								</div>
							)}
							{votes.length ? (
								<>
									<ul className='mt-3 flex list-none flex-col text-sidebarBlue'>
										<li className='grid grid-cols-6 gap-x-5 py-1 font-medium md:grid-cols-8'>
											<span className='col-span-2 dark:text-separatorDark'>Referendums</span>
											<span className='col-span-2 dark:text-separatorDark'>Locked</span>
											<span className='col-span-2 dark:text-separatorDark'>Unlocks At</span>
											<span className='col-span-2 dark:text-separatorDark'></span>
										</li>
										<Divider className='my-1' />
										{votes.map((vote) => (
											<>
												<li
													key={vote.refIndex.toString()}
													className='grid grid-cols-6 items-center gap-x-5 py-1 md:grid-cols-8'
												>
													<span className='col-span-2'>
														<Link
															className='dark:text-separatorDark'
															href={`/referenda/${vote.refIndex.toString()}`}
														>
															Referendum #{vote.refIndex.toString()}
														</Link>
													</span>
													{vote.voteType === EVoteDecisionType.AYE || vote?.voteType === EVoteDecisionType.NAY ? (
														<span className='col-span-2 dark:text-separatorDark'>
															{vote.voteType === EVoteDecisionType.AYE ? 'Aye' : 'Nay'}
															{': '}
															{formatBnBalance(String(vote.amount), { numberAfterComma: 2, withUnit: true }, network)}
														</span>
													) : (
														<div className='col-span-2 flex flex-col dark:text-separatorDark'>
															<span className='col-span-2'> Aye: {formatBnBalance(String(vote.ayeBalance), { numberAfterComma: 2, withUnit: true }, network)}</span>
															<span className='col-span-2'> Nay: {formatBnBalance(String(vote.nayBalance), { numberAfterComma: 2, withUnit: true }, network)}</span>
															{vote.voteType === EVoteDecisionType.ABSTAIN && (
																<span className='col-span-2 dark:text-separatorDark'>
																	{' '}
																	Abstain: {formatBnBalance(String(vote.abstainBalance), { numberAfterComma: 2, withUnit: true }, network)}
																</span>
															)}
														</div>
													)}
													<span className='col-span-2 dark:text-separatorDark'>{vote.unlocksAt}</span>
													<span className='col-span-2'>
														<CustomButton
															onClick={() => handleRemove(vote)}
															loading={loadingStatus?.remove?.[vote?.refIndex?.toString()]?.isLoading}
															className='border-none'
															variant='primary'
															text='Remove'
															buttonsize='xs'
														/>
													</span>
												</li>
												<Divider className='my-1' />
											</>
										))}
									</ul>
									{/* <div>{unlocking ? <>Please Confirm to Unlock.</> : <>*Remove Votes will also call Unlock.</>}</div> */}
								</>
							) : null}
							{unlocks.length ? (
								<>
									<ul className='mt-3 flex list-none flex-col text-sidebarBlue dark:text-separatorDark'>
										<li className='grid grid-cols-6 gap-x-5 py-1 font-medium md:grid-cols-8'>
											<span className='col-span-2 dark:text-separatorDark'>Tracks</span>
											<span className='col-span-2 dark:text-separatorDark'>Locked</span>
											<span className='col-span-2 dark:text-separatorDark'></span>
										</li>
										<Divider className='my-1' />
										{unlocks.map((unlock) => {
											const { amount, trackId } = unlock;
											const name = getTrackNameFromId(network, trackId);
											return (
												<>
													<li
														key={unlock.trackId.toString()}
														className='grid grid-cols-6 gap-x-5 py-1 md:grid-cols-8'
													>
														<span className='col-span-2'>
															<Link
																className='capitalize dark:text-separatorDark'
																href={`/${name.split('_').join('-')}`}
															>
																{name.split('_').join(' ')}
															</Link>
														</span>
														<span className='col-span-2 dark:text-separatorDark'>{formatBnBalance(String(amount), { numberAfterComma: 2, withUnit: true }, network)}</span>
														<span className='col-span-2 dark:text-separatorDark'>
															<CustomButton
																onClick={() => handleUnlock(unlock)}
																loading={loadingStatus?.unlock?.[unlock?.trackId?.toString()]?.isLoading}
																className='border-none'
																variant='primary'
																text='Unlock'
																buttonsize='xs'
															/>
														</span>
													</li>
													<Divider className='my-1' />
												</>
											);
										})}
									</ul>
								</>
							) : null}
						</Form.Item>
					</div>
				</Form>
				{isAccountLoading ? <Loader className='loader-wrapper' /> : null}
			</div>
		</Spin>
	);
};

export default ReferendaUnlock;
