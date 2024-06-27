// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Radio } from 'antd';
import React from 'react';
import { EAllowedCommentor } from '~src/types';
import HelperTooltip from '~src/ui-components/HelperTooltip';

interface Props {
	className?: string;
	onChange: (value: any) => void;
	allowedCommentors: EAllowedCommentor;
	isLoading?: boolean;
}
const AllowedCommentorsRadioButtons = ({ className, allowedCommentors, isLoading, onChange }: Props) => {
	return (
		<div className={className}>
			<div className='flex items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-white'>
				Who can comment{' '}
				<HelperTooltip
					text='Choose who can comment and reply to this post'
					className='font-normal'
				/>
				<span className='text-red-500'>*</span>
			</div>

			<Radio.Group
				onChange={({ target }) => onChange(target?.value)}
				value={allowedCommentors}
				className='radio-input-group mt-2 dark:text-white'
			>
				<Radio
					value={EAllowedCommentor.ALL}
					checked={allowedCommentors === EAllowedCommentor.ALL}
					disabled={isLoading}
					className='capitalize text-lightBlue dark:text-white'
				>
					All Users
				</Radio>
				<Radio
					value={EAllowedCommentor.ONCHAIN_VERIFIED}
					checked={allowedCommentors === EAllowedCommentor.ONCHAIN_VERIFIED}
					disabled={isLoading}
					className='capitalize text-lightBlue dark:text-white'
				>
					Verified Identities
				</Radio>
				<Radio
					value={EAllowedCommentor.NONE}
					checked={allowedCommentors === EAllowedCommentor.NONE}
					disabled={isLoading}
					className='capitalize text-lightBlue dark:text-white'
				>
					Disable Comments
				</Radio>
			</Radio.Group>
		</div>
	);
};
export default AllowedCommentorsRadioButtons;
