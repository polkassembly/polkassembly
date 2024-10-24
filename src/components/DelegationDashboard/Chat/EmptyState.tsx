// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// EmptyState.tsx
import React from 'react';
import { Button } from 'antd';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface EmptyStateProps {
	searchAddress: string;
	network: string;
	address?: string;
	loading: boolean;
	onChatStart: () => void;
}

const EmptyState = ({ searchAddress, network, address, loading, onChatStart }: EmptyStateProps) => (
	<div className='mt-14 flex flex-col items-center justify-center gap-4'>
		<DelegateDelegationIcon className='text-[200px]' />
		<div className='flex flex-col items-center gap-5'>
			<span className='text-lightBlue dark:text-blue-dark-high'>No results found</span>
			{searchAddress.length > 10 && !!getEncodedAddress(searchAddress, network) && !!address?.length && (
				<Button
					className={`flex h-10 w-full items-center justify-center space-x-2 border-none bg-[#485F7D99] text-sm font-medium tracking-wide text-white ${
						loading ? '' : 'opacity-60'
					}`}
					type='primary'
					onClick={() => onChatStart()}
					disabled={loading}
				>
					<span className='text-white'>Chat with this address</span>
				</Button>
			)}
		</div>
	</div>
);

export default EmptyState;
