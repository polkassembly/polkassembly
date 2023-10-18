// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { CheckCircleFilled } from '@ant-design/icons';
import userProfileBalances from '~src/util/userProfieBalances';
import BN from 'bn.js';
import { BN_MAX_INTEGER, formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector } from '~src/redux/selectors';

import UnlockBoxIcon from '~assets/icons/unlock-box.svg';
import CloseIcon from '~assets/icons/close.svg';
import LockIcon from '~assets/icons/vote-lock.svg';
import UnlockIcon from '~assets/icons/unlock.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import WhiteUnlockIcon from '~assets/icons/white-lock.svg';
import { ApiPromise } from '@polkadot/api';
import blockToTime from '~src/util/blockToTime';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import executeTx from '~src/util/executeTx';
import Address from '~src/ui-components/Address';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import queueNotification from '~src/ui-components/QueueNotification';
import { LoadingStatusType, NotificationStatus } from '~src/types';
interface Props {
	className?: string;
	addresses: string[];
}
export interface ILockData {
	track: BN;
	endBlock: BN;
	locked: string;
	refId: BN;
	total: BN;
}
const ZERO_BN = new BN(0);

const VoteUnlock = ({ className, addresses }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const unit = chainProperties[network]?.tokenSymbol;
	const [totalUnlockableBalance, setTotalUnlockableBalance] = useState<BN>(ZERO_BN);
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const [canUnlock, setCanUnlock] = useState<boolean>(!totalUnlockableBalance.eq(ZERO_BN));
	const [address, setAddress] = useState<string>(addresses[0]);
	const [open, setOpen] = useState<boolean>(false);
	const [expandUnlocks, setExpandUnlocks] = useState<boolean>(true);
	const [totalUnlockData, setTotalUnlockData] = useState<ILockData[]>([]);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });

	const items: ItemType[] =
		addresses?.map((address) => {
			return {
				key: address,
				label: (
					<div key={address}>
						<Address
							address={address}
							displayInline
							disableAddressClick
						/>
					</div>
				)
			};
		}) || [];

	const getAllLockData = (api: ApiPromise, votes: [classId: BN, refIds: BN[], casting: any][], referenda: [BN, any][]): ILockData[] => {
		const lockPeriod = api?.consts?.convictionVoting?.voteLockingPeriod as BN;
		const locks: ILockData[] = [];

		for (let i = 0, voteCount = votes.length; i < voteCount; i++) {
			const [track, , casting] = votes[i];

			for (let i = 0, castCount = casting.votes.length; i < castCount; i++) {
				const [refId, accountVote] = casting.votes[i];
				const refInfo = referenda.find(([id]) => Number(id) === Number(refId));

				if (refInfo) {
					const [, tally] = refInfo;

					let total: BN | undefined;
					let endBlock: BN | undefined;
					let conviction = 0;
					let locked = 'None';

					if (accountVote.isStandard) {
						const { balance, vote } = accountVote.asStandard;

						total = balance;

						if ((tally.isApproved && vote.isAye) || (tally.isRejected && vote.isNay)) {
							conviction = vote.conviction.index;
							locked = vote.conviction.type;
						}
					} else if (accountVote.isSplit) {
						const { aye, nay } = accountVote.asSplit;

						total = aye.add(nay);
					} else if (accountVote.isSplitAbstain) {
						const { abstain, aye, nay } = accountVote.asSplitAbstain;

						total = aye.add(nay).add(abstain);
					} else {
						console.error(`Unable to handle ${accountVote.type}`);
					}

					if (tally.isOngoing) {
						endBlock = BN_MAX_INTEGER;
					} else if (tally.isKilled) {
						endBlock = tally.asKilled;
					} else if (tally.isCancelled || tally.isTimedOut) {
						endBlock = tally.isCancelled ? tally.asCancelled[0] : tally.asTimedOut[0];
					} else if (tally.isApproved || tally.isRejected) {
						endBlock = lockPeriod.muln(conviction).add(tally.isApproved ? tally.asApproved[0] : tally.asRejected[0]);
					} else {
						console.error(`Unable to handle ${tally.type}`);
					}

					if (total && endBlock) {
						locks.push({ endBlock, locked, refId, total, track });
					}
				}
			}
		}

		return locks;
	};

	const getUnlockParams = (address: string, lockClasses?: any[]): [address: string, track: BN][] | undefined => {
		if (lockClasses) {
			return lockClasses.map((track) => [address, track[0]]);
		}
		return undefined;
	};

	const handleSetUnlockableBalance = async (locks: ILockData[] | null) => {
		if (!api || !apiReady) return;
		let balance: BN = ZERO_BN;
		const currentBlockNumber = await api?.derive?.chain?.bestNumber();
		if (locks) {
			locks.filter((lock) => {
				if (lock.endBlock.gte(currentBlockNumber || ZERO_BN)) {
					balance = balance.add(lock.total);
				}
				balance = balance.add(ZERO_BN);
			});
		}

		setTotalUnlockableBalance(balance);
		setCanUnlock(!balance.eq(ZERO_BN));
	};

	const getReferendaParams = (votes?: [track: BN, refIds: BN[], casting: any][]): BN[] | undefined => {
		if (votes && votes?.length) {
			const refIds = votes.reduce<BN[]>((all, [, refIds]) => all.concat(refIds), []);

			if (refIds.length) {
				return refIds;
			}
		}

		return undefined;
	};

	const getLockData = async () => {
		if (!api || !apiReady) return;
		const lockClasses = await api?.query?.convictionVoting?.classLocksFor(address)?.then((e) => e.toHuman());
		const unlockParams = getUnlockParams(address, lockClasses as unknown as BN[]);
		const votes = unlockParams ? await api?.query?.convictionVoting?.votingFor?.multi(unlockParams as any[]) : null;
		const customizeVotes = votes
			? votes
					.map((vote, index) => {
						if (!vote.isCasting) {
							return null;
						}

						const casting = vote.asCasting;

						return [unlockParams?.[index][1], casting.votes.map(([refId]) => refId), casting];
					})
					.filter((vote) => !!vote)
			: null;
		const refParams = customizeVotes ? getReferendaParams(customizeVotes as any[]) : null;
		const referenda = refParams ? await api?.query?.referenda?.referendumInfoFor?.multi(refParams as BN[]) : null;
		const customizeReferenda = referenda
			? referenda?.map((ref, index) => {
					return ref?.isSome ? [refParams?.[index], ref.unwrap()] : null;
			  })
			: null;

		const totalUnlocks = customizeReferenda ? getAllLockData(api, customizeVotes as any[], customizeReferenda as [BN, any][]) : null;
		await handleSetUnlockableBalance(totalUnlocks);
		setTotalUnlockData(totalUnlocks ? totalUnlocks?.sort((a, b) => Number(a.endBlock.toString()) - Number(b.endBlock.toString())) : []);
	};
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const balances = await userProfileBalances({ address: address, api, apiReady, network });
			setLockedBalance(balances?.lockedBalance || ZERO_BN);
		})();
		getLockData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, addresses]);

	const getClearReferendaTx = (api: ApiPromise, address: string, ids: [BN, BN][], palletReferenda = 'convictionVoting'): SubmittableExtrinsic<'promise'> | null => {
		if (!api.tx.utility || !ids.length) {
			return null;
		}

		const variables = ids.map(([track, refId]) => api.tx[palletReferenda].removeVote(track, refId));

		ids
			.reduce((all: BN[], [track]) => {
				if (!all.find((id) => Number(id) === Number(track))) {
					all.push(track);
				}

				return all;
			}, [])
			.forEach((track): void => {
				variables.push(api.tx[palletReferenda].unlock(track, address));
			});

		return api.tx.utility.batch(variables);
	};

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Delegation successful.',
			status: NotificationStatus.SUCCESS
		});
		setLoadingStatus({ isLoading: false, message: 'Success!' });
		setOpen(false);
	};

	const onFailed = (message: string) => {
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});
		setLoadingStatus({ isLoading: false, message: 'Failed!' });
	};

	const handleUnlock = async () => {
		if (!api || !apiReady) return;
		const currentBlockNumber = await api.derive.chain.bestNumber();
		const ids = totalUnlockData
			.filter(({ endBlock }) => endBlock.gt(ZERO_BN) && currentBlockNumber.gt(endBlock as any))
			.map(({ track, refId }): [track: BN, refId: BN] => [track, refId]);

		const txVariable = {
			ids,
			referendaUnlockTx: getClearReferendaTx(api, address, ids)
		};
		if (!txVariable.referendaUnlockTx) return;
		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation' });

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'Unlock Transaction failed!',
			network,
			onFailed,
			onSuccess,
			setStatus: (status: string) => setLoadingStatus({ isLoading: true, message: status }),
			tx: txVariable.referendaUnlockTx
		});
	};
	return (
		<div className='flex flex-col gap-2'>
			{addresses.length > 1 && (
				<div>
					<Dropdown
						trigger={['click']}
						className={className}
						overlayClassName='z-[1056]'
						menu={{
							items: items,
							onClick: (e) => {
								setAddress(e.key);
							}
						}}
					>
						<div className='flex items-center justify-between rounded-[4px] border-[1px] border-solid border-[#D2D8E0] px-2 py-1'>
							<Address
								address={address}
								disableAddressClick
								displayInline
							/>
							<span className='mx-2 mb-1 flex items-center'>
								<DownArrowIcon />
							</span>
						</div>
					</Dropdown>
				</div>
			)}
			<Button
				onClick={() => canUnlock && setOpen(true)}
				className={`text-sm ${
					canUnlock ? 'border-[#407BFF] bg-[#f1f6ff] text-[#407BFF] ' : 'cursor-not-allowed border-pink_primary bg-[#fdedf7] text-pink_primary'
				} h-[40px] rounded-[4px]`}
			>
				Next unlock in {!canUnlock ? '0 days 0 hours' : blockToTime(totalUnlockData[0]?.endBlock, network).time}
			</Button>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				footer={false}
				className={`${className} ${poppins.className} ${poppins.variable}`}
				closeIcon={<CloseIcon />}
			>
				<Spin
					spinning={loadingStatus.isLoading}
					tip={loadingStatus.message}
				>
					<div>
						<div className='-mt-[90px] flex justify-center'>
							<UnlockBoxIcon />
						</div>

						<div className='mt-4 flex items-center justify-between rounded-md bg-[#F6F7F9] p-3 text-sm tracking-[0.25%] text-lightBlue'>
							<span className='flex gap-1'>
								<CheckCircleFilled
									style={{ color: '#51D36E' }}
									className='rounded-full border-none bg-transparent text-base'
								/>
								Total Unlockable Balance
							</span>
							<span className='mr-[27px] text-base font-semibold text-bodyBlue'>
								{formatedBalance((totalUnlockableBalance.toString() || '0').toString(), unit, 2)} {unit}
							</span>
						</div>
						<div className='mt-4 rounded-md bg-[#F6F7F9] p-3'>
							<div className='flex items-center justify-between border-0 border-b-[1px] border-solid border-[#D2D8E0] pb-2 text-sm tracking-[0.25%] text-lightBlue'>
								<span className='flex gap-1'>
									<LockIcon />
									Locked Balance
								</span>
								<span className='pr-[27px] text-base font-semibold text-bodyBlue'>
									{formatedBalance((lockedBalance.toString() || '0').toString(), unit, 2)} {unit}
								</span>
							</div>
							<div className='mt-3'>
								<div className='flex items-start justify-between pb-2 text-sm tracking-[0.25%] text-lightBlue'>
									<div className='mt-1 flex gap-1'>
										<UnlockIcon />
										<span className='flex flex-col gap-0.5'>Next unlock in {blockToTime(totalUnlockData[0]?.endBlock, network).time}</span>
									</div>
									<span
										className='flex items-center text-base font-semibold text-bodyBlue'
										onClick={() => setExpandUnlocks(!expandUnlocks)}
									>
										<span className='flex flex-col items-end'>
											<span className={`flex  flex-col items-end justify-end ${totalUnlockData.length <= 1 && 'pr-[27px]'}`}>
												{formatedBalance((totalUnlockData[0]?.total.toString() || '0').toString(), unit, 2)} {unit}
											</span>
											{totalUnlockData.length > 1 && (
												<span className='flex justify-end text-xs font-normal text-pink_primary'>{expandUnlocks ? 'Hide All Unlocks' : 'View All Unlocks'}</span>
											)}
										</span>
										{totalUnlockData.length > 1 && <DownArrowIcon className={`cursor-pointer ${expandUnlocks && 'pink-color rotate-180'} -mt-4 ml-1`} />}{' '}
									</span>
								</div>
								{expandUnlocks && (
									<div className='max-h-[200px] overflow-y-auto'>
										{totalUnlockData.slice(1).map((lock, index) => (
											<div
												className='borer-[#D2D8E0] flex items-center justify-between border-0 border-t-[1px] border-dotted border-[#D2D8E0] py-3 text-sm tracking-[0.25%] text-lightBlue'
												key={index}
											>
												<div className='flex items-center gap-1'>
													<UnlockIcon />
													<span className='flex flex-col gap-0.5'>Next unlock in {blockToTime(lock?.endBlock, network).time}</span>
												</div>
												<span className='mr-[27px] flex items-center text-base font-semibold text-bodyBlue'>
													{formatedBalance((lock?.total.toString() || '0').toString(), unit, 2)} {unit}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
					<div className='-mx-6 mt-8 flex items-center border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6'>
						<Button
							onClick={() => handleUnlock()}
							disabled={!canUnlock}
							className={`mt-4 flex h-[40px] w-[100%] items-center justify-center rounded-[4px] border-none bg-pink_primary text-sm font-medium tracking-wide text-white ${
								!canUnlock && 'opacity-50'
							}`}
						>
							<WhiteUnlockIcon className='mr-1' />
							Unlock Tokens
						</Button>
					</div>
				</Spin>
			</Modal>
		</div>
	);
};
export default VoteUnlock;
