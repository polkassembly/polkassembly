// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Radio } from 'antd';
import Delegatees from './DelegateesTab';
import DelegatorsTab from './DelegatorsTab';
import { ETrackLevelDelegationFilters } from '../types';

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
				className='my-5 flex gap-2'
			>
				<Radio
					className={`text-base font-medium ${selectedOption === ETrackLevelDelegationFilters.DELEGATEES ? 'text-blue-light-high' : 'text-bodyBlue'} dark:text-blue-dark-high`}
					value='delegatee'
				>
					Delegatee
				</Radio>
				<Radio
					className={`text-base font-medium ${selectedOption === ETrackLevelDelegationFilters.DELEGATORS ? 'text-blue-light-high' : 'text-bodyBlue'} dark:text-blue-dark-high`}
					value='delegator'
				>
					Delegator
				</Radio>
			</Radio.Group>
			{selectedOption === ETrackLevelDelegationFilters.DELEGATEES ? <Delegatees /> : selectedOption === ETrackLevelDelegationFilters.DELEGATORS ? <DelegatorsTab /> : null}
		</div>
	);
};

export default DelegationTabs;
