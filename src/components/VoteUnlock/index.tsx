// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Button, Empty, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import userProfileBalances from '~src/util/userProfieBalances';
import BN from 'bn.js';
import { BN_MAX_INTEGER, formatBalance } from '@polkadot/util';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import UnlockBoxIcon from '~assets/icons/unlock-box.svg';
import CloseIcon from '~assets/icons/close.svg';

import WhiteUnlockIcon from '~assets/icons/white-lock.svg';
import { ApiPromise } from '@polkadot/api';
import blockToTime from '~src/util/blockToTime';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import { ILockData, LoadingStatusType, NotificationStatus, Wallet } from '~src/types';
import Address from '~src/ui-components/Address';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import styled from 'styled-components';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import LockVotesList from './LockVotesList';
import VoteUnlockSuccessState from './VoteUnlockSuccessState';

interface Props {
	className?: string;
	addresses: string[];
}

const ZERO_BN = new BN(0);

const VoteUnlock = ({ className, addresses }: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress, loginWallet } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const unit = chainProperties[network]?.tokenSymbol;
	const [totalUnlockableBalance, setTotalUnlockableBalance] = useState<BN>(ZERO_BN);
	const [lockedBalance, setLockedBalance] = useState<BN>(ZERO_BN);
	const [open, setOpen] = useState<boolean>(false);
	const [totalLockData, setTotalLockData] = useState<ILockData[]>([]);
	const [totalOngoingData, setTotalOngoingData] = useState<ILockData[]>([]);
	const [totalUnlockableData, setTotalUnlockableData] = useState<ILockData[]>([]);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [address, setAddress] = useState<string>(addresses[0]);
	const [openChangeAddressModal, setOpenChangeAddressModal] = useState<boolean>(false);
	const [openSuccessState, setOpenSuccessState] = useState<boolean>(false);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit
		});
		if (!api || !apiReady || !loginAddress || !loginWallet) return;

		(async () => {
			const data = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet as Wallet, loginAddress, network });
			setAddress(data?.account || '');
		})();
	}, [network, loginAddress, loginWallet, unit, api, apiReady]);

	const getAllLockData = (api: ApiPromise, votes: [track: BN, refIds: BN[], casting: any][], referenda: [BN, any][]): ILockData[] => {
		const lockPeriod = api?.consts?.convictionVoting?.voteLockingPeriod as BN;
		const locks: ILockData[] = [];

		const convictionMultipliers = [0, 1, 2, 4, 8, 16, 32];
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
						endBlock = lockPeriod.muln(convictionMultipliers[conviction]).add(tally.isApproved ? tally.asApproved[0] : tally.asRejected[0]);
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

	const getReferendaParams = (votes?: [track: BN, refIds: BN[], casting: any][]): BN[] | undefined => {
		if (votes && votes?.length) {
			const refIds = votes.reduce<BN[]>((all, [, refIds]) => all.concat(refIds), []);

			if (refIds.length) {
				return refIds;
			}
		}

		return undefined;
	};

	const handleSetUnlockableBalance = (totalUnlockableData: ILockData[]) => {
		if (!api || !apiReady) return;
		let balance: BN = ZERO_BN;

		totalUnlockableData.map((unlock) => {
			if (unlock.total.gte(balance)) {
				balance = unlock.total;
			}
		});
		setTotalUnlockableBalance(balance);
	};

	const handleLockUnlockData = async (data: ILockData[] | null, currentBlockNumber: BN) => {
		if (!data) return;
		const locksData = data
			?.filter((unlock) => unlock.endBlock.gt(currentBlockNumber) && !unlock.endBlock.eq(BN_MAX_INTEGER))
			.map((unlock) => {
				return { ...unlock, endBlock: unlock.endBlock.sub(currentBlockNumber) };
			})
			?.sort((a, b) => Number(a.endBlock.toString()) - Number(b.endBlock.toString()));

		const UnlockableData = data?.filter((unlock) => unlock.endBlock.lte(currentBlockNumber));

		setTotalLockData(locksData);
		setTotalOngoingData(data.filter((lock) => lock.endBlock.eq(BN_MAX_INTEGER)));
		setTotalUnlockableData(UnlockableData);
		handleSetUnlockableBalance(UnlockableData);
	};

	const getLockData = async (address: string) => {
		if (!api || !apiReady) return;
		setTotalLockData([]);
		setTotalOngoingData([]);
		setTotalUnlockableData([]);
		setTotalUnlockableBalance(ZERO_BN);

		const lockClasses = await api?.query?.convictionVoting?.classLocksFor(address)?.then((e) => e.toHuman());
		const unlockParams = getUnlockParams(address, lockClasses as unknown as BN[])?.filter((param) => !!param);
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
			? referenda
					?.map((ref, index) => {
						return ref?.isSome ? [refParams?.[index], ref.unwrap()] : null;
					})
					.filter((ref) => !!ref)
			: null;

		const data = customizeReferenda ? getAllLockData(api, customizeVotes as any[], customizeReferenda as [BN, any][]) : null;
		const currentBlockNumber = await api.derive.chain.bestNumber();
		handleLockUnlockData(data, currentBlockNumber);
	};

	const getClearReferendaTx = (api: ApiPromise, address: string, ids: [BN, BN][]): SubmittableExtrinsic<'promise'> | null => {
		if (!api || !apiReady || !ids.length) return null;

		const variables = ids.map(([track, refId]) => api.tx.convictionVoting.removeVote(track.toNumber(), refId.toNumber()));

		ids
			.reduce((all: BN[], [track]) => {
				if (!all.find((id) => Number(id) === Number(track))) {
					all.push(track);
				}

				return all;
			}, [])
			.forEach((track): void => {
				variables.push(api.tx.convictionVoting.unlock(track.toNumber(), address));
			});

		return api.tx.utility.batch(variables);
	};

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Tokens Unlock successfully.',
			status: NotificationStatus.SUCCESS
		});
		setOpenSuccessState(true);
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

		const ids = totalUnlockableData.map(({ track, refId }): [track: BN, refId: BN] => [track, refId]);
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

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const balances = await userProfileBalances({ address, api, apiReady, network });
			setLockedBalance(balances?.lockedBalance || ZERO_BN);
		})();
		getLockData(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);
	console.log(totalLockData, totalOngoingData, totalUnlockableData);
	return (
		<>
			<div className='boder-solid flex items-start justify-start'>
				<Button
					onClick={() => setOpen(true)}
					className={`text-sm ${
						!totalUnlockableBalance.eq(ZERO_BN) ? 'border-[#407BFF] bg-[#f1f6ff] text-[#407BFF] ' : 'cursor-not-allowed border-pink_primary bg-[#fdedf7] text-pink_primary '
					} h-[40px] rounded-[4px]`}
				>
					{!totalUnlockableBalance.eq(ZERO_BN)
						? 'Unlock Your Tokens'
						: totalLockData.length
						? `Next Unlock in ${blockToTime(totalLockData[0]?.endBlock, network).time}`
						: 'Unlock Your Tokens'}
				</Button>
			</div>
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
					className='mt-[150px]'
				>
					<div className='-mt-[100px] flex items-center justify-center'>
						<UnlockBoxIcon />
					</div>
					<div className='mt-6 flex h-10 w-full items-center justify-between rounded-[4px] border-none bg-[#F6F7F9] px-3'>
						<Address
							address={address}
							isTruncateUsername={false}
							displayInline
						/>
						<Button
							className='flex h-[26px] w-[70px] items-center justify-center rounded-[4px] border-none bg-pink_primary text-xs text-white'
							onClick={() => {
								setOpenChangeAddressModal(true);
								setOpen(false);
							}}
						>
							Change
						</Button>
					</div>
					{!totalUnlockableBalance.eq(ZERO_BN) || totalLockData.length !== 0 || totalOngoingData.length !== 0 ? (
						<LockVotesList
							lockedBalance={lockedBalance}
							totalUnlockableBalance={totalUnlockableBalance}
							totalLockData={totalLockData}
							totalOngoingData={totalOngoingData}
							totalUnlockableData={totalUnlockableData}
						/>
					) : (
						<Empty className='mt-4' />
					)}
					<div className='-mx-6 mt-8 flex items-center border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6'>
						<Button
							onClick={() => handleUnlock()}
							disabled={totalUnlockableBalance.eq(ZERO_BN)}
							className={`mt-4 flex h-[40px] w-[100%] items-center justify-center rounded-[4px] border-none bg-pink_primary text-sm font-medium tracking-wide text-white ${
								totalUnlockableBalance.eq(ZERO_BN) && 'opacity-50'
							}`}
						>
							<WhiteUnlockIcon className='mr-1' />
							Unlock Tokens
						</Button>
					</div>
				</Spin>
			</Modal>
			<AddressConnectModal
				open={openChangeAddressModal}
				setOpen={setOpenChangeAddressModal}
				localStorageAddressKeyName='unlockAddress'
				localStorageWalletKeyName='unlockWallet'
				walletAlertTitle='Unlock Your Tokens'
				linkAddressNeeded={false}
				onConfirm={(address: string) => {
					setAddress(address);
					setOpen(true);
				}}
			/>
			<VoteUnlockSuccessState
				open={openSuccessState}
				setOpen={setOpenSuccessState}
				lockedBalance={lockedBalance}
				totalUnlockableBalance={totalUnlockableBalance}
				totalLockData={totalLockData}
				totalOngoingData={totalOngoingData}
				totalUnlockableData={totalUnlockableData}
			/>
		</>
	);
};
export default styled(VoteUnlock)`
	.ant-spin-nested-loading .ant-spin-blur::after {
		opacity: 0 !important;
	}
`;
