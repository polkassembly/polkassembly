// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import queueNotification from '~src/ui-components/QueueNotification';
import { EVoteDecisionType, LoadingStatusType, NotificationStatus } from 'src/types';
import { Divider, Form } from 'antd';
import Loader from 'src/ui-components/Loader';
import { BrowserProvider, Contract, formatUnits } from 'ethers';

import { chainProperties } from '../../global/networkConstants';
import AccountSelectionForm from '../../ui-components/AccountSelectionForm';
import formatBnBalance from '../../util/formatBnBalance';
import getNetwork from '../../util/getNetwork';
import { useApiContext } from '~src/context';
import addEthereumChain from '~src/util/addEthereumChain';
import { getUnlockVotesDetails } from './ReferendaUnlock';
import { useNetworkSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const abi = require('../../moonbeamAbi.json');

const currentNetwork = getNetwork();

interface IDemocracyUnlockProps {
	className?: string;
	isBalanceUpdated: boolean;
	setIsBalanceUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Vote {
	refIndex: BN;
	vote: boolean;
	amount: BN;
	conviction: number;
	ayeBalance: BN;
	nayBalance: BN;
	abstainBalance: BN;
	voteType: EVoteDecisionType | null;
}

const contractAddress = process.env.NEXT_PUBLIC_DEMOCRACY_PRECOMPILE || '';

const DemocracyUnlock: FC<IDemocracyUnlockProps> = ({ className, isBalanceUpdated, setIsBalanceUpdated }) => {
	const { network } = useNetworkSelector();
	const [address, setAddress] = useState<string>('');
	const [votes, setVotes] = useState<Vote[]>([]);
	const [lockedBalance, setLockedBalance] = useState<BN>(new BN(0));
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [unlocksAt, setUnlocksAt] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [canBeUnlocked, setCanBeUnlocked] = useState<boolean>(false);
	const { api, apiReady } = useApiContext();

	useEffect(() => {
		if (!accounts.length) {
			getAccounts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length]);

	useEffect(() => {
		if (api && apiReady && address) {
			getLockedBalance();
		}
	}, [api, apiReady, address]); // eslint-disable-line react-hooks/exhaustive-deps

	const getLockedBalance = async () => {
		if (!api || !apiReady || !api?.query?.democracy || !api?.query?.democracy?.votingOf) {
			return;
		}

		const votingInfo = await api.query.democracy.votingOf(address);

		setUnlocksAt(votingInfo.asDirect.prior[0].toString());

		setVotes(
			votingInfo.asDirect.votes.map((vote) => {
				const refIndex = vote[0];
				const details = getUnlockVotesDetails(vote[1]);
				return {
					...details,
					refIndex
				};
			})
		);

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

	const handleRemove = async (refIndex: BN) => {
		if (!api) {
			return;
		}

		if (!apiReady) {
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

		setLoadingStatus({ isLoading: true, message: 'Waiting for confirmation' });

		const contract = new Contract(contractAddress, abi, await web3.getSigner());

		const gasPrice = await contract.remove_vote.estimateGas(refIndex.toString());
		const estimatedGasPriceInWei = new BN(formatUnits(gasPrice, 'wei'));

		// increase gas by 15%
		const gasLimit = estimatedGasPriceInWei.div(new BN(100)).mul(new BN(15)).add(estimatedGasPriceInWei).toString();

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		await contract
			.remove_vote(refIndex.toString(), {
				gasLimit
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

		setLoadingStatus({ isLoading: true, message: 'Waiting for confirmation' });

		const contract = new Contract(contractAddress, abi, await web3.getSigner());

		const gasPrice = await contract.unlock.estimateGas(address);
		const estimatedGasPriceInWei = new BN(formatUnits(gasPrice, 'wei'));

		// increase gas by 15%
		const gasLimit = estimatedGasPriceInWei.div(new BN(100)).mul(new BN(15)).add(estimatedGasPriceInWei).toString();

		// estimate gas.
		// https://docs.moonbeam.network/builders/interact/eth-libraries/deploy-contract/#interacting-with-the-contract-send-methods

		await contract
			.unlock(address, {
				gasLimit
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

	const GetAccountsButton = () => (
		<Form>
			<Form.Item className='button-container'>
				<CustomButton
					onClick={getAccounts}
					className='mt-2 border-none'
					type='primary'
					text='Vote'
					buttonsize='xs'
				/>
			</Form.Item>
		</Form>
	);

	const noAccount = accounts.length === 0;

	return (
		<div className={className}>
			{noAccount ? <GetAccountsButton /> : null}
			<Form id='democracyUnlock'>
				<div>
					<Form.Item>
						<h1 className='dashboard-heading dark:text-separatorDark'>Unlock democracy locks</h1>
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
							<div className='text-sidebarBlue dark:text-separatorDark'>You currently have no democracy locks.</div>
						) : (
							<div className='text-sidebarBlue dark:text-separatorDark'>
								Your locked balance:{' '}
								<span className=' font-medium dark:text-separatorDark'>{formatBnBalance(String(lockedBalance), { numberAfterComma: 2, withUnit: true }, network)}.</span>
								{unlocksAt === '0' ? (
									<div className=' font-medium dark:text-separatorDark'>Available to be immediately unlocked.</div>
								) : (
									<div>
										UnlocksAt: <span className='font-medium dark:text-separatorDark'>{unlocksAt}</span>
									</div>
								)}{' '}
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
									{votes.map((vote, id) => (
										<>
											<li
												key={vote.refIndex.toString()}
												className='grid grid-cols-6 items-center gap-x-5 py-1 md:grid-cols-8'
											>
												<span className='col-span-2'>
													<Link
														className='dark:text-separatorDark'
														href={`/referendum/${vote.refIndex.toString()}`}
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
															<span className='col-span-2'> Abstain: {formatBnBalance(String(vote.abstainBalance), { numberAfterComma: 2, withUnit: true }, network)}</span>
														)}
													</div>
												)}
												<span className='col-span-2 dark:text-separatorDark'>{unlocksAt}</span>
												<span className='col-span-2 dark:text-separatorDark'>
													{id === 0 ? (
														canBeUnlocked ? (
															<CustomButton
																onClick={handleUnlock}
																loading={loadingStatus.isLoading}
																type='primary'
																text='Unlock'
																buttonsize='sm'
															/>
														) : (
															<CustomButton
																onClick={() => handleRemove(vote.refIndex)}
																loading={loadingStatus.isLoading}
																type='primary'
																text='Remove'
																buttonsize='sm'
															/>
														)
													) : (
														<></>
													)}
												</span>
											</li>
											<Divider className='my-1' />
										</>
									))}
								</ul>
								{/* <div>{unlocking ? <>Please Confirm to Unlock.</> : <>*Remove Votes will also call Unlock.</>}</div> */}
							</>
						) : (
							<>
								<CustomButton
									onClick={handleUnlock}
									loading={loadingStatus.isLoading}
									type='primary'
									text='Unlock'
									className='mt-2'
									buttonsize='sm'
								/>
							</>
						)}
					</Form.Item>
				</div>
			</Form>
			{isAccountLoading || loadingStatus.isLoading ? (
				<Loader
					className='loader-wrapper'
					text={loadingStatus.message}
				/>
			) : null}
		</div>
	);
};

export default DemocracyUnlock;
