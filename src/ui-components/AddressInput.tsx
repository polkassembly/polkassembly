// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { checkAddress } from '@polkadot/util-crypto';
import { Form, Input } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { addressPrefix } from 'src/global/networkConstants';
import Web3 from 'web3';

import { NetworkContext } from '~src/context/NetworkContext';

import EthIdenticon from './EthIdenticon';
import HelperTooltip from './HelperTooltip';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Props {
	className?: string;
	label?: string;
	helpText?: string;
	onChange: (address: string) => void;
	placeholder?: string;
	size?: 'large' | 'small' | 'middle';
	defaultAddress?: string;
	skipFormatCheck?: boolean;
	inputClassName?: string;
	identiconSize?: number;
	iconClassName?: string;
	checkValidAddress?: (pre: boolean) => void;
	disabled?: boolean;
	name?: string;
	onBlur?: () => void;
}

const AddressInput = ({
	className,
	helpText,
	label,
	placeholder,
	size,
	onChange,
	defaultAddress,
	skipFormatCheck,
	inputClassName,
	identiconSize,
	iconClassName,
	checkValidAddress,
	disabled,
	name,
	onBlur
}: Props) => {
	const { network } = useContext(NetworkContext);

	const [address, setAddress] = useState<string>(defaultAddress ? defaultAddress : '');

	const [isValid, setIsValid] = useState<boolean>(false);
	const handleAddressChange = (address: string) => {
		setAddress(address);

		if (skipFormatCheck) {
			if (getEncodedAddress(address, network) || Web3.utils.isAddress(address)) {
				onChange(address);
			}
			return;
		}

		const isValidMetaAddress = Web3.utils.isAddress(address, addressPrefix[network]);
		const [validAddress] = checkAddress(address, addressPrefix[network]);

		if (validAddress || isValidMetaAddress) {
			setIsValid(true);
			checkValidAddress?.(true);
			onChange(address);
		} else {
			setIsValid(false);
			checkValidAddress?.(false);
			onChange('');
		}
	};

	useEffect(() => {
		if (skipFormatCheck) {
			if (address) {
				if (getEncodedAddress(address, network) || Web3.utils.isAddress(address)) {
					setIsValid(true);
					checkValidAddress?.(true);
					onChange(address);
				} else {
					setIsValid(false);
					checkValidAddress?.(false);
				}
			} else {
				setIsValid(false);
				checkValidAddress?.(false);
			}
			return;
		}

		const isValidMetaAddress = Web3.utils.isAddress(address, addressPrefix[network]);
		const [validAddress] = checkAddress(address, addressPrefix[network]);

		if (validAddress || isValidMetaAddress) {
			setIsValid(true);
			onChange(address);
		} else {
			setIsValid(false);
			onChange('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div className={`${className} mt-6`}>
			{label && (
				<label className=' mb-[2px] flex items-center text-sm'>
					{' '}
					{label}{' '}
					{helpText && (
						<HelperTooltip
							className='ml-1'
							text={helpText}
						/>
					)}{' '}
				</label>
			)}
			<div className={`${className} flex items-center`}>
				{isValid && (
					<>
						{address.startsWith('0x') ? (
							<EthIdenticon
								className={`absolute z-10 flex items-center justify-center ${iconClassName ? iconClassName : 'left-[8px]'}`}
								size={identiconSize || 26}
								address={address}
							/>
						) : (
							<Identicon
								className={`absolute z-10 ${iconClassName ? iconClassName : 'left-[8px]'}`}
								value={address}
								size={identiconSize || 26}
								theme={'polkadot'}
							/>
						)}
					</>
				)}

				<Form.Item
					name={name || 'address'}
					className='mb-0 w-full'
					validateStatus={address && !isValid ? 'error' : 'success'}
				>
					<Input
						onBlur={() => onBlur?.()}
						value={address}
						disabled={disabled}
						name={name || 'address'}
						className={`${!isValid ? 'px-[0.5em]' : 'pl-[46px]'} h-[40px] w-full rounded-[4px] border-[1px] text-sm ${inputClassName}`}
						onChange={(e) => {
							handleAddressChange(e.target.value);
							onChange(e.target.value);
						}}
						placeholder={placeholder || 'Address'}
						size={size}
					/>
				</Form.Item>
			</div>
		</div>
	);
};

export default AddressInput;
