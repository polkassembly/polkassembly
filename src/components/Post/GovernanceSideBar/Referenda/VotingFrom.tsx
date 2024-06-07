// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Form, FormInstance, Select } from 'antd';
import BalanceInput from '~src/ui-components/BalanceInput';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import DownIcon from '~assets/icons/down-icon.svg';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import InfoIcon from '~assets/icons/red-info-alert.svg';

export enum EFormType {
	AYE_NAY_FORM = 'aye-nay-form',
	SPLIT_FORM = 'split-form',
	ABSTAIN_FORM = 'abstain-form'
}
interface Props {
	convictionClassName?: string;
	formName: EFormType;
	form: FormInstance<any>;
	onBalanceChange: (pre: BN) => void;
	onAyeValueChange?: (pre: BN) => void;
	onNayValueChange?: (pre: BN) => void;
	onAbstainValueChange?: (pre: BN) => void;
	handleSubmit: () => void;
	disabled: boolean;
	conviction: number;
	setConviction: (pre: number) => void;
	convictionOpts: ReactNode;
	showMultisig?: any;
	initiatorBalance?: any;
	multisig?: any;
	isBalanceErr?: any;
	loadingStatus?: any;
	wallet?: any;
	ayeVoteValue?: any;
	isProxyExistsOnWallet?: boolean;
	showProxyDropdown?: boolean;
}

const VotingForm = ({
	form,
	formName,
	handleSubmit,
	disabled,
	onBalanceChange,
	onAyeValueChange,
	onNayValueChange,
	onAbstainValueChange,
	convictionOpts,
	conviction,
	setConviction,
	convictionClassName,
	showMultisig,
	initiatorBalance,
	multisig,
	isBalanceErr,
	loadingStatus,
	wallet,
	ayeVoteValue,
	isProxyExistsOnWallet,
	showProxyDropdown
}: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const [isBalanceSet, setIsBalanceSet] = useState(false);
	const ConvictionSelect = ({ className }: { className?: string }) => (
		<Form.Item className={className}>
			<label className='inner-headings dark:text-blue-dark-medium'>Vote lock</label>
			<Select
				onChange={(key) => setConviction(Number(key))}
				size='large'
				className='dark:text-blue-dark-medium dark:[&>.ant-select-selector]:bg-section-dark-overlay'
				defaultValue={conviction}
				suffixIcon={<DownIcon />}
				popupClassName='z-[1060] dark:border-0 dark:border-none dark:bg-section-dark-background'
			>
				{convictionOpts}
			</Select>
		</Form.Item>
	);

	return (
		<Form
			form={form}
			name={formName}
			onFinish={handleSubmit}
			style={{ maxWidth: 600 }}
		>
			{[EFormType.ABSTAIN_FORM].includes(formName) && (
				<>
					<BalanceInput
						label={'Abstain vote value'}
						placeholder={'Add balance'}
						onChange={(balance: BN) => onAbstainValueChange?.(balance)}
						className='text-sm font-medium'
						formItemName={'abstainVote'}
						theme={theme}
					/>
				</>
			)}

			{[EFormType.ABSTAIN_FORM, EFormType.SPLIT_FORM].includes(formName) && (
				<>
					<BalanceInput
						label={'Aye vote value'}
						placeholder={'Add balance'}
						onChange={(balance: BN) => onAyeValueChange?.(balance)}
						className='text-sm font-medium'
						formItemName={'ayeVote'}
						theme={theme}
					/>

					<BalanceInput
						label={'Nay vote value'}
						placeholder={'Add balance'}
						onChange={(balance: BN) => onNayValueChange?.(balance)}
						className='text-sm font-medium'
						formItemName={'nayVote'}
						theme={theme}
						setIsBalanceSet={setIsBalanceSet}
					/>

					{isBalanceSet && (
						<div className='-mt-5 mb-5'>
							{showMultisig ||
								(initiatorBalance && !multisig) ||
								(isBalanceErr && !loadingStatus.isLoading && wallet && ayeVoteValue && (
									<div className='flex items-center gap-x-1'>
										<InfoIcon />
										<p className='m-0 p-0 text-xs text-red_primary'>Insufficient balance</p>
									</div>
								))}
						</div>
					)}
				</>
			)}
			{[EFormType.AYE_NAY_FORM].includes(formName) && (
				<>
					<BalanceInput
						label={'Lock balance'}
						helpText={'Amount of you are willing to lock for this vote.'}
						placeholder={'Add balance'}
						onChange={onBalanceChange}
						className='border-section-light-container text-sm font-medium dark:border-[#3B444F]'
						formItemName='balance'
						theme={theme}
						setIsBalanceSet={setIsBalanceSet}
					/>
					{isBalanceSet && (
						<div className='-mt-5 mb-5'>
							{showMultisig ||
								(initiatorBalance && !multisig) ||
								(isBalanceErr && !loadingStatus.isLoading && wallet && ayeVoteValue && (
									<div className='flex items-center gap-x-1'>
										<InfoIcon />
										<p className='m-0 p-0 text-xs text-red_primary'>Insufficient balance</p>
									</div>
								))}
						</div>
					)}
					<ConvictionSelect className={`${convictionClassName}`} />
				</>
			)}
			<div className='-ml-6 -mr-6 mt-[-1px] flex justify-end border-0 border-t-[1px] border-solid border-section-light-container pt-5 dark:border-[#3B444F]'>
				<CustomButton
					htmlType='submit'
					disabled={disabled || (showProxyDropdown && !isProxyExistsOnWallet)}
					text='Confirm'
					variant='primary'
					buttonsize='xs'
					className={`mr-6 ${(disabled || (showProxyDropdown && !isProxyExistsOnWallet)) && 'opacity-50'} font-semibold`}
				/>
			</div>
		</Form>
	);
};
export default VotingForm;
