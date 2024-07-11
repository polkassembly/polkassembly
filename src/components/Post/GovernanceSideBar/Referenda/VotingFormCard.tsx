// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Form, FormInstance, Slider, SliderSingleProps } from 'antd';
import BalanceInput from '~src/ui-components/BalanceInput';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import InfoIcon from '~assets/icons/red-info-alert.svg';
import styled from 'styled-components';

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
	className?: string;
}

const VotingFormCard = ({
	form,
	formName,
	handleSubmit,
	onBalanceChange,
	onAyeValueChange,
	onNayValueChange,
	onAbstainValueChange,
	showMultisig,
	initiatorBalance,
	multisig,
	isBalanceErr,
	loadingStatus,
	wallet,
	ayeVoteValue,
	className
}: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const [isBalanceSet, setIsBalanceSet] = useState(false);
	const marks: SliderSingleProps['marks'] = {
		0: '0.1x',
		16.7: '1x',
		33.33: '2x',
		50: '3x',
		66.7: '4x',
		83.33: '5x',
		// eslint-disable-next-line sort-keys
		100: '6x'
	};
	return (
		<Form
			form={form}
			name={formName}
			className={`${className}`}
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
						label={'Set Default Balance'}
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
					<div>
						<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
							<span className='flex items-center'>Set Conviction</span>
							<Slider
								marks={marks}
								onChange={(e: any) => {
									console.log('value set --> ', e);
								}}
								defaultValue={0}
							/>
						</label>
					</div>
				</>
			)}
		</Form>
	);
};
export default styled(VotingFormCard)`
	.ant-slider .ant-slider-mark {
		margin-top: 8px !important;
	}
`;
