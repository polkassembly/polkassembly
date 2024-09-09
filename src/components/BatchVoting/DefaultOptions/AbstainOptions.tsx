// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Form, FormInstance } from 'antd';
import BalanceInput from '~src/ui-components/BalanceInput';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

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

const AbstainOptions = ({ form, formName, handleSubmit, onAyeValueChange, onNayValueChange, className }: Props) => {
	const { resolvedTheme: theme } = useTheme();

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
		>
			<div className={'flex gap-x-[48px]'}>
				{renderBalanceInput('Aye vote value', 'Add balance', onAyeValueChange!, 'ayeVote')}
				{renderBalanceInput('Nay vote value', 'Add balance', onNayValueChange!, 'nayVote')}
			</div>
		</Form>
	);
};

export default styled(AbstainOptions)`
	.ant-slider .ant-slider-mark {
		margin-top: 8px !important;
	}
`;
