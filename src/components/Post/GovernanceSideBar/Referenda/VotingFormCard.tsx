// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Form, FormInstance, Slider, SliderSingleProps } from 'antd';
import BalanceInput from '~src/ui-components/BalanceInput';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import { editBatchValueChanged } from '~src/redux/batchVoting/actions';
import { useAppDispatch } from '~src/redux/store';

export enum EFormType {
	AYE_NAY_FORM = 'aye-nay-form',
	SPLIT_FORM = 'split-form',
	ABSTAIN_FORM = 'abstain-form'
}
interface Props {
	formName: EFormType;
	form: FormInstance<any>;
	handleSubmit: () => void;
	onBalanceChange: (pre: BN) => void;
	onAyeValueChange?: (pre: BN) => void;
	onNayValueChange?: (pre: BN) => void;
	onAbstainValueChange?: (pre: BN) => void;
	className?: string;
}

const VotingFormCard = ({ form, formName, handleSubmit, onBalanceChange, onAyeValueChange, onNayValueChange, onAbstainValueChange, className }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useAppDispatch();
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
					/>
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
					/>
				</>
			)}
			<div>
				<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
					<span className='flex items-center'>Set Conviction</span>
					<Slider
						marks={marks}
						onChange={(e: any) => {
							dispatch(
								editBatchValueChanged({
									values: {
										conviction: e
									}
								})
							);
						}}
						defaultValue={0}
					/>
				</label>
			</div>
		</Form>
	);
};
export default styled(VotingFormCard)`
	.ant-slider .ant-slider-mark {
		margin-top: 8px !important;
	}
`;
