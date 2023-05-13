// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, InputNumber } from 'antd';
import BN from 'bn.js';
import React, { useContext, useEffect } from 'react';
import { chainProperties } from 'src/global/networkConstants';

import { NetworkContext } from '~src/context/NetworkContext';

import { inputToBn } from '../util/inputToBn';
import Balance from '~src/components/Balance';
import styled from 'styled-components';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/components/DelegationDashboard/ProfileBalance';

const ZERO_BN = new BN(0);

interface Props{
	className?: string
	label?: string
	helpText?: string
	onChange?: (balance: BN) => void
	placeholder?: string
	size?: 'large' | 'small' | 'middle';
  address?: string;
  withBalance?: boolean;
  onAccountBalanceChange?: (balance: string) => void
  balance?: BN;
  inputClassName?: string;
  noRules?: boolean;
	formItemName?: string;
}

const BalanceInput = ({ className, label = '', onChange, placeholder = '', size, address, withBalance = false , onAccountBalanceChange, balance, inputClassName, noRules, formItemName = 'balance' }: Props) => {

	const { network } = useContext(NetworkContext);
	const unit = `${chainProperties[network].tokenSymbol}`;
	const onBalanceChange = (value: number | null): void => {
		const [balance, isValid] = inputToBn(`${value}`, network, false);

		if(isValid){
			onChange?.(balance);
		}else{
			onChange?.(ZERO_BN);
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
		<label className='mb-[2px] inner-headings'>
			{label}
			{address && withBalance && <span><Balance address={address} onChange={onAccountBalanceChange} /></span>
			}
		</label>
		<Form.Item
			name={formItemName}
			initialValue={balance ? Number(formatedBalance(balance.toString(), unit)) : ''}
			rules={noRules ? []: [
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
				name={formItemName}
				className={`text-sm w-full h-[39px] border-[1px] rounded-l-[4px] rounded-r-[0px] mt-0 ${inputClassName} placeholderColor`}
				onChange={onBalanceChange}
				placeholder={`${placeholder}`}
				size={size || 'large'}
				value={Number(formatedBalance(String(balance || ZERO_BN), unit)) }
			/>
		</Form.Item>
	</div>;
};
export default styled(BalanceInput)`
.placeholderColor .ant-input-number-group .ant-input-number-group-addon{
background:#E5007A;
color:white;
font-size:12px;
border: 1px solid #E5007A; 
}
.placeholderColor .ant-input-number .ant-input-number-input{
  color:#7c899b !important;
}
.ant-input-number-handler-up{
	display:none !important;
}
.ant-input-number-handler-down{
	display:none !important;
}
.ant-input-number-group-addon{
	border-radius:4px !important;
}
`;

