// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Popover } from 'antd';
import { EGovType } from '~src/types';
import { DownArrowIcon } from '~src/ui-components/CustomIcons';

interface Props {
	selectedGov: EGovType;
	setSelectedGov: (pre: EGovType) => void;
	totalCount: number;
	onConfirm?: (pre: EGovType) => void;
}
const SelectGovType = ({ selectedGov, setSelectedGov, totalCount, onConfirm }: Props) => {
	const [govTypeExpand, setgovTypeExpand] = useState(false);

	const govTypeContent = (
		<div className='flex w-[110px] flex-col gap-2'>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => {
					setSelectedGov(EGovType.GOV1);
					onConfirm?.(EGovType.GOV1);
				}}
			>
				Gov1
			</span>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => {
					setSelectedGov(EGovType.OPEN_GOV);
					onConfirm?.(EGovType.OPEN_GOV);
				}}
			>
				OpenGov
			</span>
		</div>
	);
	return (
		<div className=''>
			<Popover
				zIndex={1056}
				content={govTypeContent}
				placement='bottom'
				onOpenChange={() => setgovTypeExpand(!govTypeExpand)}
			>
				<div className='flex h-10 items-center justify-between rounded-md border-[1px] border-solid border-[#DCDFE3] px-3 py-2 text-sm font-medium capitalize text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium'>
					{selectedGov.split('_').join('')}({totalCount})
					<span className='flex items-center'>
						<DownArrowIcon className={`cursor-pointer text-2xl ${govTypeExpand && 'pink-color rotate-180'}`} />
					</span>
				</div>
			</Popover>
		</div>
	);
};

export default SelectGovType;
