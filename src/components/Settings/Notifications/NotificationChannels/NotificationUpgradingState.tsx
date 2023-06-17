// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import PaLogo from '~src/components/AppLayout/PaLogo';

const NotificationUpgradingState = () => {
	return (
		<div className='w-full flex flex-col items-center pt-[18px]'>
			<h3 className='text-[20px]'>Notification are upgrading we will be live within 96 hours</h3>
			<div className='w-[200px]'>
				<PaLogo/>
			</div>
		</div>
	);
};

export default NotificationUpgradingState;
