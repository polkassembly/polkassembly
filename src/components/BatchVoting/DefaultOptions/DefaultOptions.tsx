// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import OptionWrapper from './OptionWrapper';
import { useBatchVotesSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ILastVote } from '~src/types';
import Alert from '~src/basic-components/Alert';
import { ProposalType } from '~src/global/proposalType';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useAppDispatch } from '~src/redux/store';
import { batchVotesActions } from '~src/redux/batchVoting';
import { useApiContext } from '~src/context';
import { IDefaultOptions } from '../types';
import Balance from '~src/components/Balance';
import BN from 'bn.js';
import { Tooltip } from 'antd';
import Address from '~src/ui-components/Address';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { dmSans } from 'pages/_app';
const ZERO_BN = new BN(0);

const DefaultOptions: FC<IDefaultOptions> = ({ forSpecificPost, postEdit }) => {
	const dispatch = useAppDispatch();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const { loginAddress, id } = useUserDetailsSelector();
	const [address, setAddress] = useState<string>(loginAddress);
	const [open, setOpen] = useState(false);
	const {
		batch_vote_details: { ayeVoteBalance, nyeVoteBalance, abstainVoteBalance }
	} = useBatchVotesSelector();

	const onAccountChange = (address: string) => {
		setAddress(address);
	};
	const { api, apiReady } = useApiContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN | null>(null);

	const handleOnAvailableBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
			setAvailableBalance(balance);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<section className='h-full w-full items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'>
			<header>
				<div className='mb-4 mt-4 h-[48px] border-0 border-b-[1px] border-solid border-section-light-container px-6 text-lg font-semibold tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					Set Defaults
				</div>
			</header>
			<article className='-full w-full items-center justify-start gap-x-3 px-6'>
				<Alert
					type='info'
					showIcon
					className='mt-8 px-4'
					message={
						<p className='m-0 p-2 text-[13px] dark:text-white'>
							You can adjust for delegated voting power from edit button on each proposal.
							<Tooltip
								color='#363636'
								title={
									<div className={`${dmSans.className} ${dmSans.variable} flex flex-col gap-y-2 p-2`}>
										<p className='m-0 p-0 text-white'>1. Add proposal to cart by choosing your vote : aye , nay or abstain.</p>
										<p className='m-0 p-0 text-white'>
											2. Click on edit button on the proposal, you will now be able to see and adjust delegated votes based on the proposal track.
										</p>
									</div>
								}
							>
								<span className='ml-2 font-semibold text-pink_primary '>Know more</span>
							</Tooltip>
						</p>
					}
				/>

				{availableBalance &&
					(availableBalance.lte(new BN(ayeVoteBalance || '0')) ||
						availableBalance.lte(new BN(nyeVoteBalance || '0')) ||
						availableBalance?.lte(new BN(abstainVoteBalance || '0'))) && (
						<Alert
							className='mt-4 h-10'
							showIcon
							type='info'
							message={<p className='m-0 p-2 text-[13px] dark:text-white'>Low balance. Proceed anyway?</p>}
						/>
					)}
				{!!id && (
					<div className='flex flex-col gap-y-1'>
						<div className='mt-6 flex justify-end'>
							<Balance
								isVoting
								address={address || loginAddress}
								onChange={handleOnAvailableBalanceChange}
							/>
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-[44px] w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={address || loginAddress}
									isTruncateUsername={false}
									displayInline
								/>
								<CustomButton
									text='Change Wallet'
									onClick={() => {
										setOpen(true);
									}}
									width={120}
									className='change-wallet-button mr-1 flex items-center justify-center text-[10px]'
									height={24}
									variant='primary'
								/>
							</div>
						</div>
					</div>
				)}

				<OptionWrapper
					address={String(address)}
					onAccountChange={onAccountChange}
					proposalType={ProposalType.TREASURY_PROPOSALS}
					lastVote={lastVote}
					setLastVote={setLastVote}
					forSpecificPost={forSpecificPost}
					postEdit={postEdit}
				/>
			</article>
			{!!id && (
				<div className='mb-2 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-4'>
					<CustomButton
						variant='default'
						text='Skip'
						buttonsize='sm'
						onClick={() => {
							dispatch(batchVotesActions.setIsDefaultSelected(false));
						}}
					/>
					<CustomButton
						variant='primary'
						text='Next'
						buttonsize='sm'
						onClick={() => {
							dispatch(batchVotesActions.setIsDefaultSelected(false));
						}}
					/>
				</div>
			)}
			<AddressConnectModal
				open={open}
				setOpen={setOpen}
				walletAlertTitle='Batch Voting.'
				onConfirm={(address: string) => {
					setOpen(true);
					dispatch(batchVotesActions.setBatchVotingAddress(address));
					setAddress(address);
				}}
				isUsedInBatchVoting={true}
			/>
		</section>
	);
};

export default DefaultOptions;
