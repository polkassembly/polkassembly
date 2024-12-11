// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import BN from 'bn.js';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { LoadingStatusType, NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import BalanceInput from 'src/ui-components/BalanceInput';
import Loader from 'src/ui-components/Loader';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import LoginToEndorse from '../LoginToVoteOrEndorse';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';
import executeTx from '~src/util/executeTx';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Alert from '~src/basic-components/Alert';
import { useTranslation } from 'next-i18next';

interface Props {
	accounts: InjectedTypeWithCouncilBoolean[];
	address: string;
	className?: string;
	getAccounts: () => Promise<undefined>;
	tipHash?: string;
	onAccountChange: (address: string) => void;
	setAccounts: React.Dispatch<React.SetStateAction<InjectedTypeWithCouncilBoolean[]>>;
}

const EndorseTip = ({ accounts, address, className, getAccounts, tipHash, onAccountChange, setAccounts }: Props) => {
	const ZERO = new BN(0);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [endorseValue, setEndorseValue] = useState<BN>(ZERO);
	const [isCouncil, setIsCouncil] = useState(false);
	const [forceEndorse, setForceEndorse] = useState(false);
	const [currentCouncil, setCurrentCouncil] = useState<string[]>([]);
	const { api, apiReady } = useApiContext();
	const { id } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');

	useEffect(() => {
		// it will iterate through all accounts
		if (accounts && Array.isArray(accounts)) {
			const index = accounts.findIndex((account) => {
				const substrateAddress = getSubstrateAddress(account.address);
				return currentCouncil.some((council) => getSubstrateAddress(council) === substrateAddress);
			});
			if (index >= 0) {
				const account = accounts[index];
				setIsCouncil(true);
				accounts.splice(index, 1);
				accounts.unshift({
					...account,
					isCouncil: true
				});
				setAccounts(accounts);
				onAccountChange(account.address);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentCouncil, accounts]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		try {
			if (accounts.length === 0) {
				getAccounts();
			}
			api.query.council.members().then((memberAccounts) => {
				const members = memberAccounts.map((member) => member.toString());
				setCurrentCouncil(members.filter((member) => !!member) as string[]);
			});
		} catch (error) {
			// console.log(error);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	const onValueChange = (balance: BN) => setEndorseValue(balance);

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: `Endorse tip #${tipHash} successful.`,
			status: NotificationStatus.SUCCESS
		});
		setLoadingStatus({ isLoading: false, message: '' });
	};
	const onFailed = (message: string) => {
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});
	};

	const handleEndorse = async () => {
		if (!tipHash) {
			console.error('tipHash not set');
			return;
		}

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		const endorse = api.tx.treasury.tip(tipHash, endorseValue);
		await executeTx({ address, api, apiReady, errorMessageFallback: 'Transaction failed.', network, onFailed, onSuccess, tx: endorse });
	};

	const GetAccountsButton = () => (
		<Form>
			<Form.Item className='button-container'>
				<div>{t('only_council_members_can_endorse_tips')}</div>
				<br />
				<CustomButton
					onClick={getAccounts}
					text={t('endorse')}
					variant='primary'
				/>
			</Form.Item>
		</Form>
	);

	const noAccount = accounts.length === 0;
	if (!id) {
		return <LoginToEndorse to='Endorse' />;
	}
	const endorse = noAccount ? (
		<GetAccountsButton />
	) : loadingStatus.isLoading ? (
		<div className={'LoaderWrapper'}>
			<Loader text={loadingStatus.message} />
		</div>
	) : (
		<div>
			<AccountSelectionForm
				title='Endorse with account'
				accounts={accounts}
				address={address}
				onAccountChange={onAccountChange}
				withBalance
			/>
			<BalanceInput
				label={t('value')}
				helpText={t('allocate_a_suggested_tip_amount_with_enough_endorsements_the_suggested_values_are_averaged_and_sent_to_the_beneficiary')}
				placeholder={'123'}
				onChange={onValueChange}
			/>
			<CustomButton
				text={t('endorse')}
				onClick={handleEndorse}
				variant='primary'
				disabled={!apiReady}
			/>
		</div>
	);

	const NotCouncil = () => (
		<>
			<h3 className='dashboard-heading mb-6 dark:text-white'>{t('endorse_with_account')}</h3>
			<Alert
				className='mb-6'
				type='warning'
				message={
					<div className='flex items-center gap-x-2 dark:text-blue-dark-high'>
						<span>{t('no_account_found_from_the_council')}</span>
						<Image
							width={25}
							height={25}
							src='/assets/frowning-face.png'
							alt='frowning face'
						/>
					</div>
				}
			/>
			<CustomButton
				variant='primary'
				text={t('let_me_try_still')}
				onClick={() => setForceEndorse(true)}
			/>
		</>
	);

	return <div className={className}>{isCouncil || forceEndorse ? endorse : <NotCouncil />}</div>;
};

export default styled(EndorseTip)`
	.LoaderWrapper {
		height: 15rem;
		position: absolute;
		width: 100%;
	}
`;
