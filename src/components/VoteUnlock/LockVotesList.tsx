// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatedBalance } from '~src/util/formatedBalance';
import { CheckCircleFilled } from '@ant-design/icons';
import LockIcon from '~assets/icons/vote-lock.svg';
import UnlockIcon from '~assets/icons/unlock.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import { useEffect, useState } from 'react';
import { useNetworkSelector, useUserUnlockTokensDataSelector } from '~src/redux/selectors';
import { BN_MAX_INTEGER, formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import BN from 'bn.js';
import { NotificationStatus } from '~src/types';
import blockToTime from '~src/util/blockToTime';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useCurrentBlock } from '~src/hooks';
import { Button } from 'antd';
import queueNotification from '~src/ui-components/QueueNotification';
import Web3 from 'web3';
import { useApiContext } from '~src/context';
import { IUnlockTokenskData } from '~src/redux/tokenUnlocksData/@types';
import { handlePrevData } from '.';
import { setUserUnlockTokensData } from '~src/redux/tokenUnlocksData';
import { useDispatch } from 'react-redux';
import PinkLockIcon from '~assets/icons/pink-lock.svg';

interface Props {
	totalUnlockableBalance: BN;
	lockedBalance: BN;
	showBalances?: boolean;
	votesCollapsed?: boolean;
}
const abi = require('src/moonbeamConvictionVoting.json');
const contractAddress = process.env.NEXT_PUBLIC_CONVICTION_VOTING_PRECOMPILE;

