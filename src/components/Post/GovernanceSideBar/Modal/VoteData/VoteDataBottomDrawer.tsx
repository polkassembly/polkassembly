// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import VoteDataExpand from './VoteDataExpand';

const VoteDataBottomDrawer = () => {
	return (
		<div
			className=' rounded-2xl border-2 border-red-500 bg-gray-200'
			style={{ bottom: 0, height: '500px', width: '100%', zIndex: 1500 }}
		>
			<VoteDataExpand />
		</div>
	);
};

export default VoteDataBottomDrawer;
