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
import Balance from '~src/components/Balance';
import formatBnBalance from '~src/util/formatBnBalance';
import styled from 'styled-components';

interface Props{
	className?: string
	label?: string
	helpText?: string
	onChange: (balance: BN) => void
	placeholder?: string
	size?: 'large' | 'small' | 'middle';
  address?: string;
  withBalance?: boolean;
  onAccountBalanceChange?: (balance: string) => void
  balance?: BN;
  inputClassName?: string;
}

const BalanceInput = ({ className, label = '', helpText = '', onChange, placeholder = '', size, address, withBalance = false , onAccountBalanceChange, balance, inputClassName }: Props) => {

	const { network } = useContext(NetworkContext);

	const onBalanceChange = (value: number | null): void => {
		const [balance, isValid] = inputToBn(`${value}`, network, false);

		if(isValid){
			onChange(balance);
		}
	};

	return <div className={`${className} w-full flex flex-col`}>
		<label className='mb-[2px] flex items-center text-sm'>
			{label} {helpText && <HelperTooltip className='' text={helpText}/> }
			{address && withBalance &&
			<Balance address={address} onChange={onAccountBalanceChange}  />
			}
		</label>
		<Form.Item
			name="balance"
			initialValue={balance ? Number(formatBnBalance (balance,{ numberAfterComma:2, withUnit: false }, network )) : ''}
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
				className={`text-sm w-full h-[40px] border-[1px] rounded-[4px] mt-0 ${inputClassName} placeholderColor`}
				onChange={onBalanceChange}
				placeholder={`${placeholder} ${chainProperties[network]?.tokenSymbol}`}
				size={size || 'large'}
			/>
		</Form.Item>
	</div>;
};

export default styled(BalanceInput)`
.placeholderColor .ant-input-number-group .ant-input-number-group-addon{
border: 1px solid red;
background:#E5007A;
color:white;
font-size:12px;
}`;
