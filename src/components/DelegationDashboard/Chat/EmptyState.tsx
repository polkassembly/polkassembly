// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// EmptyState.tsx
import React from 'react';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';

const EmptyState = () => (
	<div className='mt-14 flex flex-col items-center justify-center gap-4'>
		<DelegateDelegationIcon className='text-[200px]' />
		<div className='flex flex-col items-center gap-5'>
			<span className='text-lightBlue dark:text-blue-dark-high'>No results found</span>
		</div>
	</div>
);

export default EmptyState;
