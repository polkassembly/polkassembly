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
import { batchVotesActions } from '~src/redux/batchVoting';

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

			{!isUsedInTinderWebView && (formName === EFormType.ABSTAIN_FORM || formName === EFormType.SPLIT_FORM) && (
				<div>
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
									dispatch(batchVotesActions.setIsFieldEdited(true));
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
	.ant-slider .ant-slider-handle::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}
	.ant-slider .ant-slider-handle:hover::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}

	.ant-slider .ant-slider-handle:hover::before,
	.ant-slider .ant-slider-handle:active::before,
	.ant-slider .ant-slider-handle:focus::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}

	.ant-slider .ant-slider-handle::after {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}

	.ant-slider .ant-slider-handle:hover::after,
	.ant-slider .ant-slider-handle:active::after,
	.ant-slider .ant-slider-handle:focus::after {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}
	.ant-slider-horizontal .ant-slider-mark {
		top: 22px;
	}
	.ant-slider .ant-slider-dot {
		width: 3px !important;
		height: 12px !important;
		margin-top: -2px !important;
		border-radius: 0 !important;
	}
`;
