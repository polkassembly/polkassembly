// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { useState, useEffect } from 'react';
import Balance from 'src/components/Balance';
import { poppins } from 'pages/_app';
import AddressDropdown from './AddressDropdown';
import HelperTooltip from './HelperTooltip';
import { Polkasafe } from 'polkasafe';
import { useApiContext } from '~src/context';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Loader from '~src/ui-components/Loader';
import styled from 'styled-components';
import { Alert } from 'antd';
import formatBnBalance from '~src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import BN from 'bn.js';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

interface Props {
	accounts: InjectedAccount[];
	address: string;
	onAccountChange: (address: string) => void;
	title?: string;
	withBalance?: boolean;
	onBalanceChange?: (balance: string) => void;
	className?: string;
	isDisabled?: boolean;
	inputClassName?: string;
	isSwitchButton?: boolean;
	setSwitchModalOpen?: (pre: boolean) => void;
	withoutInfo?: boolean;
	walletAddress?: any;
	setWalletAddress?: any;
	containerClassName?: string;
	canMakeTransaction?: boolean;
	showMultisigBalance?: boolean;
	multisigBalance: BN;
	setMultisigBalance: (pre: BN) => void;
}

const MultisigAccountSelectionForm = ({
	accounts,
	address,
	onAccountChange,
	title,
	withBalance = false,
	onBalanceChange,
	className,
	isDisabled,
	inputClassName,
	isSwitchButton,
	setSwitchModalOpen,
	withoutInfo,
	walletAddress,
	setWalletAddress,
	containerClassName,
	canMakeTransaction,
	showMultisigBalance = false,
	multisigBalance,
	setMultisigBalance
}: Props) => {
	const [multisig, setMultisig] = useState<any>(null);
	const { api, apiReady } = useApiContext();
	const client = new Polkasafe();
	const { network } = useNetworkSelector();
	const [loader, setLoader] = useState<boolean>(false);
	const handleGetMultisig = async (address: string, network: string) => {
		setLoader(true);
		const { data } = await client.getAllMultisigByAddress(address, network);
		setMultisig(data);
		setLoader(false);
	};
	const handleMultisigBalance = async (address: string) => {
		if (!api || !apiReady) {
			return;
		}
		const initiatorBalance = await api.query.system.account(address);
		const balance = new BN(initiatorBalance.data.free.toString());
		setMultisigBalance(balance);
	};
	const handleChange = (address: string) => {
		setWalletAddress(address);
		handleMultisigBalance(address);
	};

	useEffect(() => {
		const substrateAddress = getSubstrateAddress(address);
		if (substrateAddress) handleGetMultisig(substrateAddress, network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, network]);

	useEffect(() => {
		if (multisig && multisig.length > 0) {
			setWalletAddress(multisig[0].address);
			handleMultisigBalance(multisig[0].address);
			return;
		}
		setWalletAddress('');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisig, setWalletAddress]);

	return (
		<Container
			style={{ width: '100%' }}
			className={containerClassName}
		>
			<article className={`flex w-full flex-col ${className}`}>
				<div className='mb-[2px] flex items-center gap-2'>
					{title && (
						<>
							<h3 className='mb-0 text-sm font-normal'>{title}</h3>
							{!withoutInfo && <HelperTooltip text='You can choose an account from the extension.' />}
							{address && withBalance && (
								<Balance
									address={address}
									onChange={onBalanceChange}
									classname={!canMakeTransaction ? 'text-nay_red [&>span]:text-nay_red' : 'opacity-50'}
								/>
							)}
						</>
					)}
				</div>
				<AddressDropdown
					isDisabled={isDisabled}
					accounts={accounts}
					defaultAddress={address}
					onAccountChange={onAccountChange}
					className={inputClassName}
					isSwitchButton={isSwitchButton}
					setSwitchModalOpen={setSwitchModalOpen}
				/>
			</article>

			{loader ? (
				<Loader />
			) : multisig && multisig.length > 0 ? (
				<article className={`flex w-full flex-col ${className}`}>
					<div className='mb-[2px] flex items-center gap-2'>
						{title && (
							<>
								<h3 className='mb-0 text-sm font-normal'>Choose linked multisig account</h3>
								{!withoutInfo && <HelperTooltip text='You can choose an multisig account that are linked from the selected address.' />}
								{showMultisigBalance && walletAddress && (
									<div className={`${poppins.className} ${poppins.variable} ml-auto mr-[2px] text-xs font-normal tracking-[0.0025em] text-[#576D8B]`}>
										Available: <span className='text-pink_primary'>{formatBnBalance(multisigBalance, { numberAfterComma: 2, withUnit: true }, network)}</span>
									</div>
								)}
							</>
						)}
					</div>
					<AddressDropdown
						isDisabled={isDisabled}
						accounts={multisig}
						defaultAddress={walletAddress}
						onAccountChange={handleChange}
						className={inputClassName}
						isSwitchButton={isSwitchButton}
						setSwitchModalOpen={setSwitchModalOpen}
					/>
				</article>
			) : (
				<MultisigNotFound />
			)}
		</Container>
	);
};

export default MultisigAccountSelectionForm;

const MultisigNotFound = () => (
	<Alert
		message={
			<div className='flex gap-x-2'>
				<span className='capitalize'>No multisig account found.</span>
			</div>
		}
		description={
			<div className='max-w-md'>
				Please integrate a multisig account or change your address. To create a multisig account, please visit{' '}
				<a
					className='text-pink_primary'
					href='https://polkasafe.xyz/'
					target='_blank'
					rel='noreferrer'
				>
					Polkasafe
				</a>{' '}
				to create or manage your multisig account.
			</div>
		}
		type='info'
		showIcon
	/>
);