const ZERO_BN = new BN(0);
const LockVotesList = ({ totalUnlockableBalance, lockedBalance, showBalances = true, votesCollapsed = false }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const unit = chainProperties[network]?.tokenSymbol;
	const { address, data } = useUserUnlockTokensDataSelector();
	const totalLockData = handlePrevData(data?.totalLockData);
	const totalOngoingData = handlePrevData(data?.totalOngoingData);
	const totalUnlockableData = handlePrevData(data?.totalUnlockableData);
	const [expandUnlocks, setExpandUnlocks] = useState<boolean>(!votesCollapsed);
	const [tokensData, setTokensData] = useState<IUnlockTokenskData[]>(
		[AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)
			? [...totalLockData, ...totalOngoingData, ...totalUnlockableData]
			: totalLockData.concat(totalOngoingData)
	);
	const currentBlockNumber = useCurrentBlock();

	const handleLoading = (index: number, loading: boolean) => {
		const newData = tokensData?.map((item, idx) => {
			if (index === idx) {
				return {
					...item,
					loading
				};
			}
			return item;
		});
		setTokensData(newData);
	};

	const onSuccess = (index: number, refId: BN) => {
		queueNotification({
			header: 'Success!',
			message: 'Tokens Unlock successfully.',
			status: NotificationStatus.SUCCESS
		});
		handleLoading(index, false);

		const lockData = totalLockData.filter((item) => !item?.refId.eq(refId));
		const ongoingData = totalOngoingData.filter((item) => !item?.refId.eq(refId));
		const unlockableData = totalUnlockableData.filter((item) => !item?.refId.eq(refId));
		dispatch(
			setUserUnlockTokensData({
				address,
				data: {
					totalLockData: lockData.map((item) => {
						return { ...item, endBlock: item.endBlock.toString(), refId: item.refId.toString(), total: item?.total?.toString() };
					}),
					totalOngoingData: ongoingData.map((item) => {
						return { ...item, endBlock: item.endBlock.toString(), refId: item.refId.toString(), total: item?.total?.toString() };
					}),
					totalUnlockableData: unlockableData.map((item) => {
						return { ...item, endBlock: item.endBlock.toString(), refId: item.refId.toString(), total: item?.total?.toString() };
					})
				}
			})
		);
		setTokensData([...handlePrevData(lockData), ...handlePrevData(ongoingData), ...handlePrevData(unlockableData)]);
	};

	const onFailed = (message: string, index: number) => {
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});
		handleLoading(index, false);
	};
	const handleRemoveOrUnlockVote = async (removing: boolean, refId: BN, trackId: BN | number, index: number) => {
		if (!api || !apiReady) return;
		handleLoading(index, true);

		const web3 = new Web3((window as any).ethereum);

		const chainId = await web3.eth.net.getId();
		const contract = new web3.eth.Contract(abi, contractAddress);

		if (!['moonbeam', 'moonbase', 'moonriver'].includes(network)) return;
		if (chainId !== chainProperties[network].chainId) {
			queueNotification({
				header: 'Wrong Network!',
				message: `Please change to ${network} network`,
				status: NotificationStatus.ERROR
			});

			handleLoading(index, false);
			return;
		}
		let tx = contract.methods.unlock(trackId, address);
		if (removing) {
			tx = contract.methods.removeVote(refId);
		}

		tx.send({
			from: address,
			to: contractAddress
		})
			.then((result: any) => {
				console.log(result);
				onSuccess(index, refId);
			})
			.catch((error: any) => {
				console.error('ERROR:', error);
				onFailed('Failed!', index);
			});
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit
		});
		setTokensData(
			[AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)
				? handlePrevData([...totalLockData, ...totalOngoingData, ...totalUnlockableData])
				: handlePrevData(totalLockData.concat(totalOngoingData))
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, data, address]);
	return (
		<div>
			{showBalances && (
				<div className='mt-4 flex items-center justify-between rounded-md bg-[#F6F7F9] p-3 text-sm tracking-[0.25%] text-lightBlue'>
					<span className='flex gap-2'>
						<CheckCircleFilled
							style={{ color: '#51D36E' }}
							className='rounded-full border-none bg-transparent text-base'
						/>
						Total Unlockable Balance
					</span>
					<span className='pr-[27px] text-base font-semibold text-bodyBlue'>
						{formatedBalance((totalUnlockableBalance.toString() || '0').toString(), unit, 2)} {unit}
					</span>
				</div>
			)}
			<div className={`${showBalances ? 'p-3' : 'px-3 py-0.5'} mt-4 rounded-md bg-[#F6F7F9]`}>
				{showBalances && (
					<div
						className={`flex items-center justify-between text-sm tracking-[0.25%] text-lightBlue ${
							tokensData.length > 0 && ' border-0 border-b-[1px] border-solid border-[#D2D8E0] pb-2'
						}`}
					>
						<span className='flex gap-2'>
							<LockIcon />
							Locked Balance
						</span>
						<span className='pr-[27px] text-base font-semibold text-bodyBlue'>
							{formatedBalance((lockedBalance.toString() || '0').toString(), unit, 2)} {unit}
						</span>
					</div>
				)}
				{[AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)
					? tokensData.length > 0 && (
							<div className='mt-3'>
								<div className='flex items-start justify-between pb-1 text-sm tracking-[0.25%] text-lightBlue'>
									<div className='mt-1 flex w-[190px] gap-2'>
										<UnlockIcon />
										<span className='flex flex-col gap-0.5'>
											{totalLockData.length
												? `Next unlock in ${blockToTime(totalLockData?.[0]?.endBlock, network).time}`
												: totalOngoingData?.length
												? `Ongoing: #${totalOngoingData?.[0]?.refId.toString()} `
												: `Unlockable: #${totalUnlockableData?.[0]?.refId.toString()}`}
										</span>
									</div>
									<Button
										loading={tokensData?.[0]?.loading}
										onClick={() => handleRemoveOrUnlockVote(!tokensData?.[0].endBlock.lt(currentBlockNumber || ZERO_BN), tokensData?.[0].refId, tokensData?.[0].track, 0)}
										className='flex items-center justify-start rounded-[4px] border-none bg-transparent text-xs font-medium text-pink_primary shadow-none hover:underline'
									>
										<PinkLockIcon className='mr-1' />
										{tokensData?.[0].endBlock?.lt(currentBlockNumber || ZERO_BN) ? 'Unlock Vote' : tokensData?.[0].endBlock?.eq(BN_MAX_INTEGER) ? 'Remove Vote' : null}
									</Button>
									<span
										className='flex w-[150px] items-center justify-end text-base font-semibold text-bodyBlue'
										onClick={() => setExpandUnlocks(!expandUnlocks)}
									>
										<span className='flex flex-col items-end'>
											<span className={`flex flex-col items-end justify-end ${tokensData.length <= 1 && 'pr-[27px]'}`}>
												{totalLockData.length
													? `${formatedBalance((totalLockData?.[0]?.total.toString() || '0').toString(), unit, 2)} `
													: `${formatedBalance((totalOngoingData?.[0]?.total.toString() || '0').toString(), unit, 2)} `}
												{unit}
											</span>
											{tokensData.length > 1 && (
												<span className='flex justify-end text-xs font-normal text-pink_primary'>{expandUnlocks ? 'Hide All Unlocks' : 'View All Unlocks'}</span>
											)}
										</span>
										{tokensData.length > 1 && <DownArrowIcon className={`cursor-pointer ${expandUnlocks && 'pink-color rotate-180'} -mt-4 ml-1`} />}
									</span>
								</div>
								{expandUnlocks && (
									<div className='max-h-[150px] overflow-y-auto'>
										{tokensData.slice(1).map((lock, index) => (
											<div
												className='flex items-center justify-between border-0 border-t-[1px] border-dotted border-[#D2D8E0] py-3 text-sm tracking-[0.25%] text-lightBlue'
												key={index}
											>
												<div className='flex w-[190px] items-center gap-2'>
													<UnlockIcon />
													<span className='flex flex-col gap-0.5'>
														{lock.endBlock.eq(BN_MAX_INTEGER)
															? `Ongoing: #${lock?.refId}`
															: lock.endBlock.lt(currentBlockNumber || ZERO_BN)
															? `Unlockable: #${lock?.refId.toString()}`
															: `Next unlock in ${blockToTime(lock?.endBlock, network).time}`}
													</span>
												</div>
												<Button
													loading={lock?.loading}
													onClick={() =>
														handleRemoveOrUnlockVote(!tokensData?.[0].endBlock.lt(currentBlockNumber || ZERO_BN), tokensData?.[0].refId, tokensData?.[0].track, index + 1)
													}
													className='flex items-center justify-start rounded-[4px] border-none bg-transparent text-xs font-medium text-pink_primary shadow-none hover:underline'
												>
													<PinkLockIcon className='mr-1' />
													{lock.endBlock.lt(currentBlockNumber || ZERO_BN) ? 'Unlock Vote' : lock.endBlock.eq(BN_MAX_INTEGER) ? 'Remove Vote' : null}
												</Button>
												<span className='flex w-[150px] items-center justify-end pr-[27px] text-base font-semibold text-bodyBlue'>
													{formatedBalance((lock?.total.toString() || '0').toString(), unit, 2)} {unit}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
					  )
					: tokensData.length > 0 && (
							<div className='mt-3'>
								<div className='flex items-start justify-between pb-1 text-sm tracking-[0.25%] text-lightBlue'>
									<div className='mt-1 flex gap-2'>
										<UnlockIcon />
										<span className='flex flex-col gap-0.5'>
											{totalLockData.length ? `Next unlock in ${blockToTime(totalLockData?.[0]?.endBlock, network).time}` : `Ongoing: #${totalOngoingData[0]?.refId}`}
										</span>
									</div>
									<span
										className='flex items-center text-base font-semibold text-bodyBlue'
										onClick={() => setExpandUnlocks(!expandUnlocks)}
									>
										<span className='flex flex-col items-end'>
											<span className={`flex flex-col items-end justify-end ${tokensData.length <= 1 && 'pr-[27px]'}`}>
												{totalLockData.length
													? `${formatedBalance((totalLockData?.[0]?.total.toString() || '0').toString(), unit, 2)} `
													: `${formatedBalance((totalOngoingData?.[0]?.total.toString() || '0').toString(), unit, 2)} `}
												{unit}
											</span>
											{tokensData.length > 1 && (
												<span className='flex justify-end text-xs font-normal text-pink_primary'>{expandUnlocks ? 'Hide All Unlocks' : 'View All Unlocks'}</span>
											)}
										</span>
										{tokensData.length > 1 && <DownArrowIcon className={`cursor-pointer ${expandUnlocks && 'pink-color rotate-180'} -mt-4 ml-1`} />}
									</span>
								</div>
								{expandUnlocks && (
									<div className='max-h-[150px] overflow-y-auto'>
										{tokensData.slice(1).map((lock, index) => (
											<div
												className='borer-[#D2D8E0] flex items-center justify-between border-0 border-t-[1px] border-dotted border-[#D2D8E0] py-3 text-sm tracking-[0.25%] text-lightBlue'
												key={index}
											>
												<div className='flex items-center gap-2'>
													<UnlockIcon />
													<span className='flex flex-col gap-0.5'>
														{lock.endBlock.eq(BN_MAX_INTEGER) ? `Ongoing: #${lock?.refId}` : `Next unlock in ${blockToTime(lock?.endBlock, network).time}`}
													</span>
												</div>
												<span className='flex items-center pr-[27px] text-base font-semibold text-bodyBlue'>
													{formatedBalance((lock?.total.toString() || '0').toString(), unit, 2)} {unit}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
					  )}
			</div>
		</div>
	);
};
export default LockVotesList;
