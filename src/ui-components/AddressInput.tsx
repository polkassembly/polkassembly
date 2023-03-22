// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { checkAddress } from '@polkadot/util-crypto';
import { Form, Input } from 'antd';
import React, { useContext, useState } from 'react';
import { addressPrefix } from 'src/global/networkConstants';
import Web3 from 'web3';

import { NetworkContext } from '~src/context/NetworkContext';

import EthIdenticon from './EthIdenticon';
import HelperTooltip from './HelperTooltip';

interface Props{
	className?: string
	label?: string
	helpText?: string
	onChange: (address: string) => void
	placeholder?: string
	size?: 'large' | 'small' | 'middle'
}

const AddressInput = ({ className, helpText, label, placeholder, size, onChange } : Props) => {
	const { network } = useContext(NetworkContext);

	const [address, setAddress] = useState<string>('');
	const [isValid, setIsValid] = useState<boolean>(false);

	const handleAddressChange = (address: string) => {
		setAddress(address);
		const isValidMetaAddress = Web3.utils.isAddress(address, addressPrefix[network]);
		const [validAddress] = checkAddress(address, addressPrefix[network]);

		if(validAddress || isValidMetaAddress) {
			setIsValid(true);
			onChange(address);
		} else {
			setIsValid(false);
			onChange('');
		}
	};

	return (
		<div className={`${className} mb-2`}>
			<label className='-mb-0.5 flex items-center text-sm text-sidebarBlue'> {label} {helpText && <HelperTooltip className='ml-2' text={helpText}/> } </label>

			<div className={`${className} flex items-center`}>

				{
					isValid &&
					<>
						{
							address.startsWith('0x') ?
								<EthIdenticon className='z-10 absolute left-[8px]' size={26} address={address} />
								:
								<Identicon
									className='z-10 absolute left-[8px]'
									value={address}
									size={26}
									theme={'polkadot'}
								/>
						}
					</>
				}

				<Form.Item className='mb-0 w-full' validateStatus={address && !isValid ? 'error' : ''} >
					<Input
						value={address}
						className={`${!isValid ? 'px-[0.5em]' : 'pl-10'} text-sm text-sidebarBlue w-full px-2 py-3 border-2 rounded-md`}
						onChange={ (e) => handleAddressChange(e.target.value)}
						placeholder={placeholder || 'Address'}
						size={size}
					/>
				</Form.Item>
			</div>
		</div>
	);
};

export default AddressInput;