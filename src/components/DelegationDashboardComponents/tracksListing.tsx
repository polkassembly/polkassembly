// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Radio } from 'antd';
interface Props{
  className?: string;
}

const DashboardTrackListing = ({ className }: Props) => {

	const [inputValue, setInputvalue ] = useState<string>('');

	return <div className={className} >
		<div className='flex font-medium items-center text-sidebarBlue text-xl gap-6'>
      Tracks
			<Radio.Group buttonStyle='solid' defaultValue={'all'} onChange={(e) => setInputvalue(e.target.value)} value={inputValue} className=''>
				<Radio className='text-navBlue text-xs' value={'all'}>All (5)</Radio>
				<Radio className='text-navBlue text-xs' value={'delegated'}>Delegated (2)</Radio>
				<Radio className='text-navBlue text-xs' value={'undelegated'}>Undelegated (9)</Radio>
				<Radio className='text-navBlue text-xs' value={'Received_delegation'}>Received delegation (3)</Radio>
			</Radio.Group>
		</div>
	</div>;
};
export default DashboardTrackListing;