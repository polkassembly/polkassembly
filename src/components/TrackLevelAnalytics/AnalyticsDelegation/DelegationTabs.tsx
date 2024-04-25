// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Radio } from 'antd';
import DelegatorsTab from './DelegatorsTab';
import { ETrackLevelDelegationFilters } from '../types';
import DelegateesTab from './DelegateesTab';

const DelegationTabs = () => {
	const [selectedOption, setSelectedOption] = useState(ETrackLevelDelegationFilters.DELEGATEES);

	const onRadioChange = (e: any) => {
		setSelectedOption(e.target.value);
	};

	return (
		<div>
			<Radio.Group
				onChange={onRadioChange}
				value={selectedOption}
				className='my-5 flex sm:gap-2'
			>
				<Radio
					className={`text-xs font-medium sm:text-sm ${
						selectedOption === ETrackLevelDelegationFilters.DELEGATEES ? 'text-blue-light-high' : 'text-[#243A57B2]'
					} dark:text-blue-dark-high`}
					value={ETrackLevelDelegationFilters.DELEGATEES}
				>
					Delegatee
				</Radio>
				<Radio
					className={`text-xs font-medium sm:text-sm ${
						selectedOption === ETrackLevelDelegationFilters.DELEGATORS ? 'text-blue-light-high' : 'text-[#243A57B2]'
					} dark:text-blue-dark-high`}
					value={ETrackLevelDelegationFilters.DELEGATORS}
				>
					Delegator
				</Radio>
			</Radio.Group>
			{selectedOption === ETrackLevelDelegationFilters.DELEGATEES ? <DelegateesTab /> : selectedOption === ETrackLevelDelegationFilters.DELEGATORS ? <DelegatorsTab /> : null}
		</div>
	);
};

export default DelegationTabs;
