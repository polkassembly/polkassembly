// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, InputNumber } from 'antd';
import BN from 'bn.js';
import React, { useContext, useEffect } from 'react';
import { chainProperties } from 'src/global/networkConstants';

import { NetworkContext } from '~src/context/NetworkContext';

import { inputToBn } from '../util/inputToBn';
import HelperTooltip from './HelperTooltip';
import Balance from '~src/components/Balance';
import styled from 'styled-components';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/components/DelegationDashboard/ProfileBalance';

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
	const unit = `${chainProperties[network].tokenSymbol}`;
	const onBalanceChange = (value: number | null): void => {
		const [balance, isValid] = inputToBn(`${value}`, network, false);

		if(isValid){
			onChange(balance);
		}
	};

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <div className={`${className} w-full flex flex-col`}>
		<label className='mb-[2px] flex items-center text-sm justify-between'>
			{label} {helpText && <HelperTooltip className='ml-2' text={helpText}/> }
			{address && withBalance && <span><Balance address={address} onChange={onAccountBalanceChange} /></span>
			}
		</label>
		<Form.Item
			name="balance"
			initialValue={balance ? Number(formatedBalance(balance.toString(), unit)) : ''}
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
				className={`text-sm w-full h-[39px] border-[1px] rounded-l-[4px] mt-0 ${inputClassName} placeholderColor`}
				onChange={onBalanceChange}
				placeholder={`${placeholder} ${chainProperties[network]?.tokenSymbol}`}
				size={size || 'large'}
				value={Number(formatedBalance(String(balance), unit)) }
			/>
		</Form.Item>
	</div>;
};

export default styled(BalanceInput)`
.placeholderColor .ant-input-number-group .ant-input-number-group-addon{
background:#E5007A;
color:white;
font-size:12px;
}
.placeholderColor .ant-input-number .ant-input-number-input{
  color:#7c899b !important;
}`

;
