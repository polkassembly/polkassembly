// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, InputNumber } from 'antd';
import BN from 'bn.js';
import React, { useContext } from 'react';
import { chainProperties } from 'src/global/networkConstants';

import { NetworkContext } from '~src/context/NetworkContext';

import { inputToBn } from '../util/inputToBn';
import HelperTooltip from './HelperTooltip';

interface Props{
	className?: string
	label?: string
	helpText?: string
	onChange: (balance: BN) => void
	placeholder?: string
	size?: 'large' | 'small' | 'middle'
}

const BalanceInput = ({ className, label = '', helpText = '', onChange, placeholder = '', size }: Props) => {

	const { network } = useContext(NetworkContext);

	const onBalanceChange = (value: number | null): void => {
		const [balance, isValid] = inputToBn(`${value}`, network, false);

		if(isValid){
			onChange(balance);
		}
	};

	return <div className={className}>
		<label className='mb-2 flex items-center text-sm text-sidebarBlue'> {label} {helpText && <HelperTooltip className='ml-2' text={helpText}/> } </label>

		<Form.Item
			name="balance"
			rules={[
				{
					message: 'Lock Balance is required.',
					required: true
				},
				{
					message: 'Lock Balance must be greater than 0.',
					validator(rule, value, callback) {
						if (callback && value <= 0){
							callback(rule?.message?.toString());
						}else {
							callback();
						}
					}
				}
			]}
		>
			<InputNumber
				addonAfter={chainProperties[network]?.tokenSymbol}
				name='balance'
				className='text-sm text-sidebarBlue w-full px-2 py-1 border-2 rounded-md'
				onChange={onBalanceChange}
				placeholder={`${placeholder} ${chainProperties[network]?.tokenSymbol}`}
				size={size || 'large'}
			/>
		</Form.Item>
	</div>;
};

export default BalanceInput;
