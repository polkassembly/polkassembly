// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import BN from 'bn.js';
import React, { ReactNode, useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { inputToBn } from '../util/inputToBn';
import Balance from '~src/components/Balance';
import styled from 'styled-components';
import { formatBalance } from '@polkadot/util';
import HelperTooltip from './HelperTooltip';
import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import Image from 'next/image';
import Input from '~src/basic-components/Input';
// import Select from '~src/basic-components/Select';
// import { ArrowDownIcon } from './CustomIcons';
import Popover from '~src/basic-components/Popover';
import { ArrowDownIcon } from './CustomIcons';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { getGeneralIndexFromAsset } from '~src/components/OpenGovTreasuryProposal/utils/getGeneralIndexFromAsset';
import isMultiassetSupportedNetwork from '~src/util/isMultiassetSupportedNetwork';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	label?: string | ReactNode;
	helpText?: string;
	onChange?: (balance: BN) => void;
	placeholder?: string;
	address?: string;
	withBalance?: boolean;
	onAccountBalanceChange?: (balance: string) => void;
	balance?: BN;
	inputClassName?: string;
	noRules?: boolean;
	formItemName?: string;
	size?: 'large' | 'small' | 'middle';
	tooltipMessage?: string;
	setInputValue?: (pre: string) => void;
	onBlur?: () => void;
	theme?: string;
	isBalanceUpdated?: boolean;
	disabled?: boolean;
	multipleAssetsAllow?: boolean;
	onAssetConfirm?: (pre: string | null) => void;
	deafultAsset?: string | null;
	setIsBalanceSet?: (pre: boolean) => void;
}

