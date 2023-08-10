// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import BN from 'bn.js';
import React, { useContext, useEffect } from 'react';
import { chainProperties } from 'src/global/networkConstants';

import { NetworkContext } from '~src/context/NetworkContext';

import { inputToBn } from '../util/inputToBn';
import Balance from '~src/components/Balance';
import styled from 'styled-components';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import HelperTooltip from './HelperTooltip';

const ZERO_BN = new BN(0);

interface Props{
	className?: string
	label?: string
	helpText?: string
	onChange: (balance: BN) => void
	placeholder?: string
	address?: string;
	withBalance?: boolean;
	onAccountBalanceChange?: (balance: string) => void
	balance?: BN;
	inputClassName?: string;
	noRules?: boolean;
	formItemName?: string;
  size?: 'large' | 'small' | 'middle';
  tooltipMessage?: string;
  setInputValue? : (pre: string)=> void;
}

const BalanceInput = ({ className, label = '', onChange, placeholder = '', size, address, withBalance = false , onAccountBalanceChange, balance, inputClassName, noRules, formItemName = 'balance', tooltipMessage, setInputValue }: Props) => {

	const { network } = useContext(NetworkContext);
	const unit = `${chainProperties[network].tokenSymbol}`;
	const onBalanceChange = (value: string | null): void => {

		const [balance, isValid] = inputToBn(`${value}`, network, false);
		if(isValid){
			setInputValue && setInputValue(value || '0');
			onChange(balance);
		}else{
			onChange(ZERO_BN);
			setInputValue && setInputValue('0');
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

	return <div className={`${className} w-full flex flex-col balance-input`}>
		{(label || (address && withBalance)) && <label className='mb-[2px] inner-headings'>
			<span className='flex items-center'>
				{label}
				<span>
					{tooltipMessage && <HelperTooltip text={tooltipMessage}  className='ml-1'/>}
				</span>
			</span>
			{address && withBalance && <span><Balance address={address} onChange={onAccountBalanceChange} /></span>
			}
		</label>}
		<Form.Item
			name={formItemName}
			initialValue={balance ? Number(formatedBalance(balance.toString(), unit)) : ''}
			rules={noRules ? []: [
				{
					message: 'Lock Balance must be greater than 0.',
					validator(rule, value, callback) {
						if (callback && value.length && Number(value) <= 0 ){
							callback(rule?.message?.toString());
						}else {
							callback();
						}
					}
				},
				{
					message: 'Invalid Balance',
					validator(rule, value, callback) {
						if (callback && (isNaN(Number(value)) || (Number(value) > 0 ) && (value?.split('.')?.[1]?.length && ( chainProperties[network]?.tokenDecimals  < (value?.split('.')?.[1].length || 0))))){
							callback(rule?.message?.toString());
						}else {
							callback();
						}
					}
				}
			]}
		>
			<Input
				addonAfter={chainProperties[network]?.tokenSymbol}
				name={formItemName || 'balance'}
				className={`w-full h-[39px] border-[1px] ${inputClassName} text-sm mt-0 suffixColor hover:border-pink_primary balance-input`}
				onChange={(e) => onBalanceChange(e.target.value) }
				placeholder={placeholder}
				value={(formatedBalance(String(balance || ZERO_BN), unit))}
				size={size || 'middle'}
			/>
		</Form.Item>
	</div>;
};
export default styled(BalanceInput)`
.suffixColor .ant-input-group .ant-input-group-addon{
	background:var(--pink_primary);
	color:white;
	font-size:12px !important;
	border: 1px solid var(--pink_primary);
  border-radius:0px 4px 4px 0px !important ;
}
.suffixColor .ant-input{
	color:var(--bodyBlue) !important;
  border-radius: 4px 0px 0px 4px !important;
  height: 40px !important;
}
.balance-input .ant-input-number-handler-up{
	display:none !important;
}
.balance-input .ant-input-number-handler-down{
	display:none !important;
}
.balance-input .ant-input-number-group-addon{
	border-radius:4px !important;
	position:relative;
	right:2px;
}
.balance-input .ant-input-number{
	border: 1px solid #D2D8E0 ;
}
.balance-input .ant-input-number-focused{
	border: 1px solid var(--pink_primary) ;
}
input::placeholder {
	font-weight: 400 !important;
	font-size: 14px !important;
	line-height: 21px !important;
	letter-spacing: 0.0025em !important;
}
`;

