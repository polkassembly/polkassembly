// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Radio } from 'antd';
import Delegatees from './DelegateesTab';
import DelegatorsTab from './DelegatorsTab';
import { IDelegationTabs } from '../types';

const DelegationTabs = ({ delegateesData, delegatorsData }: IDelegationTabs) => {
	const [selectedOption, setSelectedOption] = useState('delegatee');

	const onRadioChange = (e: any) => {
		setSelectedOption(e.target.value);
	};

	return (
		<div>
			<Radio.Group
				onChange={onRadioChange}
				value={selectedOption}
				className='my-5 flex gap-2'
			>
				<Radio
					className={`text-base font-medium ${selectedOption === 'delegatee' ? 'text-blue-light-high' : 'text-[#243A57B2]'} dark:text-blue-dark-high`}
					value='delegatee'
				>
					Delegatee
				</Radio>
				<Radio
					className={`text-base font-medium ${selectedOption === 'delegator' ? 'text-blue-light-high' : 'text-[#243A57B2]'} dark:text-blue-dark-high`}
					value='delegator'
				>
					Delegator
				</Radio>
			</Radio.Group>
			{selectedOption === 'delegatee' ? <Delegatees delegateesData={delegateesData} /> : selectedOption === 'delegator' ? <DelegatorsTab delegatorsData={delegatorsData} /> : null}
		</div>
	);
};

export default DelegationTabs;
