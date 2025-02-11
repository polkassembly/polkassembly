// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';

const NoAuditReport = () => {
	return (
		<div className='flex flex-col items-center justify-center'>
			<div className='-mt-16'>
				<Image
					src='/assets/Gifs/watering.gif'
					alt='empty state'
					width={450}
					height={450}
					className=''
				/>
			</div>
			<p className='-mt-14 text-sm font-medium leading-[21px] tracking-[0.01em] text-blue-light-high dark:text-blue-dark-high'>No Audit reports available</p>
		</div>
	);
};

export default NoAuditReport;
