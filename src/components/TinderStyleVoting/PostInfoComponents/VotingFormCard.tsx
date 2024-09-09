// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Form, FormInstance, Slider, SliderSingleProps } from 'antd';
import BalanceInput from '~src/ui-components/BalanceInput';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import { editBatchValueChanged, editCartPostValueChanged } from '~src/redux/batchVoting/actions';
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
	forSpecificPost?: boolean;
	showConvictionBar?: boolean;
	isUsedInTinderWebView?: boolean;
}

const VotingFormCard = ({
	form,
	formName,
	handleSubmit,
	onBalanceChange,
	onAyeValueChange,
	onNayValueChange,
	onAbstainValueChange,
	className,
	forSpecificPost,
	showConvictionBar,
	isUsedInTinderWebView
}: Props) => {
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

	const getMarkValue = (value: number): string => {
		const markValue = marks[value];
		if (typeof markValue === 'string') {
			return markValue;
		}
		throw new Error(`Invalid mark value: ${markValue}`);
	};

	const renderBalanceInput = (label: string, placeholder: string, onChange: (balance: BN) => void, formItemName: string) => (
		<BalanceInput
			label={label}
			placeholder={placeholder}
			onChange={onChange}
			className='text-sm font-medium'
			formItemName={formItemName}
			theme={theme}
		/>
	);

	return (
		<Form
			form={form}
			name={formName}
			className={`${className}`}
			onFinish={handleSubmit}
			style={{ maxWidth: 600 }}
		>
			{formName === EFormType.ABSTAIN_FORM && renderBalanceInput('Abstain vote value', 'Add balance', onAbstainValueChange!, 'abstainVote')}

			{(formName === EFormType.ABSTAIN_FORM || formName === EFormType.SPLIT_FORM) && (
				<div className={`${isUsedInTinderWebView ? 'flex flex-row gap-x-3' : ''}`}>
					{renderBalanceInput('Aye vote value', 'Add balance', onAyeValueChange!, 'ayeVote')}
					{renderBalanceInput('Nay vote value', 'Add balance', onNayValueChange!, 'nayVote')}
				</div>
			)}

			{formName === EFormType.AYE_NAY_FORM && renderBalanceInput('Set Default Balance', 'Add balance', onBalanceChange, 'balance')}

			{showConvictionBar && (
				<div>
					<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
						<span className='flex items-center'>Set Conviction</span>
						<Slider
							marks={marks}
							step={null}
							className='dark:text-white'
							rootClassName='dark:text-white'
							onChange={(value) => {
								const markValue = getMarkValue(value as number);
								if (!forSpecificPost) {
									dispatch(editBatchValueChanged({ values: { conviction: parseFloat(markValue.replace('x', '')) } }));
								} else {
									dispatch(
										editCartPostValueChanged({
											values: {
												conviction: parseFloat(markValue.replace('x', '')) || 0.1
											}
										})
									);
								}
							}}
							defaultValue={0}
						/>
					</label>
				</div>
			)}
		</Form>
	);
};

export default styled(VotingFormCard)`
	.ant-slider .ant-slider-mark {
		margin-top: 8px !important;
	}
`;
