// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import OptionWrapper from './OptionWrapper';
import { useUserDetailsSelector } from '~src/redux/selectors';
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
import { useTranslation } from 'next-i18next';
import { dmSans } from 'pages/_app';
const ZERO_BN = new BN(0);

const DefaultOptions: FC<IDefaultOptions> = ({ forSpecificPost, postEdit }) => {
	const { t } = useTranslation('common');
	const dispatch = useAppDispatch();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const { loginAddress } = useUserDetailsSelector();
	const [address, setAddress] = useState<string>(loginAddress);
	const [open, setOpen] = useState(false);

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
					{t('set_defaults')}
				</div>
			</header>
			<article className='-full w-full items-center justify-start gap-x-3 px-6'>
				<Alert
					type='info'
					showIcon
					className='mt-8 px-4'
					message={
						<p className='m-0 p-0 p-2 text-[13px] dark:text-white'>
							{t('delegated_voting_info')}
							<Tooltip
								color='#363636'
								title={
									<div className={`${dmSans.className} ${dmSans.variable} flex flex-col gap-y-2 p-2`}>
										<p className='m-0 p-0 text-white'>{t('add_proposal_info_1')}</p>
										<p className='m-0 p-0 text-white'>{t('add_proposal_info_2')}</p>
									</div>
								}
							>
								<span className='ml-2 font-semibold text-pink_primary '>{t('know_more')}</span>
							</Tooltip>
						</p>
					}
				/>
				<div className='mt-6 flex justify-end'>
					<Balance
						address={address}
						onChange={handleOnAvailableBalanceChange}
					/>
				</div>
				<div className='flex w-full items-end gap-2 text-sm '>
					<div className='flex h-[44px] w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
						<Address
							address={address}
							isTruncateUsername={false}
							displayInline
						/>
						<CustomButton
							text={t('change_wallet')}
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
			<div className='mb-2 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-4'>
				<CustomButton
					variant='default'
					text={t('skip')}
					buttonsize='sm'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				/>
				<CustomButton
					variant='primary'
					text={t('next')}
					buttonsize='sm'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				/>
			</div>
			<AddressConnectModal
				open={open}
				setOpen={setOpen}
				walletAlertTitle={t('batch_voting')}
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
