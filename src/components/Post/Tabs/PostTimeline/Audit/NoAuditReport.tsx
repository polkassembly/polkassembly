// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
// import NoDataFound from '~assets/no-audits.svg';
import ImageIcon from '~src/ui-components/ImageIcon';

const NoAuditReport = () => {
	return (
		<div className='flex flex-col items-center justify-center gap-y-6'>
			<div className='mt-[75px]'>
				<ImageIcon
					src='/assets/no-audits.svg'
					alt='no audits icon'
				/>
			</div>
			<p className='m-0 text-sm font-medium leading-[21px] tracking-[0.01em] text-blue-light-high dark:text-blue-dark-high'>No audit reports available</p>
		</div>
	);
};

export default NoAuditReport;
