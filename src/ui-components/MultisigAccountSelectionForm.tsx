// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { useState, useEffect } from 'react';
import Balance from 'src/components/Balance';

import AddressDropdown from './AddressDropdown';
import HelperTooltip from './HelperTooltip';
import { Polkasafe } from 'polkasafe';
import { useNetworkContext } from '~src/context';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Loader from '~src/ui-components/Loader';
import styled from 'styled-components';
import { Alert } from 'antd';

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
    wallet?:any;
    setWallet?:any;
	classes?:string
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
	wallet,
	setWallet,
	classes
}: Props) => {
	const [multisig, setMultisig] = useState<any>(null);
	const client = new Polkasafe();
	const { network } = useNetworkContext();
	const [loader, setLoader] = useState<boolean>(false);
	const handleGetMultisig = async (address: string, network: string) => {
		setLoader(true);
		const { data } = await client.getAllMultisigByAddress(address, network);
		setMultisig(data);
		setLoader(false);
	};
	const handleChange = (address:string) => {
		setWallet(address);
	};
	useEffect(() => {
		const substrateAddress = getSubstrateAddress(address);
		if (substrateAddress) handleGetMultisig(substrateAddress, network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, network]);
	useEffect(() => {
		if (multisig && multisig.length > 0) {
			setWallet(multisig[0].address);
		}
		else{
			setWallet('');
		}
	}, [multisig, setWallet]);

	return (
		<Container style={{ width: '100%' }} className={classes}>
			<article className={`w-full flex flex-col ${className}`}>
				{title && (
					<div className="flex items-center mb-[2px] gap-2">
						<h3 className="text-sm mb-0 font-normal">{title}</h3>
						{!withoutInfo && (
							<HelperTooltip text="You can choose an account from the extension." />
						)}
					</div>
				)}
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
				<article className={`w-full flex flex-col ${className}`}>
					{title && (
						<div className="flex items-center mb-[2px] gap-2">
							<h3 className="text-sm mb-0 font-normal">
                                Choose linked multisig account
							</h3>
							{!withoutInfo && (
								<HelperTooltip text="You can choose an multisig account that are linked from the selected address." />
							)}
						</div>
					)}
					<AddressDropdown
						isDisabled={isDisabled}
						accounts={multisig}
						defaultAddress={wallet}
						onAccountChange={handleChange}
						className={inputClassName}
						isSwitchButton={isSwitchButton}
						setSwitchModalOpen={setSwitchModalOpen}
					/>
					{multisig && withBalance && (
						<Balance address={multisig} onChange={onBalanceChange} />
					)}
				</article>
			) : (
				<MultisigNotFound/>
			)}
		</Container>
	);
};

export default MultisigAccountSelectionForm;

const MultisigNotFound = () => <Alert
	message={
		<div className='flex gap-x-2'>
			<span className='capitalize'>No multisig account found.</span>
		</div>
	}
	description={
		<div className='max-w-md'>
            Please integrate a multisig account or change your address. To create a multisig account, please visit <a href='https://polkasafe.xyz/' target='_blank' rel="noreferrer" className='text-pink_primary'>Polkasafe</a> to create or manage your multisig account.
		</div>
	}
	type="info"
	showIcon
/>;