const BalanceInput = ({
	className,
	label = '',
	onChange,
	placeholder = '',
	size,
	address,
	withBalance = false,
	onAccountBalanceChange,
	balance,
	inputClassName,
	noRules,
	formItemName = 'balance',
	tooltipMessage,
	setInputValue,
	onBlur,
	multipleAssetsAllow = false,
	isBalanceUpdated,
	disabled,
	setIsBalanceSet,
	deafultAsset,
	onAssetConfirm
}: Props) => {
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network].tokenSymbol}`;
	const [asset, setAsset] = useState<{ img: string; label: string; value: string | null }>({
		img: chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo,
		label: chainProperties[network]?.tokenSymbol,
		value: null
	});
	const [open, setOpen] = useState<boolean>(false);

	const options = isMultiassetSupportedNetwork(network)
		? [
				{ img: chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo, label: chainProperties[network]?.tokenSymbol, value: null },
				...(chainProperties?.[network]?.supportedAssets?.map((item) => {
					return { img: item?.img, label: item.symbol.toUpperCase(), value: getGeneralIndexFromAsset({ asset: item.symbol, network }) || null };
				}) || [])
		  ]
		: [];

	const onBalanceChange = (value: string | null): void => {
		const [balance, isValid] = inputToBn(`${value}`, network, false);

		if (isValid) {
			setInputValue?.(value || '0');
			onChange?.(balance);
			setIsBalanceSet?.(true);
		} else {
			onChange?.(ZERO_BN);
			setInputValue?.('0');
			setIsBalanceSet?.(false);
		}
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<div className={`${className} balance-input flex w-full flex-col`}>
			{(label || (address && withBalance)) && (
				<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
					<span className='flex items-center'>
						{label}
						<span>
							{tooltipMessage && (
								<HelperTooltip
									text={tooltipMessage}
									className='ml-1'
								/>
							)}
						</span>
					</span>
					{address && withBalance && (
						<span>
							<Balance
								address={address}
								isBalanceUpdated={isBalanceUpdated}
								onChange={onAccountBalanceChange}
							/>
						</span>
					)}
				</label>
			)}
			<Form.Item
				name={formItemName}
				initialValue={balance ? Number(formatedBalance(balance.toString(), unit)) : ''}
				rules={
					noRules
						? []
						: [
								{
									message: 'Invalid Balance',
									validator(rule, value, callback) {
										if (
											callback &&
											(isNaN(Number(value)) ||
												(Number(value) > 0 &&
													value.toString()?.split('.')?.[1]?.length &&
													chainProperties[network]?.tokenDecimals < (value.toString()?.split('.')?.[1].length || 0)) ||
												(value.toString().length && Number(value) <= 0))
										) {
											setIsBalanceSet?.(false);
											callback(rule?.message?.toString());
										} else {
											callback();
										}
									}
								}
						  ]
				}
			>
				<Input
					onBlur={() => onBlur?.()}
					addonAfter={
						multipleAssetsAllow ? (
							<div className='flex items-center justify-center px-2 text-bodyBlue dark:text-blue-dark-high'>
								<Popover
									open={open}
									onOpenChange={setOpen}
									trigger='click'
									overlayClassName={classNames(poppins.className, poppins.variable, 'mt-2 px-0 py-1 w-[100px]')}
									placement='bottom'
									content={
										<div className='flex flex-col'>
											{options.map((option) => (
												<div
													key={option.label}
													className={classNames(
														'-mx-3 flex cursor-pointer items-center gap-1.5 px-4 text-sm text-bodyBlue dark:text-blue-dark-medium',
														asset.value == option.value ? 'bg-[#fae7ef] py-2 font-medium dark:bg-pink-dark-primary' : 'py-1.5'
													)}
													onClick={() => {
														setAsset(option);
														onAssetConfirm?.(option?.value);
													}}
												>
													<Image
														className='h-4 w-4 rounded-full object-contain'
														src={option.img}
														alt='Logo'
														width={20}
														height={20}
													/>
													{option.label}
												</div>
											))}
										</div>
									}
								>
									<div className='flex cursor-pointer items-center gap-1 text-lightBlue dark:text-blue-dark-high'>
										<Image
											className='h-4 w-4 rounded-full object-contain'
											src={asset.img}
											alt='Logo'
											width={20}
											height={20}
										/>
										{asset.label}
										<ArrowDownIcon className={open ? 'ml-0.5 rotate-180' : 'ml-0.5'} />
									</div>
								</Popover>
							</div>
						) : deafultAsset ? (
							<div className='flex cursor-pointer items-center gap-1 p-3'>
								<Image
									className='h-4 w-4 rounded-full object-contain capitalize'
									src={options.find((option) => option.value == deafultAsset)?.img || ''}
									alt='Logo'
									width={20}
									height={20}
								/>
								{options.find((option) => option.value == deafultAsset)?.label.toUpperCase() || ''}
							</div>
						) : (
							<div className='flex items-center justify-center gap-1 px-3 dark:text-white'>
								<Image
									className='h-4 w-4 rounded-full object-contain'
									src={chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo}
									alt='Logo'
								/>
								{chainProperties[network]?.tokenSymbol}
							</div>
						)
					}
					name={formItemName || 'balance'}
					className={`h-[39px] w-full border-[1px] ${inputClassName} suffixColor balance-input mt-0 text-sm hover:border-pink_primary dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high dark:focus:border-[#91054F]`}
					onChange={(e) => onBalanceChange(e.target.value)}
					placeholder={placeholder}
					value={formatedBalance(String(balance || ZERO_BN), unit)}
					size={size || 'middle'}
					disabled={disabled}
				/>
			</Form.Item>
		</div>
	);
};
export default styled(BalanceInput)`
	.suffixColor .ant-input-group .ant-input-group-addon {
		background: #edeff3;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'var(--lightBlue)')} !important;
		font-size: 12px !important;
		font-weight: 500 !important;
		border: 0px 1px 1px 0px solid #d2d8e0;
		border-radius: 0px 4px 4px 0px !important ;
		padding: 0px !important;
		cursor: pointer !important;
	}
	.suffixColor .ant-input {
		background: ${(props: any) => (props.theme === 'dark' ? '#0d0d0d' : '#fff')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
		border-radius: 4px 0px 0px 4px !important;
		height: 40px !important;
		border: ${(props: any) => (props.theme === 'dark' ? '1px solid #4b4b4b' : '1px solid #D2D8E0')} !important;
	}
	.balance-input .ant-input-number-handler-up {
		display: none !important;
	}
	.balance-input .ant-input-number-handler-down {
		display: none !important;
	}
	.balance-input .ant-input-number-group-addon {
		border-radius: 4px !important;
		position: relative;
		right: 2px;
	}
	.balance-input .ant-input-number {
		border: ${(props: any) => (props.theme === 'dark' ? '1px solid #4b4b4b' : '1px solid #D2D8E0')} !important;
	}
	.balance-input .ant-input-number-focused {
		border: 1px solid var(--pink_primary);
	}
	input::placeholder {
		font-weight: 300 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#909090' : '#243A57')} !important;
	}
	.ant-input-group-addon {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#e5007a' : '#edeff3')} !important;
		border: ${(props: any) => (props.theme === 'dark' ? '1px solid #e5007a' : '1px solid #edeff3')} !important;
	}
	.ant-select-selection-item {
		display: flex !important;
	}
`;
